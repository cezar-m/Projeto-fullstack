import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div>
      <Navbar />

      <div className="container mt-4">
        <h2>Bem-vindo(a), {user.nome}!</h2>

        <div className="mt-4 d-flex gap-2">
          {/* 🔒 USUÁRIOS → SOMENTE ADMIN */}
          {user.role === "admin" && (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/users")}
            >
              Usuários
            </button>
          )}

          {/* ✅ PRODUTOS → TODOS */}
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/products")}
          >
            Produtos
          </button>
        </div>

        <p className="mt-3">
          Utilize os botões acima para navegar pelo sistema.
        </p>
      </div>
    </div>
  );
}
