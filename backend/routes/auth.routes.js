// routes/auth.routes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

// REGISTRO DE USUÁRIO
router.post("/register-user", async (req, res) => {
  const { nome, email, senha, role } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ message: "Preencha todos os campos" });

  try {
    // Verifica se o email já existe
    const result = await db.query(
      "SELECT id FROM sistema_admin.usuarios WHERE email = $1",
      [email]
    );
    if (result.rows.length > 0)
      return res.status(400).json({ message: "Email já cadastrado" });

    // Criptografa a senha
    const hash = await bcrypt.hash(senha, 10);
    const roleFinal = role === "admin" ? "admin" : "user";

    // Insere o usuário
    await db.query(
      "INSERT INTO sistema_admin.usuarios (nome, email, senha, acesso) VALUES ($1, $2, $3, $4)",
      [nome, email, hash, roleFinal]
    );

    res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (err) {
    console.error("❌ ERRO REGISTER:", err);
    res
      .status(500)
      .json({ message: "Erro interno no registro", details: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  console.log("🔥 LOGIN HIT", req.body);
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ message: "Digite usuário e senha" });

  try {
    // Busca usuário no schema correto
    const result = await db.query(
      "SELECT * FROM sistema_admin.usuarios WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Usuário não encontrado" });

    const usuario = result.rows[0];

    // Verifica senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida)
      return res.status(401).json({ message: "Usuário ou senha inválidos" });

    // Gera token JWT
    const token = jwt.sign(
      { id: usuario.id, role: usuario.acesso },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, id: usuario.id, nome: usuario.nome, role: usuario.acesso });
  } catch (err) {
    console.error("❌ ERRO LOGIN:", err);
    res
      .status(500)
      .json({ message: "Erro interno no login", details: err.message });
  }
});

export default router;
