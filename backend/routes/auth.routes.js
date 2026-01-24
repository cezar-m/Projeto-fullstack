import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../index.js";

const router = express.Router();

/* ================== REGISTRO ================== */
router.post("/register-user", async (req, res) => {
  const { nome, email, senha, role } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: "Preencha todos os campos" });
  }

  try {
    const exists = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "Email já cadastrado" });
    }

    const hash = await bcrypt.hash(senha, 10);
    const roleFinal = role === "admin" ? "admin" : "user";

    await pool.query(
      "INSERT INTO usuarios (nome, email, senha, acesso) VALUES ($1, $2, $3, $4)",
      [nome, email, hash, roleFinal]
    );

    res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (err) {
    console.error("❌ ERRO REGISTER:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/* ================== LOGIN ================== */
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: "Digite usuário e senha" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const usuario = result.rows[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: "Usuário ou senha inválidos" });
    }

    const token = jwt.sign(
      { id: usuario.id, role: usuario.acesso },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        acesso: usuario.acesso
      }
    });
  } catch (err) {
    console.error("❌ ERRO LOGIN:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/* ================== USER LOGADO ================== */
router.get("/user", (req, res) => {
  res.json(req.user);
});

export default router;
