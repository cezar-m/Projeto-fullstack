// AuthContext.js
import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Use a URL do backend no Render
  const API = "https://projeto-fullstack-djir.onrender.com/api";

  const login = async (email, senha) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, { email, senha }, {
        headers: { "Content-Type": "application/json" }
      });

      // Salva dados do usuário no estado
      setUser({
        id: res.data.id,
        nome: res.data.nome,
        role: res.data.role,
        token: res.data.token
      });

      // Salva token no localStorage para requisições futuras
      localStorage.setItem("token", res.data.token);

      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);

      // Mensagem de erro detalhada
      let message = "Erro desconhecido";
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      }

      console.error("❌ ERRO LOGIN FRONTEND:", err.response || err.message);
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
