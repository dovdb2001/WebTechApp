const courseCode = window.location.href.substring(window.location.href.lastIndexOf("/") + 1);
var course;
var enrollmentMode = "NA";

var btn = document.createElement("button");
btn.addEventListener("click", btnPressed);

getCourse();
enrollment();

function getCourse() {
    var req = new XMLHttpRequest()
    req.open("GET", "/course-info/" + courseCode, true);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            course = JSON.parse(req.responseText)[0];
            drawCourse();
        }
    }
    req.send();
}

function drawCourse() {
    var title = document.createElement("h1");
    title.textContent = "Course details: " + course.code;
    document.getElementById("table").before(title);

    (document.getElementById("title")).append(document.createTextNode(course.title));
    (document.getElementById("code")).append(document.createTextNode(course.code));
    (document.getElementById("programme")).append(document.createTextNode(course.programme));
    (document.getElementById("level")).append(document.createTextNode(course.level));
    (document.getElementById("faculty")).append(document.createTextNode(course.faculty));
    (document.getElementById("semester")).append(document.createTextNode(course.semester));
    (document.getElementById("description")).append(document.createTextNode(course.description));
}

function enrollment() {
    var req = new XMLHttpRequest()
    req.open("GET", "/enrollable/" + courseCode, true);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            enrollmentMode = req.responseText;
            addEnrollment();
        }
    }
    req.send();
}


function addEnrollment() {
    if (enrollmentMode == "enroll" || enrollmentMode == "leave") {
        btn.textContent = enrollmentMode;
        document.body.append(btn);
    }
}

function btnPressed(event) {
    var req = new XMLHttpRequest();
    req.open("POST", "/" + enrollmentMode + "/" + courseCode, true);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            alert(req.responseText);
            enrollment();
        }
    }
    req.send();
}


