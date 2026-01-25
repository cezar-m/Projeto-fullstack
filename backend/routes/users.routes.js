import express from "express";
import bcrypt from "bcryptjs";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import db from "../db.js";

const router = express.Router();

// ✅ Lista usuários (admin)
router.get("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const result = await db.query("SELECT id, nome, email, acesso FROM sistema_admin.usuarios");
    res.json(result.rows);
  } catch (err) {
    console.error("💥 ERRO AO LISTAR USUÁRIOS:", err);
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
});

// ✅ Criar usuário (admin)
router.post("/register-user", authMiddleware, isAdmin, async (req, res) => {
  const { nome, email, senha, role } = req.body;
  const roleFinal = role === "admin" ? "admin" : "user";

  try {
    const exists = await db.query(
      "SELECT id FROM sistema_admin.usuarios WHERE email = $1",
      [email]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const hash = await bcrypt.hash(senha, 10);

    await db.query(
      "INSERT INTO sistema_admin.usuarios (nome, email, senha, acesso) VALUES ($1, $2, $3, $4)",
      [nome, email, hash, roleFinal]
    );

    res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (err) {
    console.error("💥 ERRO AO CRIAR USUÁRIO:", err);
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

// ✅ Atualizar usuário
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;

  if (req.user.role !== "admin" && req.user.id != id) {
    return res.status(403).json({ error: "Sem permissão" });
  }

  try {
    await db.query(
      "UPDATE sistema_admin.usuarios SET nome = $1, email = $2 WHERE id = $3",
      [nome, email, id]
    );
    res.json({ message: "Usuário atualizado" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

// ✅ Excluir usuário (admin)
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM sistema_admin.usuarios WHERE id = $1", [req.params.id]);
    res.json({ message: "Usuário excluído" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao excluir usuário" });
  }
});

export default router;


