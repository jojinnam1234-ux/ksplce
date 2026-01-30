const express = require("express");
const bcrypt = require("bcrypt")
const { Pool } = require("pg")

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("hello world");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


app.use(express.json())
app.use(express.static("public"))

const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
})


app.post("/signup", async (req, res) => {
    const { email, password } = req.body
    const hash = await bcrypt.hash(password, 10)

    try {
        await db.query(
            "INSERT INTO users(email, password) VALUES ($1, $2)",
            [email, hash]
        )
        res.send("회원가입 성공")
    } catch {
        res.send("이미 존재")
    }
})


app.post("/login", async (req, res) => {
    const { email, password } = req.body

    const result = await db.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
    )

    if (result.rows.length === 0) return res.send("없음")

    const ok = await bcrypt.compare(password, result.rows[0].password)

    if (ok) res.send("로그인 성공")
    else res.send("비번 틀림")
})

