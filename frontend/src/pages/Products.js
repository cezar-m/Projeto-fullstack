import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";

export default function Products() {
  const [produtos, setProdutos] = useState([]);
  const [erro, setErro] = useState("");

  const [idEditar, setIdEditar] = useState(null);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagem, setImagem] = useState(null);
  const [preview, setPreview] = useState(null);

  const [pesquisa, setPesquisa] = useState("");
  const [filtroPreco, setFiltroPreco] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => { fetchProdutos(); }, []);

  const fetchProdutos = async () => {
    try {
      const res = await api.get("/products");
      setProdutos(res.data);
    } catch (err) {
      console.error(err);
      setErro("Erro ao carregar produtos");
    }
  };

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    setImagem(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else setPreview(null);
  };

  const salvar = async () => {
    if (!nome || !preco || !quantidade || !descricao) {
      setErro("Preencha todos os campos");
      return;
    }
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("preco", Number(preco) / 100);
    formData.append("quantidade", quantidade);
    formData.append("descricao", descricao);
    if (imagem) formData.append("imagem", imagem);

    try {
      if (idEditar) await api.put(`/products/${idEditar}`, formData);
      else await api.post("/products", formData);
      limparFormulario();
      fetchProdutos();
    } catch (err) {
      console.error(err);
      setErro("Erro ao salvar produto");
    }
  };

  const limparFormulario = () => {
    setIdEditar(null); setNome(""); setPreco(""); setQuantidade(""); setDescricao(""); setImagem(null); setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const editarProduto = (p) => {
    setIdEditar(p.id); setNome(p.nome); setPreco(String(Math.round(p.preco * 100))); setQuantidade(p.quantidade); setDescricao(p.descricao); setPreview(p.imagem || null);
  };

  const excluirProduto = async (id) => {
    if (!window.confirm("Deseja excluir?")) return;
    try { await api.delete(`/products/${id}`); fetchProdutos(); } catch { setErro("Erro ao excluir produto"); }
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h2>Produtos</h2>
        {erro && <p className="text-danger">{erro}</p>}
        <input className="form-control mb-2" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} />
        <input className="form-control mb-2" placeholder="Preço" value={preco} onChange={e => setPreco(e.target.value.replace(/\D/g,''))} />
        <input className="form-control mb-2" type="number" placeholder="Quantidade" value={quantidade} onChange={e => setQuantidade(e.target.value)} />
        <textarea className="form-control mb-2" placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} />
        <input className="form-control mb-2" type="file" ref={fileInputRef} onChange={handleImagemChange} />
        {preview && <img src={preview} width="120" alt="preview" className="mb-2" style={{objectFit:'cover'}} />}
        <button className="btn btn-primary mb-3" onClick={salvar}>{idEditar ? "Salvar" : "Cadastrar"}</button>
        <hr />
        <input className="form-control mb-2" placeholder="Pesquisar produto..." value={pesquisa} onChange={e => setPesquisa(e.target.value)} />
        <ul className="list-group">
          {produtos.filter(p => p.nome.toLowerCase().includes(pesquisa.toLowerCase())).map(p => (
            <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div className="d-flex gap-3 align-items-center">
                {p.imagem && <img src={p.imagem} width="70" height="70" style={{objectFit:'cover'}} alt={p.nome} />}
                <div><strong>{p.nome}</strong><div>R$ {p.preco}</div><small>Qtd: {p.quantidade}</small></div>
              </div>
              <div>
                <button className="btn btn-warning btn-sm me-2" onClick={()=>editarProduto(p)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={()=>excluirProduto(p.id)}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
