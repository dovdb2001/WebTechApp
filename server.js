/* eslint-env node, es6 */
const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const server = app.listen (3000);
const dbfile = path.join(__dirname, "/database/main.db");

//password = 'pwd'

app.use(express.urlencoded({extended: false}));
app.use(express.static("public"));
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));

// --- // public pages

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/index.html"));
});

app.get("/courses/:code", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/course-details.html"));
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
        const start = req.params.block * 10;
        var subset = rows.slice(start, start + 10);
        res.send(subset);
    });
    db.close();

});

app.get("/account/info", (req, res) => {
    if (req.session.user) {
        const db = new sqlite3.Database(dbfile);
        db.all("SELECT * FROM student WHERE student_number = " + req.session.user, (err, rows) => {
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


// -- // enrolling and leaving courses

app.post("/enroll/:code", (req, res) => {
    if (req.session.user) {
        const db = new sqlite3.Database(dbfile);
        const c = "SELECT programme FROM course WHERE code = '" + req.params.code + "'";
        const u = "SELECT programme FROM student WHERE student_number = " + req.session.user;

        db.all(c, (err, rows1) => {
            db.all(u, (err, rows2) => {
                console.log(rows2, rows1);
                if (rows1.programme == rows2.programme) {
                    enroll(req.session.user, req.params.code);
                    res.send("enrolled!");
                } else {
                    res.send("an error occured");
                }
            });
        });
        db.close();
    } else {
        res.send("You must be logged in to access account information");
    }
});

function enroll (student_number, course_code) {
    const db = new sqlite3.Database(dbfile);
    db.run("INSERT INTO enrolled VALUES (?, ?)", [student_number, course_code]);
    db.close();
}

app.post("/leave/:code", (req, res) => {
    if (req.session.user) {
        const db = new sqlite3.Database(dbfile);
        db.run("DELETE FROM enrolled WHERE course_code = '" + req.params.code + "' AND student_number = " + req.session.user);
        db.close();
        res.send("left!");
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
        res.redirect("/course/" + req.params.code);
    }
});

app.get("/auth", (req, res) => {
   if (req.session.user) {
       res.send("true");
   } else {
       res.send("false");
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








































