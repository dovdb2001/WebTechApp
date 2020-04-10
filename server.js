/* eslint-env node, es6 */
const express = require("express");             // is used for the http webserver
const path = require("path");                   // is used to create absolute paths to resources
const bcrypt = require("bcryptjs");             // is used to hash the users' passwords that are stored in the database
const session = require("express-session");     // is used to manage the sessions
const sqlite3 = require("sqlite3").verbose();   // is used for the database
const morgan = require('morgan');               // is used as logger
const fs = require("fs");                       // is used to write the output of the logger to file (access.log in our case)
const sanitizer = require("sanitizer");         // is used to escape any dangerous character
const favicon = require("serve-favicon");       // is used to serve the fav icon.ico

const app = express();
const server = app.listen (3000);
const dbfile = path.join(__dirname, "/database/main.db");   // the path to the database file

app.use(favicon(path.join(__dirname, "/public/favicon.ico")));
app.use(express.urlencoded({extended: false}));
app.use(express.static("public"));
app.use(morgan(":method :url :status :res[content-length] - :response-time ms", {stream: fs.createWriteStream('./access.log', {flags: "a"})}));
app.use(morgan("dev"));
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));


// --- // public pages // no database access

// if the user is not logged in index.html is send to the user. if the user is logged in, the user will be redirected to /browse
app.get("/", (req, res) => {
    if (req.session.user) {
        res.redirect("/browse");
    } else {
        res.sendFile(path.join(__dirname, "/views/index.html"));
    }
});

// if the user is not logged in course-details.html is send to the user. if the user is logged in, the user will be redirected to /browse/courses/ and than the requested course code
app.get("/courses/:code", (req, res) => {
    if (req.session.user) {
        res.redirect("/browse/courses/" + req.params.code);
    } else {
        res.sendFile(path.join(__dirname, "/views/course-details.html"));
    }
});


// --- // getting specific information // 5 methods sql & xss protected

// sends an JSON object with all information from the database pretending to the course with the requested code
app.get("/course-info/:code", (req, res) => {
    const db = new sqlite3.Database(dbfile);
    db.all("SELECT * FROM course WHERE code = ?", sanitizer.sanitize(req.params.code), (err, rows) => {
        res.send(rows);
    });
    db.close();
});

// sends an array of JSON objects, each JSON object is an course. the array is filled based on the selected programme level and semester and any title that (partially) matches the given title. The array is sorted as required by the assignment, and the block variable indicates how many courses are already being displayed by the client
app.get("/courses/:title/:programme/:level/:semester/:block", (req, res) => {
    var stmt = "SELECT * FROM course ";
    var end = "";
    var values = [];

    if (req.params.title && req.params.title != "*") {
        end += "title LIKE ? ";
        values.push(sanitizer.sanitize("%" + req.params.title + "%"));
    }
    if (req.params.programme != "*") {
        if (values.length > 0) {
            end += "AND ";
        }
        end += "programme = ? ";
        values.push(sanitizer.sanitize(req.params.programme));
    }
    if (req.params.level != "*") {
        if (values.length > 0) {
            end += "AND ";
        }
        end += "level = ? ";
        values.push(sanitizer.sanitize(req.params.level));
    }
    if (req.params.semester != "*") {
        if (values.length > 0) {
            end += "AND ";
        }
        end += "semester = ? ";
        values.push(sanitizer.sanitize(req.params.semester));
    }

    if (values.length > 0) {
        stmt += "WHERE " + end;
    }

    stmt += " ORDER BY programme, level, semester, title";


    const db = new sqlite3.Database(dbfile);
    db.all(stmt, values, (err, rows) => {
        if (rows != undefined) {
            const start = req.params.block * 10;
            var subset = rows.slice(start, start + 10);
            res.send(subset);
        } else {
            res.send([]);
        }
    });
    db.close();

});

