/* eslint-env node, es6 */
const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const morgan = require('morgan');
const fs = require("fs");

const app = express();
const server = app.listen (3000);
const dbfile = path.join(__dirname, "/database/main.db");

app.use(express.urlencoded({extended: false}));
app.use(express.static("public"));
app.use(morgan(":method :url :status :res[content-length] - :response-time ms", {stream: fs.createWriteStream('./access.log', {flags: "a"})}));
app.use(morgan("dev"));
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));


// --- // public pages

app.get("/", (req, res) => {
    if (req.session.user) {
        res.redirect("/browse");
    } else {
        res.sendFile(path.join(__dirname, "/views/index.html"));
    }
});

app.get("/courses/:code", (req, res) => {
    if (req.session.user) {
        res.redirect("/browse/courses/" + req.params.code);
    } else {
        res.sendFile(path.join(__dirname, "/views/course-details.html"));
    }
});


// --- // getting specific information

app.get("/course-info/:code", (req, res) => {
    const db = new sqlite3.Database(dbfile);
    db.all("SELECT * FROM course WHERE code = '" + req.params.code + "'", (err, rows) => {
        res.send(rows);
    });
    db.close();
});

app.get("/courses/:title/:programme/:level/:semester/:block", (req, res) => {
    var stmt = "SELECT * FROM course ";
    if (req.params.title && req.params.title != "*") {
        stmt += "WHERE title LIKE '%" + req.params.title + "%'";
    }
    if (req.params.programme != "*") {
        stmt += "WHERE programme = '" + req.params.programme + "'";
    }
    if (req.params.level != "*") {
        stmt += "WHERE level = '" + req.params.level + "'";
    }
    if (req.params.semester != "*") {
        stmt += "WHERE semester = " + req.params.semester ;
    }

    stmt += " ORDER BY programme, level, semester, title";

    const db = new sqlite3.Database(dbfile);
    db.all(stmt, (err, rows) => {
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

app.get("/account/info", (req, res) => {
    if (req.session.user) {
        const db = new sqlite3.Database(dbfile);
        db.all("SELECT student_number, first_name, last_name, programme, academic_level FROM student WHERE student_number = " + req.session.user, (err, rows) => {
            res.send(rows);
        });
        db.close();
    } else {
        res.send("You must be logged in to access account information");
    }
});

app.get("/account/courses", (req, res) => {
    if (req.session.user) {
        const db = new sqlite3.Database(dbfile);
        db.all("SELECT * FROM enrolled WHERE student_number = " + req.session.user, (err, rows) => {
            res.send(rows);
        });
        db.close();
    } else {
        res.send("You must be logged in to access account information");
    }
});

app.get("/enrollable/:code", (req, res) => {
    if (req.session.user) {
        const db = new sqlite3.Database(dbfile);
        db.get("SELECT * FROM course WHERE code = '" + req.params.code + "'", (err, course) => {
            db.get("SELECT * FROM student WHERE student_number = " + req.session.user, (err, student) => {
                db.get("SELECT * FROM enrolled WHERE course_code = '" + req.params.code + "' AND student_number = " + req.session.user, (err, row) => {
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


// -- // updating account info

app.post("/account/update/info", (req, res) => {
    if (req.session.user) {
        updateInformation(req);
        res.redirect("/account");
    } else {
        res.send("You must be logged in to access account information");
    }
});

app.post("/account/update/pwd", (req, res) => {
    if (req.session.user) {
        const db = new sqlite3.Database(dbfile);
        db.all("SELECT * FROM student WHERE student_number = " + req.session.user, async (err, rows) => {
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


    // first check if old password is valid

    // check if the two new passwords are equal

    // update the password
});

async function updatePassword(student_number, new_password) {
    const hashedPassword = await bcrypt.hash(new_password, 10);
    const db = new sqlite3.Database(dbfile);
    db.run("UPDATE student SET password = '" + hashedPassword + "' WHERE student_number = " + student_number);
    db.close();
}

function updateInformation(req) {
    const db = new sqlite3.Database(dbfile);
    db.run("UPDATE student SET first_name = '" + req.body.first_name + "', last_name = '" + req.body.last_name + "', programme = '" + req.body.programme + "', academic_level = '" + req.body.level + "' WHERE student_number = " + req.session.user);
    db.close();

    verifyEnrolledCourses(req.session.user, req.body.level, req.body.programme)
}

function verifyEnrolledCourses(student_number, level, programme) {  // new level and new programme
    const db = new sqlite3.Database(dbfile);
    db.run("DELETE FROM enrolled WHERE course_code NOT IN (SELECT code FROM course WHERE programme = '" + programme + "' AND level = '" + level + "')");
    db.close();
}

// -- // enrolling and leaving courses

app.post("/enroll/:code", (req, res) => {
    if (req.session.user) {
        const db = new sqlite3.Database(dbfile);
        db.run("INSERT INTO enrolled VALUES (?, ?)", [req.session.user, req.params.code]);
        db.close();
        res.send("succes!");
    } else {
        res.send("You must be logged in to access account information");
    }
});

app.post("/leave/:code", (req, res) => {
    if (req.session.user) {
        const db = new sqlite3.Database(dbfile);
        db.run("DELETE FROM enrolled WHERE course_code = '" + req.params.code + "' AND student_number = " + req.session.user);
        db.close();
        res.send("succes!");
    } else {
        res.send("You must be logged in to access account information");
    }
});


// --- // protected pages

app.get("/account", (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "/views/account.html"));
    } else {
        res.redirect("/");
    }
});

app.get("/account/update", (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "/views/account-update.html"));
    } else {
        res.redirect("/");
    }
});

app.get("/enrolled-courses", (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "/views/enrolled-courses.html"));
    } else {
        res.redirect("/");
    }
});

app.get("/browse", (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "/views/browse.html"));
    } else {
        res.redirect("/");
    }
});

app.get("/browse/courses/:code", (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "/views/course-information.html"));
    } else {
        res.redirect("/courses/" + req.params.code);
    }
});


// --- // login, logout & registering

app.get("/login", (req, res) => {
    if (req.session.user) {
       res.redirect("/");
    } else {
       res.sendFile(path.join(__dirname, "/views/login.html"));
    }
});

app.get("/register", (req, res) => {
    if (req.session.user) {
       res.redirect("/");
    } else {
       res.sendFile(path.join(__dirname, "/views/register.html"));
    }
});

app.get("/logout", (req, res) => {
    req.session.user = undefined;
    res.redirect("/")
});

app.post("/register", (req, res) => {
    if (req.body.password == req.body.confirm_password) {
        const db = new sqlite3.Database(dbfile);
        db.all("SELECT * FROM student WHERE student_number = " + req.body.student_number, (err, rows) => {
            if (rows.length == 0) {
                createUser(req);
                res.redirect("/login");
            } else {
                // student number already exists
                console.log("student number already exists");
                res.redirect("/register");
            }
        });
        db.close();
    } else {
        // passwords do not match
        console.log("passwords do not match");
        res.redirect("/register");
    }
});

async function createUser (req) {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = [req.body.student_number, hashedPassword, req.body.first_name, req.body.last_name, req.body.programme, req.body.level];

    const db = new sqlite3.Database(dbfile);
    db.run("INSERT INTO student VALUES (?, ?, ?, ?, ?, ?)", user);
    db.close();
}

app.post("/login", async (req, res) => {
    const db = new sqlite3.Database(dbfile);
    db.all("SELECT * FROM student WHERE student_number = " + req.body.student_number, async (err, rows) => {
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








































