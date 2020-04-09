(document.getElementById("btn")).addEventListener("click", (event) => {
    if(!(document.getElementById("login")).reportValidity()) {
        event.preventDefault();
    }
});
