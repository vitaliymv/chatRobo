const http = require("http");
const fs = require("fs");
const path = require("path");
const db = require("./database");
const cookie = require("cookie");

const loginHtmlPath = fs.readFileSync(path.join(__dirname, "static", "login.html"));
const registerHtmlPath = fs.readFileSync(path.join(__dirname, "static", "register.html"));
const indexHtmlPath = fs.readFileSync(path.join(__dirname, "static", "index.html"));
const styleCssPath = fs.readFileSync(path.join(__dirname, "static", "style.css"));
const scriptJsPath = fs.readFileSync(path.join(__dirname, "static", "script.js"));
const authJsPath = fs.readFileSync(path.join(__dirname, "static", "auth.js"));

const validateAuthTokens = [];

const server = http.createServer((req, res) => {
    if (req.method == "GET") {
        switch (req.url) {
            case "/style.css": return res.end(styleCssPath);
            case "/register": return res.end(registerHtmlPath);
            case "/login": return res.end(loginHtmlPath);
            case "/auth.js": return res.end(authJsPath);
            default: return guarded(req, res);
        }
    }
    if (req.method == "POST")  {
        switch(req.url) {
            case "/api/register": return registerUser(req, res);
            case "/api/login": return loginUser(req, res);
            default: return guarded(req, res);
        }
    }
    res.statusCode = 404;
    return res.end("Error 404")
})

server.listen(3000);

const { Server } = require("socket.io");
const io = new Server(server);


function registerUser(req, res) {
    let data = "";
    req.on("data", (chunk) => {
        data += chunk;
    })
    req.on("data", async () => {
        try {
            const user = JSON.parse(data);
            if (!user.login || !user.password) {
                return res.end(JSON.stringify({
                    "error": "Empty login or password"
                }))
            }
            if (await db.isUserExist(user.login)) {
                return res.end(JSON.stringify({
                    "error": "User already exist"
                }))
            }
            await db.addUser(user);
            return res.end(JSON.stringify({
                "res": "Registration is succesfull"
            }))
        } catch (error) {
            return res.end(JSON.stringify({
                "error": error
            }))
        }
    })
}

function loginUser(req, res) {
    let data = "";
    req.on("data", (chunk) => {
        data += chunk;
    })
    req.on("end", async () => {
        try {
            const user = JSON.parse(data);
            const token = await db.getAuthToken(user);
            
            validateAuthTokens.push(token);
            res.writeHead(200);
            res.end(JSON.stringify({
                "token": token
            }))
        } catch (error) {
            console.log(error);
            return res.end(JSON.stringify({
                "error": error
            }))
        }
    })
}

function getCredentials(c = '') {
    const cookies = cookie.parse(c); //{token: "qwafsda"}
    const token = cookies?.token;
    
    if (!token || !validateAuthTokens.includes(token)) return null;
    const [user_id, login] = token.split("."); // [1, user, fkoapjsoi#@#$F]
    if (!user_id || !login) return null;
    return {user_id, login};
}

function guarded(req, res) {
    const credentials = getCredentials(req.headers?.cookie);
    
    if (!credentials) {
        res.writeHead(302, {"Location": "/login"})
    }
    if (req.method == "GET") {
        switch(req.url) {
            case "/": return res.end(indexHtmlPath);
            case "/script.js": return res.end(scriptJsPath);
        }
    }
}

io.use((socket, next) => {
    const cookie = socket.handshake.auth.cookie;
    const credentials = getCredentials(cookie);
    if (!credentials) {
        next(new Error("no auth"));
    }
    socket.credentials = credentials;
    next();
})

io.on("connection", async (socket) => {
    console.log("A user connected. Id: " + socket.id);
    let username = socket.credentials?.login;
    let user_id = socket.credentials?.user_id;
    let messages = await db.getMessages();

    socket.emit("all_messages", messages);

    socket.on("new_message", (message) => {
        db.addMessage(message, user_id);
        let obj = {
            login: username,
            message: message,
            userId: user_id
        }
        io.emit("message", obj);
    })
})
