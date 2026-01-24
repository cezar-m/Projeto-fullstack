import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================== REGISTRO ================== */
router.post("/register-user", async (req, res) => {
  console.log("🔥 REGISTER HIT", req.body);

  const { nome, email, senha, role } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ message: "Preencha todos os campos" });

  try {
    const [exists] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (exists.length > 0) return res.status(400).json({ message: "Email já cadastrado" });

    const hash = await bcrypt.hash(senha, 10);
    const roleFinal = role === "admin" ? "admin" : "user";

    await db.query("INSERT INTO usuarios (nome, email, senha, acesso) VALUES (?, ?, ?, ?)", [nome, email, hash, roleFinal]);
    res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (err) {
    console.error("❌ ERRO REGISTER:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================== LOGIN ================== */
router.post("/login", async (req, res) => {
  console.log("🔥 LOGIN HIT", req.body);

  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ message: "Digite usuário e senha" });

  try {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(404).json({ message: "Usuário não encontrado" });

    const usuario = rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(401).json({ message: "Usuário ou senha inválidos" });

    const token = jwt.sign({ id: usuario.id, role: usuario.acesso }, process.env.JWT_SECRET || "SECRET_TEMP", { expiresIn: "1d" });

    res.json({ token, id: usuario.id, nome: usuario.nome, role: usuario.acesso });
  } catch (err) {
    console.error("❌ ERRO LOGIN:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================== USUÁRIO LOGADO ================== */
router.get("/user", authMiddleware, (req, res) => {
  console.log("🔥 USER HIT", req.user);
  res.json(req.user);
});

export default router;