// sends an JSON object with the account infomation of the user, only if the user is logged in. if the user is not logged in, no information will be send (of course)
app.get("/account/info", (req, res) => {
    if (req.session.user) {
        const db = new sqlite3.Database(dbfile);
        db.all("SELECT student_number, first_name, last_name, programme, academic_level FROM student WHERE student_number = ?", sanitizer.sanitize(req.session.user), (err, rows) => {
            res.send(rows);
        });
        db.close();
    } else {
        res.send("You must be logged in to access account information");
    }
});

// sends an array of JSON object consisting of course codes corresponding to the courses that the user is currently enrolled in, only if the user is logged in. if the user is not logged in, no information will be send (of course)
app.get("/account/courses", (req, res) => {
    if (req.session.user) {
        const db = new sqlite3.Database(dbfile);
        db.all("SELECT * FROM enrolled WHERE student_number = ?", sanitizer.sanitize(req.session.user), (err, rows) => {
            res.send(rows);
        });
        db.close();
    } else {
        res.send("You must be logged in to access account information");
    }
});

// checks if the user can inroll in a given course, if the user is not logged in the response is 'NA'. if the user is logged in but the programme and/or the acadamic level doesn't match the response is 'NA'. if the user is logged in and programme and level matches the the response is 'true', if the user is logged in and programme and level matches and the user is already inrolled in the course, the response is 'false'
app.get("/enrollable/:code", (req, res) => {
    if (req.session.user) {
        const db = new sqlite3.Database(dbfile);
        db.get("SELECT * FROM course WHERE code = ?", sanitizer.sanitize(req.params.code), (err, course) => {
            db.get("SELECT * FROM student WHERE student_number = ?", sanitizer.sanitize(req.session.user), (err, student) => {
                db.get("SELECT * FROM enrolled WHERE course_code = ? AND student_number = ?", [sanitizer.sanitize(req.params.code), sanitizer.sanitize(req.session.user)], (err, row) => {
                    if (course.programme == student.programme && course.level == student.academic_level && row == undefined) {
                        res.send("enroll");
                    } else if (course.programme == student.programme && course.level == student.academic_level && row != undefined) {
                        res.send("leave");
                    } else {
                        res.send("NA");
                    }
                });
            });
        });
        db.close();
    } else {
        res.send("You must be logged in to access account information");
    }
});


// -- // updating account info // all 4 methods sql & xss protected

// only if the user is logged in will the account of the user be updated with the given new attributes
app.post("/account/update/info", (req, res) => {
    if (req.session.user) {
        updateInformation(req);
        res.redirect("/account");
    } else {
        res.send("You must be logged in to access account information");
    }
});

// only if the user is logged in, the old password was entered correctly and the two new given passwords match, will the password of the user be updated with the given new password
app.post("/account/update/pwd", (req, res) => {
    if (req.session.user) {
        const db = new sqlite3.Database(dbfile);
        db.all("SELECT * FROM student WHERE student_number = ?", sanitizer.sanitize(req.session.user), async (err, rows) => {
            if (await bcrypt.compare(req.body.old_password, rows[0].password)) {
                if (req.body.new_password == req.body.confirm_new_password) {
                    updatePassword(req.session.user, req.body.new_password);
                    res.redirect("/account");
                } else {
                    // new passwords don't match
                    res.redirect("/account/update");
                }
            } else {
                // old password incorrect
                res.redirect("/account/update");
            }
        });
        db.close();
    } else {
        res.send("You must be logged in to access account information");
    }
});

// hashes the new password and updates the database
async function updatePassword(student_number, new_password) {
    const hashedPassword = await bcrypt.hash(new_password, 10);
    const db = new sqlite3.Database(dbfile);
    db.run("UPDATE student SET password = ? WHERE student_number = ?", [sanitizer.sanitize(hashedPassword), sanitizer.sanitize(student_number)]);
    db.close();
}

