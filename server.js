/* eslint-env node, es6 */
const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

const app = express();
const server = app.listen (3000);

var users = [{id: '1585404001350', name: 'Michael', email: 'michael@gmail.com', password: '$2a$10$Dib4CtBAA6VN/ROBY4hK7er/Gkv6uPgyCQeRfPTur2A3jZ85KKfXe'}]; //password = 'pwd'

app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));

var dbfile = path.join(__dirname, "/database/main.db");
//var db = new sqlite3.Database(dbfile);
//db.close();


app.get("/main.css", (req, res) => {
    res.sendFile(path.join(__dirname, "/main.css"));
});


app.get("/", (req, res) => {
    console.log(req.session.user);

    var db = new sqlite3.Database(dbfile);
    db.each("SELECT * FROM student WHERE first_name = 'Michael'", (err, row) => {
        console.log(row);
    });
    db.close();




    res.sendFile(path.join(__dirname, "/views/index.html"));
});

app.get("/login", (req, res) => {
    console.log(req.session.user);
    res.sendFile(path.join(__dirname, "/views/login.html"));
});

app.get("/register", (req, res) => {
    console.log(req.session.user);
    res.sendFile(path.join(__dirname, "/views/register.html"));
});

app.get("/browse", (req, res) => {
    console.log(req.session.user);
    if (req.session.user === 2020) {
        res.sendFile(path.join(__dirname, "/views/browse.html"));
    } else {
        res.redirect("/");
    }
});

app.get("/logout", (req, res) => {
    req.session.user = undefined;
    res.redirect("/")
});

app.post("/register", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        res.redirect("/login");
    } catch {
        res.redirect("/register");
    }
    console.log(users);
});


app.post("/login", async (req, res) => {
    console.log(req.body.email);
    console.log(req.body.password);

    const stored_pwd = (users.find(x => x.email === req.body.email)).password;
    //const given_pwd = await bcrypt.hash(req.body.password, 10);

    console.log(stored_pwd);
    //console.log(given_pwd);

    if (await bcrypt.compare(req.body.password, stored_pwd)) {
        req.session.user = 2020;
        res.redirect("/browse");
    } else {
        req.session.user = undefined;
        res.redirect("/login");
    }
});

















