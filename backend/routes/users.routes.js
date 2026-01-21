import express from "express";
import bcrypt from "bcryptjs";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import { dbPromise } from "../db.js"; // ⚡ db com suporte a promise

const router = express.Router();

// ✅ Lista usuários (apenas admin)
router.get("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const [users] = await dbPromise.query(
      "SELECT * FROM usuarios"
    );
    res.json(users);
  } catch (err) {
    console.error("💥 ERRO AO LISTAR USUÁRIOS:", err);
    res.status(500).json({ error: "Erro ao listar usuários", details: err.message });
  }
});

// ✅ Criar usuário (apenas admin)
router.post("/register-user", authMiddleware, isAdmin, async (req, res) => {
  const { nome, email, senha, role } = req.body;

  // 🔴 Validação de campos
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Campos obrigatórios: nome, email e senha" });
  }

  // 🔴 Validação do ENUM role
  const roleFinal = role === "admin" ? "admin" : "user";

  try {
    // 🔍 Verifica se email já existe
    const [existing] = await dbPromise.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    // 🔐 Criptografa senha
    const hash = await bcrypt.hash(senha, 10);

    // 📝 Insere usuário
    await dbPromise.query(
      "INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)",
      [nome, email, hash, roleFinal]
    );

    res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (err) {
    console.error("💥 ERRO AO CRIAR USUÁRIO:", err);
    res.status(500).json({ error: "Erro ao criar usuário", details: err.message });
  }
});

// ✅ Editar usuário
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;

  // 🔒 Verifica permissão
  if (req.user.role !== "admin" && req.user.id != id) {
    return res.status(403).json({ error: "Sem permissão" });
  }

  try {
    await dbPromise.query(
      "UPDATE usuarios SET nome = ?, email = ? WHERE id = ?",
      [nome, email, id]
    );
    res.json({ message: "Usuário atualizado" });
  } catch (err) {
    console.error("💥 ERRO AO ATUALIZAR USUÁRIO:", err);
    res.status(500).json({ error: "Erro ao atualizar usuário", details: err.message });
  }
});

// ✅ Excluir usuário (apenas admin)
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await dbPromise.query("DELETE FROM usuarios WHERE id = ?", [id]);
    res.json({ message: "Usuário excluído com sucesso" });
  } catch (err) {
    console.error("💥 ERRO AO EXCLUIR USUÁRIO:", err);
    res.status(500).json({ error: "Erro ao excluir usuário", details: err.message });
  }
});

export default router;

