// backend/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

// -----------------------------
// REGISTRO DE USUÁRIO
// -----------------------------
router.post("/register-user", async (req, res) => {
  const { nome, email, senha, role } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: "Preencha todos os campos" });
  }

  try {
    const [existing] = await db.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email já cadastrado" });
    }

    const hash = await bcrypt.hash(senha, 10);

    await db.query(
      "INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)",
      [nome, email, hash, role || "user"]
    );

    res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (err) {
    console.error("Erro ao registrar usuário:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// -----------------------------
// LOGIN
// -----------------------------
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: "Digite usuário e senha" });
  }

  try {
    const [result] = await db.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const usuario = result[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: "Usuário ou senha inválidos" });
    }

    const token = jwt.sign(
      { id: usuario.id, role: usuario.role },
      process.env.JWT_SECRET || "SECRET_TEMP",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      id: usuario.id,
      nome: usuario.nome,
      role: usuario.role
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// -----------------------------
// ESQUECI MINHA SENHA
// -----------------------------
router.get("/redefinirsenha/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const [rows] = await db.query(
      "SELECT id, nome FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json({ message: "Email de redefinição enviado com sucesso!" });
  } catch (err) {
    console.error("Erro ao redefinir senha:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// -----------------------------
// ATUALIZAR SENHA
// -----------------------------
router.put("/atualizarsenha", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: "Email e nova senha são obrigatórios" });
    }

    const [rows] = await db.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const hash = await bcrypt.hash(senha, 10);

    await db.query(
      "UPDATE usuarios SET senha = ? WHERE email = ?",
      [hash, email]
    );

    res.json({ message: "Senha atualizada com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar senha:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export default router;
