const courseCode = window.location.href.substring(window.location.href.lastIndexOf("/") + 1);
var course;

getCourse();
enrollment();

function getCourse() {
    var req = new XMLHttpRequest()
    req.open("GET", "/course-info/" + courseCode, true);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            course = JSON.parse(req.responseText);
            drawCourse();
            console.log(course);
        }
    }
    req.send();
}

function drawCourse() {

}

function enrollment() {
    var req = new XMLHttpRequest()
    req.open("GET", "/enrollable/" + courseCode, true);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            console.log(req.responseText);
        }
    }
    req.send();
}

/*
function drawEnrollment(mode) {
    var form = document.createElement("form");
    form.method = "POST";
    var btn = document.createElement("button");
    btn.type = "submit";
    form.append(btn);

    if (mode == "enroll") {
        form.action = "/enroll/" + courseCode;
        btn.textContent = "enroll";
    } else {
        form.action = "/leave/" + courseCode;
        btn.textContent = "leave";
    }
    document.body.append(form);
}*/

