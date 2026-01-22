import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!email) {
      setErro("Digite o seu email");
      return;
    }

    try {
      // Chamada ao backend para enviar link/código de redefinição
      await api.get(`https://projeto-fullstack-mu.vercel.app/auth/redefinirsenha/${email}`);
      setSucesso(
        "Email enviado! Clique no link recebido para redefinir a senha."
      );

      // Redireciona para tela de reset passando o email
      setTimeout(() => navigate(`/reset-password/${email}`), 2000);
    } catch (err) {
      console.error(err);
      setErro("Erro ao enviar email de redefinição");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Esqueci minha senha</h2>

      {erro && <p style={{ color: "red" }}>{erro}</p>}
      {sucesso && <p style={{ color: "green" }}>{sucesso}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control mb-2"
        />
        <button type="submit" className="btn btn-primary w-100">
          Enviar
        </button>
      </form>
    </div>
  );
}
