// routes/products.routes.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { authMiddleware } from "../middleware/authMiddleware.js";
import db from "../db.js";

const router = express.Router();

// Pasta de uploads
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configuração do multer para salvar arquivos localmente
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}_${originalName}`);
  },
});
const upload = multer({ storage });

// ================== CRIAR PRODUTO ==================
router.post("/", authMiddleware, upload.single("imagem"), async (req, res) => {
  try {
    const { nome, preco, quantidade, descricao } = req.body;
    const imagem = req.file ? req.file.filename : null;
    const id_usuario = req.user.id;

    if (!nome || !preco || !quantidade || !descricao)
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });

    await db.query(
      "INSERT INTO sistema_admin.produtos (nome, preco, quantidade, descricao, imagem, id_usuario) VALUES ($1, $2, $3, $4, $5, $6)",
      [nome, preco, quantidade, descricao, imagem, id_usuario]
    );

    res.status(201).json({ message: "Produto cadastrado com sucesso" });
  } catch (err) {
    console.error("❌ ERRO AO CRIAR PRODUTO:", err);
    res.status(500).json({ message: "Erro ao cadastrar produto", details: err.message });
  }
});

// ================== LISTAR PRODUTOS DO USUÁRIO ==================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM sistema_admin.produtos WHERE id_usuario=$1 ORDER BY id DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERRO AO LISTAR PRODUTOS:", err);
    res.status(500).json({ message: "Erro ao listar produtos", details: err.message });
  }
});

// ================== ATUALIZAR PRODUTO ==================
router.put("/:id", authMiddleware, upload.single("imagem"), async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, quantidade, descricao } = req.body;
    const id_usuario = req.user.id;

    // Buscar produto atual
    const result = await db.query(
      "SELECT * FROM sistema_admin.produtos WHERE id=$1 AND id_usuario=$2",
      [id, id_usuario]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Produto não encontrado ou não pertence ao usuário" });

    const produtoAtual = result.rows[0];
    const novaImagem = req.file ? req.file.filename : produtoAtual.imagem;

    // Atualizar produto
    await db.query(
      "UPDATE sistema_admin.produtos SET nome=$1, preco=$2, quantidade=$3, descricao=$4, imagem=$5 WHERE id=$6 AND id_usuario=$7",
      [nome || produtoAtual.nome, preco || produtoAtual.preco, quantidade || produtoAtual.quantidade, descricao || produtoAtual.descricao, novaImagem, id, id_usuario]
    );

    res.json({ message: "Produto atualizado com sucesso" });
  } catch (err) {
    console.error("❌ ERRO AO ATUALIZAR PRODUTO:", err);
    res.status(500).json({ message: "Erro ao atualizar produto", details: err.message });
  }
});

// ================== EXCLUIR PRODUTO ==================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.user.id;

    // Buscar produto para deletar imagem
    const result = await db.query(
      "SELECT * FROM sistema_admin.produtos WHERE id=$1 AND id_usuario=$2",
      [id, id_usuario]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Produto não encontrado ou não pertence ao usuário" });

    const produto = result.rows[0];

    // Deletar do DB
    await db.query("DELETE FROM sistema_admin.produtos WHERE id=$1 AND id_usuario=$2", [id, id_usuario]);

    // Deletar imagem do servidor
    if (produto.imagem) {
      const caminhoImagem = path.join(uploadDir, produto.imagem);
      if (fs.existsSync(caminhoImagem)) fs.unlinkSync(caminhoImagem);
    }

    res.json({ message: "Produto excluído com sucesso" });
  } catch (err) {
    console.error("❌ ERRO AO EXCLUIR PRODUTO:", err);
    res.status(500).json({ message: "Erro ao excluir produto", details: err.message });
  }
});

export default router;
