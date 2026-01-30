const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// 환경변수에서 DB 정보 읽기
const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false } // Render 필수
});

// 서버 시작 시 테이블 자동 생성 (한 번만)
(async () => {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);
        console.log("Users table ready");
    } catch (err) {
        console.error("Table creation failed:", err);
    }
})();

// 회원가입
app.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    try {
        const hash = await bcrypt.hash(password, 10);
        await db.query(
            "INSERT INTO users(email, password) VALUES ($1, $2)",
            [email, hash]
        );
        res.send("회원가입 성공");
    } catch (err) {
        res.send("이미 존재 또는 오류");
    }
});

// 로그인
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (result.rows.length === 0) return res.send("없음");

        const ok = await bcrypt.compare(password, result.rows[0].password);
        if (ok) res.send("로그인 성공");
        else res.send("비번 틀림");
    } catch (err) {
        res.send("오류 발생");
    }
});

// 테스트 페이지
app.get("/", (req, res) => {
    res.send("Hello World!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
