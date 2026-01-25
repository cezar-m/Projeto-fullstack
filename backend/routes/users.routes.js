// routes/users.routes.js
import express from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// LISTAR USUÁRIOS (admin)
router.get("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const result = await db.query("SELECT id, nome, email, acesso FROM sistema_admin.usuarios");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERRO AO LISTAR USUÁRIOS:", err);
    res.status(500).json({ message: "Erro ao listar usuários", details: err.message });
  }
});

// ATUALIZAR USUÁRIO
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;

  if (req.user.role !== "admin" && req.user.id != id) {
    return res.status(403).json({ message: "Sem permissão" });
  }

  try {
    await db.query("UPDATE sistema_admin.usuarios SET nome=$1, email=$2 WHERE id=$3", [nome, email, id]);
    res.json({ message: "Usuário atualizado" });
  } catch (err) {
    console.error("❌ ERRO AO ATUALIZAR USUÁRIO:", err);
    res.status(500).json({ message: "Erro ao atualizar usuário", details: err.message });
  }
});

// EXCLUIR USUÁRIO (admin)
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM sistema_admin.usuarios WHERE id=$1", [req.params.id]);
    res.json({ message: "Usuário excluído" });
  } catch (err) {
    console.error("❌ ERRO AO EXCLUIR USUÁRIO:", err);
    res.status(500).json({ message: "Erro ao excluir usuário", details: err.message });
  }
});

export default router;

