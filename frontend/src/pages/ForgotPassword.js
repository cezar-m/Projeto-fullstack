import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!email) {
      setErro("Digite o seu email");
      return;
    }

    // ✅ NÃO EXISTE ENVIO DE EMAIL NO BACKEND
    setSucesso("Redirecionando para redefinição de senha...");

    setTimeout(() => {
      navigate(`/reset-password/${email}`);
    }, 1000);
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
          Continuar
        </button>
      </form>
    </div>
  );
}
