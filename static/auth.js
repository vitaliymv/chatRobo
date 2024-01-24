const registerForm = document.querySelector("#register-form");
const loginForm = document.querySelector("#login-form");
const span = document.querySelector("#response");

registerForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    span.innerHTML = null;
    const { login, password, passwordRepeat } = registerForm;
    if (!login.value) {
        return span.innerHTML = "Empty login"
    }
    if (!password.value) {
        return span.innerHTML = "Empty password"
    }
    if (!passwordRepeat.value) {
        return span.innerHTML = "Empty password repeat"
    }

    if (password.value != passwordRepeat.value) {
        return span.innerHTML = "Password not match"
    }

    const user = JSON.stringify({
        login: login.value,
        password: password.value
    })

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/register");
    xhr.send(user);
    xhr.responseType = "json";
    xhr.onload = () => {
        if (xhr.response.error) {
            span.style.color = "red";
            span.innerHTML = xhr.response.error;
        } else {
            span.style.color = "lightgreen";
            span.innerHTML = xhr.response.res;
            setTimeout(() => {
                window.open("/login", "_self");
            }, 2000)
        }
    }
})


loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    span.innerHTML = null;
    const { login, password } = loginForm;
    if (!login.value) {
        return span.innerHTML = "Empty login"
    }
    if (!password.value) {
        return span.innerHTML = "Empty password"
    }

    const user = JSON.stringify({
        login: login.value,
        password: password.value
    })
    
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/login");
    xhr.send(user);
    xhr.responseType = "json";
    xhr.onload = () => {
        if (xhr.status == 200) {
            const token = xhr.response.token;
            console.log(token);
            console.log(xhr.response);
            document.cookie = `token=${token}`;
            window.location.assign("/");
        } else {
            span.style.color = "red";
            span.innerHTML = xhr.response.error;
        }
    }
})
let passField = document.getElementById("password");
let icon = document.getElementById("icon");
let icon1 = document.getElementById("icon1");
icon.addEventListener("click", () => {
    if (passField.getAttribute("type") == "password") {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
        passField.setAttribute("type", "text");
    } else {
        icon.classList.add("fa-regular");
        icon.classList.remove("fa-solid");
        passField.setAttribute("type", "password");
    }
})
let passwordRepeat = document.getElementById("passwordRepeat");
icon1?.addEventListener("click", () => {
    if (passwordRepeat.getAttribute("type") == "password") {
        icon1.classList.remove("fa-regular");
        icon1.classList.add("fa-solid");
        passwordRepeat.setAttribute("type", "text");
    } else {
        icon1.classList.add("fa-regular");
        icon1.classList.remove("fa-solid");
        passwordRepeat.setAttribute("type", "password");
    }
})