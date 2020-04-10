(document.getElementById("btn")).addEventListener("click", loadMoreCourses);        // the 'get more courses' button is mapped to loadMoreCourses
(document.getElementById("search_btn")).addEventListener("click", loadNewCourses);  // the 'search' button is mapped to loadNewCourses
var chuck = 0;  // keeps track of how many chucks of ten courses are already being displayed

addTitle();
getCourses();

// adds the title 'All Courses' to the div courses
function addTitle() {
    var title = document.createElement("h2");
    title.textContent = "All courses";
    (document.getElementById("courses")).append(title);
}

// when the user changes search parameters and hits search, the entry body of div courses is deleted, the title re added and than the new courses added
function loadNewCourses() {
    chuck = 0;
    document.getElementById("courses").innerHTML = "";
    (document.getElementById("btn")).disabled = false;
    addTitle();
    getCourses();
}

// when the user pressed the button 'get more courses' more courses are loaded
function loadMoreCourses() {
    getCourses();
}

// based on the search parameters and the block variable an url is constructed with which the server can be qeuried
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

// uses ajax to get courses from the server using the url constructed by the method getURL(), when the reqpsonse is recieved addCourses() is called
function getCourses() {
    var req = new XMLHttpRequest()
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

// loops trouch the aray of courses and calls for every course in the array addCourse()
function addCourses(courses) {
    for (var i = 0; i < courses.length; i++) {
        addCourse(courses[i], document.getElementById("courses"));
    }
}

// adds an textnode with the given text to the element body
function addTextNode(text, body) {
    body.append(document.createTextNode(text));
    body.append(document.createElement("br"));
}

// creates an div element for the course and adds all relevant course information to this div
function addCourse(course, body) {
    var div = document.createElement("div");
    div.addEventListener("click", didSelectCourse);
    div.id = course.code;
    div.setAttribute("class", "container");

    addTextNode(course.title + ", " + course.code, div);
    addTextNode(course.programme + ", " + course.level, div);
    addTextNode("Semester: " + course.semester, div);

    body.append(div);
}

// is called when a user clicks on a div representing an course, and redirects the client to the appropriate course details url
function didSelectCourse(event) {
    if (window.location.href.charAt(window.location.href.length - 1) != "/") {
        window.location.href += "/courses/" + event.target.id;
    } else {
        window.location.href += "courses/" + event.target.id;
    }
}









































