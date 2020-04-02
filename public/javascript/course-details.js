const courseCode = window.location.href.substring(window.location.href.lastIndexOf("/") + 1);
var course;
var enrollmentMode = "NA";

var btn = document.createElement("button");
btn.addEventListener("click", btnPressed);
document.body.append(btn);

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
            enrollmentMode = req.responseText;
            addEnrollment();
        }
    }
    req.send();
}


function addEnrollment() {
    if (enrollmentMode == "enroll" || enrollmentMode == "leave") {
        btn.textContent = enrollmentMode;
    }
}

function btnPressed(event) {
    var req = new XMLHttpRequest()
    req.open("POST", "/" + enrollmentMode + "/" + courseCode, true);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            alert(req.responseText);
            enrollment();
        }
    }
    req.send();
}


