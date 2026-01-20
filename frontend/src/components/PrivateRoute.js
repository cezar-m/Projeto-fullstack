// components/PrivateRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    // Não logado, volta para login
    return <Navigate to="/" replace />;
  }

  return children; // Usuário logado, renderiza a rota
}
