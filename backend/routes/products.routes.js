// routes/products.routes.js
import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import db from "../db.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() }); // simplificado

// CRIAR PRODUTO
router.post("/", authMiddleware, upload.single("imagem"), async (req, res) => {
  try {
    const { nome, preco, quantidade, descricao } = req.body;
    const imagem = req.file ? req.file.originalname : null;
    const id_usuario = req.user.id;

    await db.query(
      "INSERT INTO produtos (nome, preco, quantidade, descricao, imagem, id_usuario) VALUES ($1, $2, $3, $4, $5, $6)",
      [nome, preco, quantidade, descricao, imagem, id_usuario]
    );

    res.status(201).json({ message: "Produto cadastrado com sucesso" });
  } catch (err) {
    console.error("❌ ERRO PRODUTO:", err);
    res.status(500).json({ message: "Erro ao cadastrar produto", details: err.message });
  }
});

// LISTAR PRODUTOS DO USUÁRIO
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM produtos WHERE id_usuario=$1", [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERRO PRODUTOS:", err);
    res.status(500).json({ message: "Erro ao listar produtos", details: err.message });
  }
});

export default router;
