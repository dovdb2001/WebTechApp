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

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/index.html"));
});

app.get("/browse", (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "/views/browse.html"));
    } else {
        res.redirect("/");
    }
});

app.get("/logout", (req, res) => {
    req.session.user = undefined;
    res.redirect("/")
});

app.get("/courses/:chuck", (req, res) => {
    const db = new sqlite3.Database(dbfile);
    db.all("SELECT * FROM course", (err, rows) => {
        const start = req.params.chuck * 10;
        var subset = rows.slice(start, start + 10);
        res.send(subset);
    });
    db.close();
});

app.get("/courses", (req, res) => {
    const db = new sqlite3.Database(dbfile);
    db.all("SELECT * FROM course", (err, rows) => {
        res.send(rows);
    });
    db.close();
});

app.get("/details/:code", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/course-details.html"), {data: "hello"});
});



// --- // login & registering

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/login.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/register.html"));
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








































