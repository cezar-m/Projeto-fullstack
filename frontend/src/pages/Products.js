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
  const [filtroPreco, setFiltroPreco] = useState(""); // maior | menor

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      const res = await api.get("/products");
      setProdutos(res.data);
    } catch {
      setErro("Erro ao carregar produtos");
    }
  };

  const handlePrecoChange = (e) => {
    setPreco(e.target.value.replace(/\D/g, ""));
  };

  const formatarPrecoInput = (valor) => {
    if (!valor) return "";
    return (Number(valor) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarPrecoLista = (valor) =>
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

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

  const limparFormulario = () => {
    setIdEditar(null);
    setNome("");
    setPreco("");
    setQuantidade("");
    setDescricao("");
    setImagem(null);
    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    setPreview(p.imagem || null);
  };

  const excluirProduto = async (id) => {
    if (!window.confirm("Deseja excluir?")) return;
    await api.delete(`/products/${id}`);
    fetchProdutos();
  };

  // FILTRO NOME
  let lista = produtos.filter((p) =>
    p.nome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  // FILTRO MAIOR / MENOR PREÇO
  if (filtroPreco === "maior" && lista.length > 0) {
    const maior = Math.max(...lista.map((p) => Number(p.preco)));
    lista = lista.filter((p) => Number(p.preco) === maior);
  }

  if (filtroPreco === "menor" && lista.length > 0) {
    const menor = Math.min(...lista.map((p) => Number(p.preco)));
    lista = lista.filter((p) => Number(p.preco) === menor);
  }

  return (
    <div>
      <Navbar />

      <div className="container mt-4">
        <h2>Produtos</h2>
        {erro && <p className="text-danger">{erro}</p>}

        <input className="form-control mb-2" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input className="form-control mb-2" placeholder="Preço" value={formatarPrecoInput(preco)} onChange={handlePrecoChange} />
        <input className="form-control mb-2" type="number" placeholder="Quantidade" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
        <textarea className="form-control mb-2" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        <input className="form-control mb-2" type="file" ref={fileInputRef} onChange={handleImagemChange} />

        {preview && <img src={preview} alt="preview" width="120" className="mb-2" />}

        <button className="btn btn-primary" onClick={salvar}>
          {idEditar ? "Salvar Alterações" : "Cadastrar Produto"}
        </button>

        <hr />

        {/* PESQUISA */}
        <input
          className="form-control mb-2"
          placeholder="Pesquisar produto..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
        />

        {/* BOTÕES MAIOR / MENOR */}
        <div className="mb-3 d-flex gap-2">
          <button className="btn btn-success btn-sm" onClick={() => setFiltroPreco("maior")}>
            Maior Preço
          </button>
          <button className="btn btn-info btn-sm" onClick={() => setFiltroPreco("menor")}>
            Menor Preço
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setFiltroPreco("")}>
            Limpar Filtro
          </button>
        </div>

        <ul className="list-group">
          {lista.map((p) => (
            <li key={p.id} className="list-group-item d-flex justify-content-between">
              <div className="d-flex gap-3">
                {p.imagem && (
                  <img src={p.imagem} alt={p.nome} width="70" height="70" style={{ objectFit: "cover" }} />
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
      </div>
    </div>
  );
}
