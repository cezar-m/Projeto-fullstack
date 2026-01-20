import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function ResetPassword() {
  const { email } = useParams(); // email preenchido automaticamente
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!senha || !confirmaSenha) {
      setErro("Preencha ambos os campos");
      return;
    }

    if (senha !== confirmaSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    try {
      // Chamada ao backend para atualizar a senha
      await api.put("/auth/atualizarsenha", { email, senha });
      setSucesso("Senha atualizada com sucesso!");
      setTimeout(() => navigate("/"), 2000); // redireciona para login
    } catch (err) {
      console.error(err);
      setErro("Erro ao atualizar a senha");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Redefinir senha</h2>

      {erro && <p style={{ color: "red" }}>{erro}</p>}
      {sucesso && <p style={{ color: "green" }}>{sucesso}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          readOnly
          className="form-control mb-2"
        />
        <input
          type="password"
          placeholder="Nova senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="form-control mb-2"
        />
        <input
          type="password"
          placeholder="Confirme a nova senha"
          value={confirmaSenha}
          onChange={(e) => setConfirmaSenha(e.target.value)}
          className="form-control mb-2"
        />
        <button type="submit" className="btn btn-primary w-100">
          Atualizar Senha
        </button>
      </form>
    </div>
  );
}