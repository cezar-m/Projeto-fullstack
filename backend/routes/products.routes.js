import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import db from "../db.js"; // conexão MySQL com promise

const router = express.Router();

// Configuração do multer
import fs from "fs";
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}_${originalName}`);
  },
});
const upload = multer({ storage });

// CREATE
router.post("/", authMiddleware, upload.single("imagem"), async (req, res) => {
  try {
    const { nome, preco, quantidade, descricao } = req.body;
    const imagem = req.file ? req.file.filename : null;

    if (!nome || !preco || !quantidade || !descricao)
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });

    const id_usuario = req.user.id;

    await db.query(
      `INSERT INTO produtos (nome, preco, quantidade, descricao, imagem, id_usuario) VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, preco, quantidade, descricao, imagem, id_usuario]
    );

    res.status(201).json({ message: "Produto cadastrado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro interno ao cadastrar produto", details: err.message });
  }
});

// GET
router.get("/", authMiddleware, async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const [produtos] = await db.query("SELECT * FROM produtos WHERE id_usuario = ?", [id_usuario]);
    res.json(produtos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao listar produtos", details: err.message });
  }
});

// UPDATE
router.put("/:id", authMiddleware, upload.single("imagem"), async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, quantidade, descricao } = req.body;
    const imagem = req.file ? req.file.filename : null;
    const id_usuario = req.user.id;

    const [result] = await db.query(
      `UPDATE produtos SET nome=?, preco=?, quantidade=?, descricao=?, imagem=COALESCE(?, imagem) WHERE id=? AND id_usuario=?`,
      [nome, preco, quantidade, descricao, imagem, id, id_usuario]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Produto não encontrado ou não pertence ao usuário" });

    res.json({ message: "Produto atualizado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar produto", details: err.message });
  }
});

// DELETE
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.user.id;

    const [result] = await db.query("DELETE FROM produtos WHERE id=? AND id_usuario=?", [id, id_usuario]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Produto não encontrado ou não pertence ao usuário" });

    res.json({ message: "Produto excluído com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao excluir produto", details: err.message });
  }
});

export default router;
