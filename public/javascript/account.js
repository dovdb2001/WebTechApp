getAccount();

function getAccount() {
    var req = new XMLHttpRequest()
    req.open("GET", "/account/info", true);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            draw(JSON.parse(req.responseText));
        }
    }
    req.send();
}

function draw(account) {
    (document.getElementById("student_number")).append(document.createTextNode(account[0].student_number));
    (document.getElementById("first_name")).append(document.createTextNode(account[0].first_name));
    (document.getElementById("last_name")).append(document.createTextNode(account[0].last_name));
    (document.getElementById("programme")).append(document.createTextNode(account[0].programme));
    (document.getElementById("level")).append(document.createTextNode(account[0].academic_level));
}
