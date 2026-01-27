import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =====================================================
   🔐 REGISTRO
===================================================== */
router.post("/register-user", async (req, res) => {
  const { nome, email, senha, role } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: "Preencha todos os campos" });
  }

  try {
    const exists = await db.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "Email já cadastrado" });
    }

    const hash = await bcrypt.hash(senha, 10);
    const acesso = role === "admin" ? "admin" : "user";

    await db.query(
      "INSERT INTO usuarios (nome, email, senha, acesso) VALUES ($1,$2,$3,$4)",
      [nome, email, hash, acesso]
    );

    res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao cadastrar usuário" });
  }
});

/* =====================================================
   🔑 LOGIN
===================================================== */
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: "Email e senha obrigatórios" });
  }

  try {
    const result = await db.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { id: usuario.id, role: usuario.acesso },
      process.env.JWT_SECRET || "JWT_TEMP",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      id: usuario.id,
      nome: usuario.nome,
      role: usuario.acesso,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no login" });
  }
});

/* =====================================================
   🔒 ATUALIZAR SENHA (LOGADO)
===================================================== */
router.put("/update-password", authMiddleware, async (req, res) => {
  const { senhaAntiga, senhaNova } = req.body;

  if (!senhaAntiga || !senhaNova) {
    return res.status(400).json({ message: "Campos obrigatórios" });
  }

  try {
    const userId = req.user.id;

    const result = await db.query(
      "SELECT senha FROM usuarios WHERE id = $1",
      [userId]
    );

    const senhaValida = await bcrypt.compare(
      senhaAntiga,
      result.rows[0].senha
    );

    if (!senhaValida) {
      return res.status(401).json({ message: "Senha antiga incorreta" });
    }

    const hash = await bcrypt.hash(senhaNova, 10);

    await db.query(
      "UPDATE usuarios SET senha = $1 WHERE id = $2",
      [hash, userId]
    );

    res.json({ message: "Senha atualizada com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar senha" });
  }
});

/* =====================================================
   🔁 REDEFINIR SENHA (SEM LOGIN)  ← 🔥 BUG PRINCIPAL
===================================================== */
router.put("/atualizarsenha", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: "Dados inválidos" });
  }

  try {
    const hash = await bcrypt.hash(senha, 10);

    const result = await db.query(
      "UPDATE usuarios SET senha = $1 WHERE email = $2",
      [hash, email]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json({ message: "Senha redefinida com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao redefinir senha" });
  }
});

export default router;
