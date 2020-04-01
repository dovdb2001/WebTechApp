const courseCode = window.location.href.substring(window.location.href.lastIndexOf("/") + 1);
var course;

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

function drawCourse() {

}
