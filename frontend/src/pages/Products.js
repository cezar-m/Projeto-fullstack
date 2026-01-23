import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";

const API_URL = import.meta.env.REACT_APP_API_URL || "http://localhost:3000";

export default function Products() {
  const [produtos, setProdutos] = useState([]);
  const [erro, setErro] = useState("");

  // ---------- FORMULÁRIO ----------
  const [idEditar, setIdEditar] = useState(null);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState(""); // centavos
  const [quantidade, setQuantidade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagem, setImagem] = useState(null);
  const [preview, setPreview] = useState(null);

  // ---------- FILTROS ----------
  const [busca, setBusca] = useState("");
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const [ordenacao, setOrdenacao] = useState("");

  // ---------- PAGINAÇÃO ----------
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  useEffect(() => {
    fetchProdutos();
  }, []);

  // ---------- BUSCAR PRODUTOS ----------
  const fetchProdutos = async () => {
    try {
      const res = await api.get("/api/products");

      const dados = res.data.map((p) => ({
        ...p,
        preco: Number(p.preco),
      }));

      setProdutos(dados);
    } catch {
      setErro("Erro ao carregar produtos");
    }
  };

  // ---------- PREÇO ----------
  const formatarPrecoInput = (valor) => {
    if (!valor) return "";
    const numero = parseInt(valor.replace(/\D/g, ""), 10);
    if (isNaN(numero)) return "";
    return (numero / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarPrecoLista = (valor) =>
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  const handlePrecoChange = (e) => {
    setPreco(e.target.value.replace(/\D/g, ""));
  };

  // ---------- IMAGEM ----------
  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    setImagem(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // ---------- FILTRAGEM ----------
  const produtosFiltrados = produtos
    .filter((p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase())
    )
    .filter((p) => {
      if (precoMin && p.preco < Number(precoMin)) return false;
      if (precoMax && p.preco > Number(precoMax)) return false;
      return true;
    })
    .sort((a, b) => {
      if (ordenacao === "menor") return a.preco - b.preco;
      if (ordenacao === "maior") return b.preco - a.preco;
      return 0;
    });

  // ---------- PAGINAÇÃO ----------
  const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const produtosPaginados = produtosFiltrados.slice(
    inicio,
    inicio + itensPorPagina
  );

  const mudarPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaAtual(pagina);
    }
  };

  // ---------- CRUD ----------
  const limparFormulario = () => {
    setIdEditar(null);
    setNome("");
    setPreco("");
    setQuantidade("");
    setDescricao("");
    setImagem(null);
    setPreview(null);
  };

  const salvar = async () => {
    if (!nome || !preco || !quantidade || !descricao) {
      setErro("Preencha todos os campos");
      return;
    }

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("preco", preco / 100);
    formData.append("quantidade", quantidade);
    formData.append("descricao", descricao);
    if (imagem) formData.append("imagem", imagem);

    try {
      if (idEditar) {
        await api.put(`/products/${idEditar}`, formData);
      } else {
        await api.post("/products", formData);
      }

      limparFormulario();
      fetchProdutos();
    } catch {
      setErro("Erro ao salvar produto");
    }
  };

  const editarProduto = (p) => {
    setIdEditar(p.id);
    setNome(p.nome);
    setPreco(String(Math.round(p.preco * 100)));
    setQuantidade(p.quantidade);
    setDescricao(p.descricao);
    setPreview(p.imagem ? `${API_URL}/uploads/${p.imagem}` : null);
  };

  const excluirProduto = async (id) => {
    if (!window.confirm("Deseja realmente excluir?")) return;
    await api.delete(`/products/${id}`);
    fetchProdutos();
  };

  return (
    <div>
      <Navbar />

      <div className="container mt-4">
        <h2>Produtos</h2>
        {erro && <p className="text-danger">{erro}</p>}

        {/* FORMULÁRIO */}
        <input className="form-control mb-2" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input className="form-control mb-2" placeholder="Preço" value={formatarPrecoInput(preco)} onChange={handlePrecoChange} />
        <input className="form-control mb-2" type="number" placeholder="Quantidade" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
        <textarea className="form-control mb-2" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        <input className="form-control mb-2" type="file" onChange={handleImagemChange} />

        {preview && <img src={preview} alt="preview" width="120" className="mb-2" />}

        <button className="btn btn-primary" onClick={salvar}>
          {idEditar ? "Salvar Alterações" : "Cadastrar Produto"}
        </button>

        <hr />

        {/* FILTROS */}
        <div className="row mb-3">
          <div className="col-md-3">
            <input className="form-control" placeholder="Buscar nome" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          <div className="col-md-2">
            <input className="form-control" type="number" placeholder="Preço mín" value={precoMin} onChange={(e) => setPrecoMin(e.target.value)} />
          </div>
          <div className="col-md-2">
            <input className="form-control" type="number" placeholder="Preço máx" value={precoMax} onChange={(e) => setPrecoMax(e.target.value)} />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
              <option value="">Ordenar preço</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
            </select>
          </div>
        </div>

        {/* LISTA COM IMAGEM */}
        <ul className="list-group">
          {produtosPaginados.map((p) => (
            <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                {p.imagem && (
                  <img
                    src={`${API_URL}/uploads/${p.imagem}`}
                    alt={p.nome}
                    style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 6 }}
                  />
                )}

                <div>
                  <strong>{p.nome}</strong>
                  <div>{formatarPrecoLista(p.preco)}</div>
                  <small>Qtd: {p.quantidade}</small>
                </div>
              </div>

              <div>
                <button className="btn btn-warning btn-sm me-2" onClick={() => editarProduto(p)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => excluirProduto(p.id)}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>

        {/* PAGINAÇÃO */}
        <nav className="mt-3">
          <ul className="pagination">
            <li className="page-item">
              <button className="page-link" onClick={() => mudarPagina(paginaAtual - 1)}>Anterior</button>
            </li>

            {Array.from({ length: totalPaginas }).map((_, i) => (
              <li key={i} className={`page-item ${paginaAtual === i + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => mudarPagina(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}

            <li className="page-item">
              <button className="page-link" onClick={() => mudarPagina(paginaAtual + 1)}>Próxima</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
