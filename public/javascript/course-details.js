const courseCode = window.location.href.substring(window.location.href.lastIndexOf("/") + 1);   // extracts the course code from the url
var course;                 // holds all the course information
var enrollmentMode = "NA";  // specifies what the enrolledment mode is, 'NA'

var btn = document.createElement("button");
btn.addEventListener("click", btnPressed);

// if an rating form is available on the page, the correct action is assigned to the form
if(document.getElementById("rating_form")) {
    document.getElementById("rating_form").setAttribute("action", "/reviews/add/" + courseCode);
}

getCourse();
drawRating();
enrollment();
getReviews();

// uses ajax to get the details of the course
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

// get the relevant html elements and adds the course information to the page
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

// get the rating for the course from the server and adds this to the page
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

// gets the enrollement mode from the server
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

// only if the enrollment mode is 'enroll' or 'leave' a button with the relevant text will be added to the page
function addEnrollment() {
    if (enrollmentMode == "enroll" || enrollmentMode == "leave") {
        btn.textContent = enrollmentMode;
        document.getElementById("table").append(btn);
    }
}

// if the enroll/leave button is pressed an appropriate request is send to the server and after enrollement() is called to reevaluate the enrollement mode
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

// get all the reviews of this course from the server and then calls drawReviews()
function getReviews() {
    var req = new XMLHttpRequest()
    req.open("GET", "/reviews/" + courseCode, true);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            drawReviews(JSON.parse(req.responseText));
        }
    }
    req.send();
}

// loops trough the array of recieved reviews and calls for every review drawReview()
function drawReviews(reviews) {
    for (var i = 0; i < reviews.length; i++) {
        drawReview(reviews[i]);
    }
}

// creates an div and adds all relevant review information to this div and then appends this div to the end of the body of the page
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

// adds an textnode with the given text to the element body
function addTextNode(text, body) {
    body.append(document.createTextNode(text));
    body.append(document.createElement("br"));
}














