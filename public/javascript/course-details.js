const courseCode = window.location.href.substring(window.location.href.lastIndexOf("/") + 1);
var course;


var req = new XMLHttpRequest()
req.open("GET", "/courses/", true);
req.onreadystatechange = function () {
    if (req.readyState == 4 && req.status == 200) {
        course = JSON.parse(req.responseText);
    }
}
req.send();

console.log(course);
