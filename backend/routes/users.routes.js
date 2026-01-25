import express from "express";
import bcrypt from "bcryptjs";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import db from "../db.js";

const router = express.Router();

/* ================== LISTAR USUÁRIOS (ADMIN) ================== */
router.get("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, nome, email, acesso FROM usuarios");
    res.json(rows);
  } catch (err) {
    console.error("💥 ERRO AO LISTAR USUÁRIOS:", err);
    res.status(500).json({ error: "Erro ao listar usuários", details: err.message });
  }
});

/* ================== CRIAR USUÁRIO (ADMIN) ================== */
router.post("/register-user", authMiddleware, isAdmin, async (req, res) => {
  const { nome, email, senha, role } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ message: "Preencha todos os campos" });

  const roleFinal = role === "admin" ? "admin" : "user";

  try {
    const [exists] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (exists.length > 0) return res.status(400).json({ message: "Email já cadastrado" });

    const hash = await bcrypt.hash(senha, 10);

    await db.query(
      "INSERT INTO usuarios (nome, email, senha, acesso) VALUES (?, ?, ?, ?)",
      [nome, email, hash, roleFinal]
    );

    res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (err) {
    console.error("💥 ERRO AO CRIAR USUÁRIO:", err);
    res.status(500).json({ error: "Erro ao criar usuário", details: err.message });
  }
});

/* ================== ATUALIZAR USUÁRIO ================== */
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;

  if (req.user.role !== "admin" && req.user.id != id) {
    return res.status(403).json({ error: "Sem permissão" });
  }

  try {
    await db.query("UPDATE usuarios SET nome = ?, email = ? WHERE id = ?", [nome, email, id]);
    res.json({ message: "Usuário atualizado" });
  } catch (err) {
    console.error("💥 ERRO AO ATUALIZAR USUÁRIO:", err);
    res.status(500).json({ error: "Erro ao atualizar usuário", details: err.message });
  }
});

/* ================== EXCLUIR USUÁRIO (ADMIN) ================== */
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM usuarios WHERE id = ?", [req.params.id]);
    res.json({ message: "Usuário excluído" });
  } catch (err) {
    console.error("💥 ERRO AO EXCLUIR USUÁRIO:", err);
    res.status(500).json({ error: "Erro ao excluir usuário", details: err.message });
  }
});

export default router;
