import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function RegisterUser() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("user");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function handleRegister() {
    setErro("");
    setSucesso("");

    // 🔴 Validação
    if (!nome || !email || !senha) {
      setErro("Preencha todos os campos");
      return;
    }

    try {
      const response = await api.post("/api/auth/register-user", {
        nome,
        email,
        senha,
        role
      });

      setSucesso(response.data.message || "Usuário cadastrado com sucesso!");
       // 🔹 Redireciona para o Dashboard
	  navigate("/"); // <--- Aqui

    } catch (err) {
      console.error(err);
      if (err.response) {
        setErro(err.response.data.error || err.response.data.message || "Erro ao cadastrar");
      } else {
        setErro("Erro ao conectar com o servidor");
      }
    }
  }

  return (
    <div style={{ width: "320px", margin: "100px auto" }}>
      <h2>Cadastrar Usuário</h2>

      <input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      >
        <option value="user">Usuário</option>
        <option value="admin">Administrador</option>
      </select>

      {erro && <p style={{ color: "red", fontSize: "14px" }}>{erro}</p>}
      {sucesso && <p style={{ color: "green", fontSize: "14px" }}>{sucesso}</p>}

      <button
        onClick={handleRegister}
        style={{ width: "100%", marginTop: "10px" }}
      >
        Cadastrar
      </button>

      <button
        onClick={() => navigate("/")}
        style={{
          width: "100%",
          marginTop: "10px",
          background: "#eee",
          color: "#000"
        }}
      >
        Voltar para Login
      </button>
    </div>
  );
}
