import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Products() {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [erro, setErro] = useState("");

  // FORMULÁRIO
  const [idEditar, setIdEditar] = useState(null);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagem, setImagem] = useState(null);
  const [preview, setPreview] = useState(null);

  // FILTROS
  const [busca, setBusca] = useState("");
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const [ordenacao, setOrdenacao] = useState("");

  // PAGINAÇÃO
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  useEffect(() => {
    fetchProdutos();
    // eslint-disable-next-line
  }, []);

  const fetchProdutos = async () => {
    try {
      const res = await api.get("/products", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const dados = res.data.map((p) => ({ ...p, preco: Number(p.preco) }));
      setProdutos(dados);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setErro("Erro ao carregar produtos");
    }
  };

  // PREÇO
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

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    setImagem(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else setPreview(null);
  };

  // FILTRAGEM E PAGINAÇÃO
  const produtosFiltrados = produtos
    .filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()))
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

  const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const produtosPaginados = produtosFiltrados.slice(inicio, inicio + itensPorPagina);

  const mudarPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) setPaginaAtual(pagina);
  };

  // CRUD
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
        await api.put(`/products/${idEditar}`, formData, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
      } else {
        await api.post("/products", formData, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
      }

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
    setPreco(String(Math.round(p.preco * 100)));
    setQuantidade(p.quantidade);
    setDescricao(p.descricao);
    setPreview(p.imagem ? `${process.env.REACT_APP_API_URL}/uploads/${p.imagem}` : null);
  };

  const excluirProduto = async (id) => {
    if (!window.confirm("Deseja realmente excluir?")) return;
    await api.delete(`/products/${id}`, {
      headers: { Authorization: `Bearer ${user?.token}` },
    });
    fetchProdutos();
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h2>Produtos</h2>
        {erro && <p className="text-danger">{erro}</p>}
        {/* Formulário */}
        {/* ... (inputs e botões, igual seu código) ... */}
      </div>
    </div>
  );
}
