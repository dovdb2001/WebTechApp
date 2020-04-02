(document.getElementById("btn")).addEventListener("click", loadMoreCourses);
(document.getElementById("search_btn")).addEventListener("click", loadNewCourses);
var chuck = 0;

getCourses();

function loadNewCourses() {
    chuck = 0;
    document.getElementById("courses").innerHTML = "";
    (document.getElementById("btn")).disabled = false;
    getCourses();
}

function loadMoreCourses() {
    getCourses();
}

function getURL() {
    var url = "/courses/";
    if ((document.getElementById("course_name")).value != "") {
        url += (document.getElementById("course_name")).value + "/";
    } else {
        url += "*/"
    }
    url += (document.getElementById("programme")).value + "/";
    url += (document.getElementById("level")).value + "/";
    url += (document.getElementById("semester")).value + "/";
    url += chuck
    return url;
}

function getCourses() {
    var req = new XMLHttpRequest()
    var url = "/courses/*/*/*/*/" + chuck;
    req.open("GET", getURL(), true);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            var data = JSON.parse(req.responseText);
            if (data.length < 10) {
                (document.getElementById("btn")).disabled = true;
            }
            addCourses(data);
        }
    }
    req.send();
    chuck++;
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
    div.setAttribute("class", "container");

    addTextNode(course.title + ", " + course.code, div);
    addTextNode(course.programme, div);
    addTextNode(course.level + ". Semester: " + course.semester, div);

    body.append(div);
}

function didSelectCourse(event) {
    if (window.location.href.charAt(window.location.href.length - 1) != "/") {
        window.location.href += "/courses/" + event.target.id;
    } else {
        window.location.href += "courses/" + event.target.id;
    }
}











