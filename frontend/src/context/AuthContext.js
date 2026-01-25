// AuthContext.js
import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Recupera usuário do localStorage se já estiver logado
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  // URL do backend pelo .env (React)
  const API = process.env.REACT_APP_API_URL + "/api";

  // LOGIN
  const login = async (email, senha) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/auth/login`,
        { email, senha },
        { headers: { "Content-Type": "application/json" } }
      );

      const userData = {
        id: res.data.id,
        nome: res.data.nome,
        role: res.data.role,
        token: res.data.token,
      };

      // Salva no estado e localStorage
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", res.data.token);

      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);

      let message = "Erro desconhecido";
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }

      console.error("❌ ERRO LOGIN FRONTEND:", err.response || err.message);
      return { success: false, message };
    }
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acessar o contexto
export const useAuth = () => useContext(AuthContext);
