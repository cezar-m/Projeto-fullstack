import { useState, useContext } from "react";
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

    // ✅ Validação frontend
    if (!email || !senha) {
      setErro("Digite usuário e senha");
      return;
    }

    try {
      // ✅ LOGIN CENTRALIZADO NO CONTEXT
      await login(email, senha);

      // ✅ Redireciona após login
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.data?.message) {
        setErro(err.response.data.message);
      } else {
        setErro("Usuário ou senha inválidos");
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
