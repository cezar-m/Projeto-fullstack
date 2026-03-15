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
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProdutos();
  }, []);

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
    setNome("");
    setPreco("");
    setQuantidade("");
    setDescricao("");
    setImagem(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const salvar = async () => {
    if (!nome || !preco || !quantidade || !descricao) {
      setErro("Preencha todos os campos");
      return;
    }

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("preco", preco); // enviar número puro
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
    setPreco(p.preco);
    setQuantidade(p.quantidade);
    setDescricao(p.descricao);
    setPreview(p.imagem || null);
  };

  const excluirProduto = async (id) => {
    if (!window.confirm("Deseja excluir?")) return;
    try { await api.delete(`/products/${id}`); fetchProdutos(); } catch(err){ console.error(err); }
  };

  const listaFiltrada = produtos.filter(p =>
    p.nome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  return (
    <div>
      <Navbar />

      <div className="container mt-4">
        <h2 className="mb-4">Produtos</h2>

        {erro && <div className="alert alert-danger">{erro}</div>}

        <div className="card p-3 mb-4">
          <div className="mb-2">
            <input
              className="form-control"
              placeholder="Nome"
              value={nome}
              onChange={e => setNome(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <input
              type="number"
              className="form-control"
              placeholder="Preço (R$)"
              value={preco}
              onChange={e => setPreco(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <input
              type="number"
              className="form-control"
              placeholder="Quantidade"
              value={quantidade}
              onChange={e => setQuantidade(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <textarea
              className="form-control"
              placeholder="Descrição"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <input
              type="file"
              className="form-control"
              ref={fileInputRef}
              onChange={handleImagemChange}
            />
          </div>

          {preview && (
            <div className="mb-2">
              <img
                src={preview}
                alt="preview"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "contain",
                  border: "1px solid #ccc",
                  borderRadius: "8px"
                }}
              />
            </div>
          )}

          <button className="btn btn-primary me-2" onClick={salvar}>
            {idEditar ? "Salvar Alterações" : "Cadastrar Produto"}
          </button>
          <button className="btn btn-secondary" onClick={limparFormulario}>Limpar</button>
        </div>

        <input
          className="form-control mb-3"
          placeholder="Pesquisar..."
          value={pesquisa}
          onChange={e => setPesquisa(e.target.value)}
        />

        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Imagem</th>
              <th>Nome</th>
              <th>Preço</th>
              <th>Qtd</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.map(p => (
              <tr key={p.id}>
                <td>
                  <img
                    src={p.imagem || "https://via.placeholder.com/70"}
                    alt={p.nome}
                    style={{ width: "70px", height: "70px", objectFit: "contain" }}
                  />
                </td>
                <td>{p.nome}</td>
                <td>{Number(p.preco).toLocaleString("pt-BR", { style:"currency", currency:"BRL" })}</td>
                <td>{p.quantidade}</td>
                <td>
                  <button className="btn btn-warning btn-sm me-2" onClick={() => editarProduto(p)}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => excluirProduto(p.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}
