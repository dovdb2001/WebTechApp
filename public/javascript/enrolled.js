setup();

function setup() {
    document.getElementById("courses").innerHTML = "";
    var title = document.createElement("h1");
    title.textContent = "Enrollend Courses";
    document.getElementById("courses").append(title);
    getCourses();
}

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

function addCourses(courses) {
    for (var i = 0; i < courses.length; i++) {
        getCourseInfo(courses[i].course_code);
    }
}

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

function addTextNode(text, body) {
    body.append(document.createTextNode(text));
    body.append(document.createElement("br"));
}

function courseClicked(event) {
    window.location.href = "/browse/courses/" + event.target.id;
}

function buttonClicked(event) {
    var r = confirm("Are you sure you want to the course: " + event.target.id + "?");
    if (r == true) {
        leaveCourse(event.target.id);
    }
    event.stopPropagation();
}

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
