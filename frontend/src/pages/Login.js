import { useState, useContext } from "react";
import api from "../api/api"; // Axios configurado
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import "../styles_login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleLogin = async () => {
    setErro("");

    // 🔴 Validação frontend
    if (!email || !senha) {
      setErro("Digite usuário e senha");
      return;
    }

    try {
      // 🔹 Chamada ao backend
      const res = await api.post("http://localhost:3000/auth/login", { email, senha });

      // 🔹 Dados do usuário retornados pelo backend
      const usuario = {
        id: res.data.id,
        nome: res.data.nome,
        role: res.data.role
      };

      // 🔹 Salva no AuthContext (userData primeiro, token depois)
      login(usuario, res.data.token);

      // 🔹 Redireciona para o Dashboard
      navigate("/dashboard");

    } catch (err) {
      if (err.response && err.response.data) {
        setErro(err.response.data.message || "Usuário ou senha inválidos");
      } else {
        setErro("Erro ao conectar com o servidor");
      }
    }
  };

  return (
	<div className="login-page">
		<div style={{ width: "300px", margin: "100px auto" }}>
		<h2>Login</h2>

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

			{erro && (
			<p style={{ color: "red", fontSize: "14px" }}>
				{erro}
			</p>
			)}

			<button
				onClick={handleLogin}
				style={{ width: "100%", marginTop: "10px" }}
			>
				Entrar
			</button>

			<button
				onClick={() => navigate("/register-user")}
				style={{
				width: "100%",
				marginTop: "10px",
				background: "#eee",
				color: "#000"
				}}
			>
				Cadastrar Usuário
			</button>

			{/* 🔹 Botão Esqueci minha senha */}
			<button
				onClick={() => navigate("/forgot-password")}
				style={{
					width: "100%",
					marginTop: "10px",
					background: "#f8d7da",
					color: "#721c24",
					border: "1px solid #f5c6cb"
				}}
			>
				Esqueci minha senha
			</button>
		</div>
	</div>
  );
}