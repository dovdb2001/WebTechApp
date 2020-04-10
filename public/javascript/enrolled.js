setup();

// clears all elements from the element courses adds the title 'Enrolled Courses' and calls getCourses()
function setup() {
    document.getElementById("courses").innerHTML = "";
    var title = document.createElement("h1");
    title.textContent = "Enrollend Courses";
    document.getElementById("courses").append(title);
    getCourses();
}

// gets all the courses that the user enrolled in from the server and calls addCourses()
function getCourses() {
    var req = new XMLHttpRequest()
    req.open("GET", "/account/courses", true);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            addCourses(JSON.parse(req.responseText));
        }
    }
    req.send();
}

// loops trough all the courses and calls for each course getCourseInfo()
function addCourses(courses) {
    for (var i = 0; i < courses.length; i++) {
        getCourseInfo(courses[i].course_code);
    }
}

// uses ajax to get the course information for the course with the given code and calls then addCourse()
function getCourseInfo(course_code) {
    var req = new XMLHttpRequest()
    req.open("GET", "/course-info/" + course_code, true);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            addCourse(JSON.parse(req.responseText)[0]);
        }
    }
    req.send();
}

// creates an div and adds all relevant review information to this div and then appends this div to the end of the body of the page
function addCourse(course) {
    var div = document.createElement("div");
    div.addEventListener("click", courseClicked, false);
    div.id = course.code;
    div.setAttribute("class", "container");

    addTextNode(course.title + ", " + course.code, div);
    addTextNode(course.programme + ", " + course.level, div);
    addTextNode("Semester: " + course.semester, div);

    var btn = document.createElement("button");
    btn.textContent = "leave";
    btn.addEventListener("click", buttonClicked, false);
    btn.id = course.code;
    div.append(btn);

    document.getElementById("courses").append(div);
}

// adds an textnode with the given text to the element body
function addTextNode(text, body) {
    body.append(document.createTextNode(text));
    body.append(document.createElement("br"));
}

// if the user clicks on a course, he or she will be redirected to the details page of that course
function courseClicked(event) {
    window.location.href = "/browse/courses/" + event.target.id;
}

// if user clicks the 'leave' button he or she is asked if they really want to leave the course, if so, leaveCourse() is called
function buttonClicked(event) {
    var r = confirm("Are you sure you want to the course: " + event.target.id + "?");
    if (r == true) {
        leaveCourse(event.target.id);
    }
    event.stopPropagation();
}

// send and request to the server to unenroll the user from the course with the given code, after setup() is called
function leaveCourse(courseCode) {
    var req = new XMLHttpRequest()
    req.open("POST", "/leave/" + courseCode, true);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            setup();
        }
    }
    req.send();
}