// update the information of the user in the databse
function updateInformation(req) {
    var levelProgramme = (req.body.level_programme).split("|");
    const db = new sqlite3.Database(dbfile);
    db.run("UPDATE student SET first_name = ?, last_name = ?, programme = ?, academic_level = ? WHERE student_number = ?", [sanitizer.sanitize(req.body.first_name), sanitizer.sanitize(req.body.last_name), sanitizer.sanitize(levelProgramme[1]), sanitizer.sanitize(levelProgramme[0]), sanitizer.sanitize(req.session.user)]);
    db.close();

    verifyEnrolledCourses(req.session.user, req.body.level, req.body.programme)
}

// unenrolls the user from any course that does not match the given level and programme
function verifyEnrolledCourses(student_number, level, programme) {  // new level and new programme
    const db = new sqlite3.Database(dbfile);
    db.run("DELETE FROM enrolled WHERE course_code NOT IN (SELECT code FROM course WHERE programme = ? AND level = ?)", [sanitizer.sanitize(programme), sanitizer.sanitize(level)]);
    db.close();
}


// -- // enrolling and leaving courses // 2 methods sql & xss protected

// only if the user is logged in will the user be enrolled in the course with the given code
app.post("/enroll/:code", (req, res) => {
    if (req.session.user) {
        const db = new sqlite3.Database(dbfile);
        db.run("INSERT INTO enrolled VALUES (?, ?)", [sanitizer.sanitize(req.session.user), sanitizer.sanitize(req.params.code)]);
        db.close();
        res.send("succes!");
    } else {
        res.send("You must be logged in to access account information");
    }
});

// only if the user is logged in will the user be unenrolled from the course with the given code
app.post("/leave/:code", (req, res) => {
    if (req.session.user) {
        const db = new sqlite3.Database(dbfile);
        db.run("DELETE FROM enrolled WHERE course_code = ? AND student_number = ?", [sanitizer.sanitize(req.params.code), sanitizer.sanitize(req.session.user)]);
        db.close();
        res.send("succes!");
    } else {
        res.send("You must be logged in to access account information");
    }
});


// -- // adding and getting reviews // all 3 methods sql & xss protected

// returns an array of reviews relevant to the course with the given code
app.get("/reviews/:code", (req, res) => {
    const db = new sqlite3.Database(dbfile);
    db.all("SELECT * FROM ( SELECT * FROM review NATURAL JOIN ( SELECT student_number, first_name FROM student ) ) WHERE course_code = ?", sanitizer.sanitize(req.params.code), (err, rows) => {
        res.send(rows);
    });
    db.close();
});

// returns the average rating for a course based on that course's reviews
app.get("/reviews/rating/:code", (req, res) => {
    const db = new sqlite3.Database(dbfile);
    db.all("SELECT rating FROM review WHERE course_code = ? ", sanitizer.sanitize(req.params.code), (err, rows) => {

        if (rows.length == 0) {
            res.send(0);
        } else {
            var total = 0;
            for (var i = 0; i < rows.length; i++) {
                total += rows[i].rating;
            }
            var avg = total / rows.length;
            res.send(avg.toFixed(1));
        }
    });
    db.close();
});

// only if the user is logged in will a review be added, for the given course, to the database
app.post("/reviews/add/:code", (req, res) => {
    if (req.session.user) {
        const db = new sqlite3.Database(dbfile);
        db.all("SELECT * FROM review", (err, rows) => {
            db.run("INSERT INTO review VALUES (?, ?, ?, ?, ?)", [sanitizer.sanitize(req.session.user), sanitizer.sanitize(req.params.code), sanitizer.sanitize(req.body.rating), sanitizer.sanitize(req.body.content), rows.length]);
        });
        db.close();
        res.redirect("/browse/courses/" + req.params.code);
    } else {
        res.send("You must be logged in to review a course");
    }
});


// --- // protected pages // no database access

// if the user is logged in /views/account.html is send to the user. if the user is not logged in, the user will be redirected to /
app.get("/account", (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "/views/account.html"));
    } else {
        res.redirect("/");
    }
});

