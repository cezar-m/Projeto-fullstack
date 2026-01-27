import React, { useState, useEffect, useContext } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";

export default function Users() {
  const [usuarios, setUsuarios] = useState([]);
  const [erro, setErro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const { user } = useContext(AuthContext);

  const usuariosPorPagina = 14;

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔥 CORRIGIDO AQUI (REMOVIDO /api DUPLICADO)
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsuarios(res.data);
    } catch (err) {
      console.error("Erro ao listar usuários:", err);
      setErro("Erro ao carregar usuários");
    }
  };

  // PAGINAÇÃO
  const indiceUltimo = paginaAtual * usuariosPorPagina;
  const indicePrimeiro = indiceUltimo - usuariosPorPagina;
  const usuariosPagina = usuarios.slice(indicePrimeiro, indiceUltimo);

  const totalPaginas = Math.ceil(usuarios.length / usuariosPorPagina);

  // DELETAR USUÁRIO (ADMIN)
  const deletarUsuario = async (id) => {
    if (!window.confirm("Deseja realmente excluir este usuário?")) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();

      if (usuariosPagina.length === 1 && paginaAtual > 1) {
        setPaginaAtual(paginaAtual - 1);
      }
    } catch (err) {
      console.error("Erro ao deletar usuário:", err);
      setErro("Erro ao deletar usuário");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="container mt-4">
        <h2>Lista de Usuários</h2>

        {erro && <p className="text-danger">{erro}</p>}

        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Acesso</th>

              {/* 🔥 CORRIGIDO: user.role */}
              {user?.role === "admin" && <th>Ações</th>}
            </tr>
          </thead>

          <tbody>
            {usuariosPagina.map((u) => (
              <tr key={u.id}>
                <td>{u.nome}</td>
                <td>{u.email}</td>

                {/* MANTIDO */}
                <td>{u.acesso}</td>

                {/* 🔥 CORRIGIDO: user.role */}
                {user?.role === "admin" && (
                  <td>
                    {u.id !== user.id && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deletarUsuario(u.id)}
                      >
                        Deletar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}

            {usuariosPagina.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center">
                  Nenhum usuário encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* CONTROLES DE PAGINAÇÃO */}
        {totalPaginas > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <button
              className="btn btn-outline-secondary"
              disabled={paginaAtual === 1}
              onClick={() => setPaginaAtual(paginaAtual - 1)}
            >
              ⬅ Anterior
            </button>

            <span>
              Página {paginaAtual} de {totalPaginas}
            </span>

            <button
              className="btn btn-outline-secondary"
              disabled={paginaAtual === totalPaginas}
              onClick={() => setPaginaAtual(paginaAtual + 1)}
            >
              Próxima ➡
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
