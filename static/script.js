const socket = io({
    auth: {
        cookie: document.cookie
    }
});

const messages = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");
const logout = document.getElementById("logout")
const myId = document.cookie.split("=")[1].split(".")[0];
logout.addEventListener("click", function () {
    document.cookie = "token=; Max-Age=0";
    location.assign("/login");
})

form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value) {
        socket.emit("new_message", input.value);
        input.value = "";
    }
})

socket.on("message", (msg) => {
    let item = document.createElement("li");
    item.textContent = msg.login + ": " + msg.message;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
})

socket.on("all_messages", (msgArray) => {
    msgArray.forEach(msg => {
        let item = document.createElement("li");
        if (msg.user_id == myId) {
            item.classList.add("my");
        }
        item.textContent = msg.login + ": " + msg.content;
        messages.appendChild(item);
    })
    window.scrollTo(0, document.body.scrollHeight);
})