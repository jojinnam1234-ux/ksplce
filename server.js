const express = require("express")
const mysql = require("mysql2")
const bcrypt = require("bcrypt")

const app = express()
app.use(express.json())
app.use(express.static("public"))

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "ksplce!@#",
    database: "mysite"
})

// 회원가입
app.post("/signup", async (req, res) => {
    const { email, password } = req.body
    const hash = await bcrypt.hash(password, 10)

    db.query(
        "INSERT INTO users(email,password) VALUES (?,?)",
        [email, hash],
        err => {
            if (err) return res.send("이미 존재")
            res.send("회원가입 성공")
        }
    )
})

// 로그인
app.post("/login", (req, res) => {
    const { email, password } = req.body

    db.query(
        "SELECT * FROM users WHERE email=?",
        [email],
        async (err, result) => {
            if (result.length === 0) return res.send("없음")

            const ok = await bcrypt.compare(password, result[0].password)
            if (ok) res.send("로그인 성공")
            else res.send("비번 틀림")
        }
    )
})

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(3000, () => {
    console.log("Server running");
});
