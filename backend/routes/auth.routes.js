// routes/auth.routes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

/* =====================================================
   🔐 REGISTRO DE USUÁRIO
===================================================== */
router.post("/register-user", async (req, res) => {
  const { nome, email, senha, role } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({
      success: false,
      message: "Preencha todos os campos",
    });
  }

  try {
    // Verifica se o email já existe
    const exists = await db.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email já cadastrado",
      });
    }

    // Criptografa senha
    const hash = await bcrypt.hash(senha, 10);
    const acesso = role === "admin" ? "admin" : "user";

    await db.query(
      `
      INSERT INTO usuarios
      (nome, email, senha, acesso)
      VALUES ($1, $2, $3, $4)
      `,
      [nome, email, hash, acesso]
    );

    return res.status(201).json({
      success: true,
      message: "Usuário criado com sucesso",
    });
  } catch (err) {
    console.error("❌ ERRO REGISTER:", err);

    return res.status(500).json({
      success: false,
      message: "Erro interno no registro",
      details: err.message,
    });
  }
});

/* =====================================================
   🔑 LOGIN
===================================================== */
router.post("/login", async (req, res) => {
  console.log("🔥 LOGIN HIT:", req.body);

  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      success: false,
      message: "Email e senha são obrigatórios",
    });
  }

  try {
    const result = await db.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    const usuario = result.rows[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: "Usuário ou senha inválidos",
      });
    }

    // 🔐 GARANTE JWT_SECRET
    const JWT_SECRET = process.env.JWT_SECRET || "JWT_TEMP_SECRET";

    const token = jwt.sign(
      { id: usuario.id, role: usuario.acesso },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      token,
      id: usuario.id,
      nome: usuario.nome,
      role: usuario.acesso,
    });
  } catch (err) {
    console.error("❌ ERRO LOGIN:", err);

    return res.status(500).json({
      success: false,
      message: "Erro interno no login",
      details: err.message,
    });
  }
});

export default router;

