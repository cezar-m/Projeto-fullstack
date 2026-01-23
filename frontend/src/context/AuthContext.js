import { createContext, useState, useEffect } from "react";
import api from "../api/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Carrega usuário se existir token
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔹 Login
  const login = async (email, senha) => {
    try {
      const { data } = await api.post("/api/auth/login", {
        email,
        senha,
      });

      // salva token
      localStorage.setItem("token", data.token);

      // backend retorna: id, nome, role
      setUser({
        id: data.id,
        nome: data.nome,
        role: data.role,
      });

      return data; // opcional, útil no Login.jsx
    } catch (err) {
      throw err;
    }
  };

  // 🔹 Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
