import express from "express";
import db from "../db.js";
import { upload, uploadToCloudinary } from "../middleware/upload.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================
   LISTAR PRODUTOS
========================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM produtos WHERE id_usuario=$1 ORDER BY id DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao listar produtos:", err);
    res.status(500).json({ message: "Erro ao listar produtos" });
  }
});

/* =========================
   CRIAR PRODUTO
========================= */
router.post("/", authMiddleware, upload.single("imagem"), async (req, res) => {
  try {
    const { nome, preco, descricao, quantidade } = req.body;

    if (!nome || !preco || !descricao || !quantidade)
      return res.status(400).json({ message: "Dados incompletos" });

    let imagemUrl = null;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "produtos");
      imagemUrl = uploadResult.secure_url;
    }

    const result = await db.query(
      `INSERT INTO produtos (nome, preco, descricao, quantidade, imagem, id_usuario)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [nome, Number(preco), descricao, Number(quantidade), imagemUrl, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar produto:", err);
    res.status(500).json({ message: "Erro ao criar produto" });
  }
});

/* =========================
   ATUALIZAR PRODUTO
========================= */
router.put("/:id", authMiddleware, upload.single("imagem"), async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, descricao, quantidade } = req.body;

    const produtoAtual = await db.query(
      "SELECT * FROM produtos WHERE id=$1 AND id_usuario=$2",
      [id, req.user.id]
    );
    if (produtoAtual.rowCount === 0)
      return res.status(404).json({ message: "Produto não encontrado" });

    let imagemUrl = produtoAtual.rows[0].imagem;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "produtos");
      imagemUrl = uploadResult.secure_url;
    }

    const result = await db.query(
      `UPDATE produtos SET nome=$1, preco=$2, descricao=$3, quantidade=$4, imagem=$5
       WHERE id=$6 AND id_usuario=$7 RETURNING *`,
      [nome, Number(preco), descricao, Number(quantidade), imagemUrl, id, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar produto:", err);
    res.status(500).json({ message: "Erro ao atualizar produto" });
  }
});

/* =========================
   EXCLUIR PRODUTO
========================= */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM produtos WHERE id=$1 AND id_usuario=$2", [id, req.user.id]);
    res.json({ message: "Produto excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir produto:", err);
    res.status(500).json({ message: "Erro ao excluir produto" });
  }
});

export default router;
