
let title = document.createElement("h2");
title.textContent = "The Courses";
document.getElementById("courses").append(title);

(document.getElementById("btn")).addEventListener("click", pressed);
var chuck = 0;

getCourses();

function pressed() {
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
    } else {
        (document.getElementById("btn")).disabled = true;
    }
}

function addCourses(courses) {
    for (let i = 0; i < courses.length; i++) {
        addCourse(courses[i], document.getElementById("courses"));
    }
}

function addTextNode(text, body) {
    body.append(document.createTextNode(text));
    body.append(document.createElement("br"));
}

function addCourse(course, body) {
    var div = document.createElement("div");
    div.addEventListener("click", didSelectCourse);
    div.id = course.code;

    addTextNode(course.title, div);
    addTextNode(course.code, div);
    addTextNode(course.programme, div);
    addTextNode(course.level, div);
    addTextNode("semester: " + course.semester, div);

    body.append(div);
}

function didSelectCourse(event) {
    window.location.replace("/details/" + event.target.id);
}











