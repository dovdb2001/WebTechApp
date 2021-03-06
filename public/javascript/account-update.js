getAccount();

// get the account information from the server
function getAccount() {
    var req = new XMLHttpRequest()
    req.open("GET", "/account/info", true);
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            draw(JSON.parse(req.responseText)[0]);
        }
    }
    req.send();
}

// gets the appropriate html objects and added the found values to the webpage
function draw(account) {
    (document.getElementById("first_name")).value = account.first_name;
    (document.getElementById("last_name")).value = account.last_name;
    (document.getElementById("level_programme")).value = account.academic_level + " " + account.programme;
}
