/* eslint-env node, es6 */
var express = require("express");

var app = express();

var server = app.listen (3000);

app.use(express.static("public"));
