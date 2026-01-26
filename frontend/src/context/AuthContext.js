import { createContext, useContext, useState } from "react";
import api from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [loading, setLoading] = useState(false);

  // 🔐 LOGIN
  const login = async (email, senha) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, senha });

      const userData = {
        id: res.data.id,
        nome: res.data.nome,
        role: res.data.role,
        token: res.data.token,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", res.data.token);

      return { success: true };
    } catch (err) {
      let message = "Erro ao fazer login";

      if (err.response?.data?.message) {
        message = err.response.data.message;
      }

      console.error("❌ ERRO LOGIN:", err.response || err.message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // 🔒 LOGOUT
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

// Hook para usar o contexto
export const useAuth = () => useContext(AuthContext);
