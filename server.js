/* eslint-env node, es6 */
const express = require("express");
const path = require("path");

var app = express();

var server = app.listen (3000);

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/index.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/login.html"));
});