// if the user is logged in /views/account-update.html is send to the user. if the user is not logged in, the user will be redirected to /
app.get("/account/update", (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "/views/account-update.html"));
    } else {
        res.redirect("/");
    }
});

// if the user is logged in /views/enrolled-courses.html is send to the user. if the user is not logged in, the user will be redirected to /
app.get("/enrolled-courses", (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "/views/enrolled-courses.html"));
    } else {
        res.redirect("/");
    }
});

// if the user is logged in /views/browse.html is send to the user. if the user is not logged in, the user will be redirected to /
app.get("/browse", (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "/views/browse.html"));
    } else {
        res.redirect("/");
    }
});

// if the user is logged in /views/course-information.html is send to the user. if the user is not logged in, the user will be redirected to /courses/:code
app.get("/browse/courses/:code", (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "/views/course-information.html"));
    } else {
        res.redirect("/courses/" + req.params.code);
    }
});


// --- // login, logout & registering // all 3 methods sql & xss protected

// if the user is not logged in /views/login.html is send to the user. if the user is logged in, the user will be redirected to /browse
app.get("/login", (req, res) => {
    if (req.session.user) {
       res.redirect("/browse");
    } else {
       res.sendFile(path.join(__dirname, "/views/login.html"));
    }
});

// if the user is not logged in /views/register.html is send to the user. if the user is logged in, the user will be redirected to /browse
app.get("/register", (req, res) => {
    if (req.session.user) {
       res.redirect("/browse");
    } else {
       res.sendFile(path.join(__dirname, "/views/register.html"));
    }
});

// the session variable user is reset
app.get("/logout", (req, res) => {
    req.session.user = undefined;
    res.redirect("/")
});

// the given attributes for a new account are checked, if no errors are found the new user is create and added to the database and the client is redirected to /login. if there is an error if the entered attributes the client is redirected back to /register
app.post("/register", (req, res) => {
    if (req.body.password == req.body.confirm_password && (req.body.student_number.toString()).length == 7) {
        const db = new sqlite3.Database(dbfile);
        db.all("SELECT * FROM student WHERE student_number = ?", sanitizer.sanitize(req.body.student_number), (err, rows) => {
            if (rows.length == 0) {
                createUser(req);
                res.redirect("/login");
            } else {
                // student number already exists
                res.redirect("/register");
            }
        });
        db.close();
    } else {
        // passwords do not match
        res.redirect("/register");
    }
});

// a new user is created and added to the database
async function createUser (req) {
    var levelProgramme = (req.body.level_programme).split("|");
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = [sanitizer.sanitize(req.body.student_number), sanitizer.sanitize(hashedPassword), sanitizer.sanitize(req.body.first_name), sanitizer.sanitize(req.body.last_name), sanitizer.sanitize(levelProgramme[1]), sanitizer.sanitize(levelProgramme[0])];

    const db = new sqlite3.Database(dbfile);
    db.run("INSERT INTO student VALUES (?, ?, ?, ?, ?, ?)", user);
    db.close();
}

// if student number and password combination is valid the user will be redirected to /browse, if the student number and password combination in invalid the client will be redirected back to /login
app.post("/login", async (req, res) => {
    const db = new sqlite3.Database(dbfile);
    db.all("SELECT * FROM student WHERE student_number = ?", sanitizer.sanitize(req.body.student_number), async (err, rows) => {
        if (rows.count == 0) {
            // student number not found
            req.session.user = undefined;
            res.redirect("/login");
        } else {

            if (await bcrypt.compare(req.body.password, rows[0].password)) {
                req.session.user = req.body.student_number;
                res.redirect("/browse");
            } else {
                req.session.user = undefined;
                res.redirect("/login");
            }

        }
    });
    db.close();
});


// -- // 404 not found

// if the requested page cannot be found /views/not-found.html is send to the user. the user is also preemptively logged out
app.get('*', function(req, res){
    req.session.user = undefined;
    res.sendFile(path.join(__dirname, "/views/not-found.html"));
});
