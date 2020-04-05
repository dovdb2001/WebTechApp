const courseCode = window.location.href.substring(window.location.href.lastIndexOf("/") + 1);
var course;
var enrollmentMode = "NA";

var btn = document.createElement("button");
btn.addEventListener("click", btnPressed);

if(document.getElementById("rating_form")) {
    document.getElementById("rating_form").setAttribute("action", "/reviews/add/" + courseCode);
}

getCourse();
drawRating();
enrollment();
getReviews();

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
    (document.getElementById("teacher")).append(document.createTextNode(course.teacher));
    (document.getElementById("description")).append(document.createTextNode(course.description));
    (document.getElementById("image")).setAttribute("src", "/images/" + course.image_id);
}

function drawRating() {
    var req = new XMLHttpRequest()
    req.open("GET", "/reviews/rating/" + courseCode, true);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            (document.getElementById("rating")).append(document.createTextNode(req.responseText));
        }
    }
    req.send();
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
        document.getElementById("table").append(btn);
    }
}

function btnPressed(event) {
    var req = new XMLHttpRequest();
    var r = confirm("Are you sure you want to " + enrollmentMode + " the course: " + event.target.id + "?");
    if (r == true) {
        req.open("POST", "/" + enrollmentMode + "/" + courseCode, true);
        req.onreadystatechange = function () {
            if (req.readyState == 4 && req.status == 200) {
                alert(req.responseText);
                enrollment();
            }
        }
        req.send();
    }
}

function getReviews() {
    var req = new XMLHttpRequest()
    console.log(courseCode);
    req.open("GET", "/reviews/" + courseCode, true);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            console.log(req.responseText);
            drawReviews(JSON.parse(req.responseText));
        }
    }
    req.send();
}

function drawReviews(reviews) {
    for (var i = 0; i < reviews.length; i++) {
        drawReview(reviews[i]);
    }
}

function drawReview(review) {
    var div = document.createElement("div");
    div.setAttribute("class", "container");

    var startRating = "";
    if (review.rating == "1") {
        startRating = "1 star";
    } else {
        startRating = review.rating + " stars";
    }

    addTextNode(review.first_name + ": " + startRating, div);
    addTextNode(review.content, div);

    document.body.append(div);
}

function addTextNode(text, body) {
    body.append(document.createTextNode(text));
    body.append(document.createElement("br"));
}














