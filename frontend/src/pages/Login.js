import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import "../styles_login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleLogin = async () => {
    setErro("");

    if (!email || !senha) {
      setErro("Digite usuário e senha");
      return;
    }

    const res = await login(email, senha);

    if (res.success) {
      navigate("/dashboard");
    } else {
      setErro(res.message);
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
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {erro && <p style={{ color: "red" }}>{erro}</p>}

        <button onClick={handleLogin}>Entrar</button>

        <button onClick={() => navigate("/register-user")}>
          Cadastrar Usuário
        </button>

        <button onClick={() => navigate("/forgot-password")}>
          Esqueci minha senha
        </button>
      </div>
    </div>
  );
}
