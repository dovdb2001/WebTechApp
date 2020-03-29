
let title = document.createElement("h2");
title.textContent = "The Courses";
document.getElementById("courses").append(title);

//(document.getElementById("btn")).addEventListener("click", buttonPressed);
(document.getElementById("btn")).onclick = () => {pressed();}
var chuck = 0;


function pressed() {
    console.log("did press" + chuck);
    getCourses();
}

function getCourses() {
    var req = new XMLHttpRequest()
    req.open("GET", "/courses/" + chuck, true);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            addCourses(JSON.parse(req.responseText));
        }
    }
    req.send();

    if (chuck < 4) {
        chuck++;
    }
}

function addCourses(courses) {
    for (let i = 0; i < courses.length; i++) {
        addTextNode(courses[i].code, document.getElementById("courses"));
    }
}

function addTextNode(text, body) {
    body.append(document.createTextNode(text));
    body.append(document.createElement("br"));
    console.log("finisched");
}
