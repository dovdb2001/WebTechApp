
let title = document.createElement("h2");
title.textContent = "The Courses";
document.getElementById("courses").append(title);

document.getElementById("btn").addEventListener("click", buttonPressed);
var chuck = 0;

function buttonPressed() {
    var req = new XMLHttpRequest()
    req.open("GET", "/courses/all", true);
    req.onreadystatechange = function () {
        console.log(req.responseText);
    }
    req.send();
}
