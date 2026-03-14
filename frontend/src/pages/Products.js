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

  const limparFormulario = () => {
    setIdEditar(null);
    setNome(""); setPreco(""); setQuantidade(""); setDescricao(""); setImagem(null); setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const salvar = async () => {
    if (!nome || !preco || !quantidade || !descricao) { setErro("Preencha todos os campos"); return; }

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("preco", preco);
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

  const editarProduto = (p) => {
    setIdEditar(p.id);
    setNome(p.nome);
    setPreco(String(p.preco));
    setQuantidade(p.quantidade);
    setDescricao(p.descricao);
    setPreview(p.imagem || null);
  };

  const excluirProduto = async (id) => {
    if (!window.confirm("Deseja excluir?")) return;
    try { await api.delete(`/products/${id}`); fetchProdutos(); } catch(err){ console.error(err); }
  };

  let lista = produtos.filter(p => p.nome.toLowerCase().includes(pesquisa.toLowerCase()));
  if (filtroPreco === "maior") lista = lista.filter(p => Number(p.preco) === Math.max(...lista.map(p => Number(p.preco))));
  if (filtroPreco === "menor") lista = lista.filter(p => Number(p.preco) === Math.min(...lista.map(p => Number(p.preco))));

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h2>Produtos</h2>
        {erro && <p className="text-danger">{erro}</p>}

        <input placeholder="Nome" value={nome} onChange={e=>setNome(e.target.value)} />
        <input placeholder="Preço" value={preco} onChange={e=>setPreco(e.target.value)} />
        <input type="number" placeholder="Quantidade" value={quantidade} onChange={e=>setQuantidade(e.target.value)} />
        <textarea placeholder="Descrição" value={descricao} onChange={e=>setDescricao(e.target.value)} />
        <input type="file" ref={fileInputRef} onChange={handleImagemChange} />
        {preview && <img src={preview} alt="preview" style={{ width:"120px", height:"120px", objectFit:"contain", border:"1px solid #ccc", borderRadius:"8px"}} />}

        <button onClick={salvar}>{idEditar ? "Salvar Alterações" : "Cadastrar Produto"}</button>

        <hr />
        <input placeholder="Pesquisar..." value={pesquisa} onChange={e=>setPesquisa(e.target.value)} />

        <ul>
          {lista.map(p => (
            <li key={p.id}>
              <img src={p.imagem || "https://via.placeholder.com/70"} alt={p.nome} style={{ width: "70px", height: "70px", objectFit: "contain" }} />
              <strong>{p.nome}</strong> - {p.preco} - Qtd: {p.quantidade}
              <button onClick={()=>editarProduto(p)}>Editar</button>
              <button onClick={()=>excluirProduto(p.id)}>Excluir</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
