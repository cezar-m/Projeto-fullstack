import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../img/logo.png";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      {/* LOGO CLICÁVEL */}
      <img
        src={logo}
        alt="Logo"
        style={{
          height: "40px",
          cursor: "pointer"
        }}
        onClick={goToDashboard}
      />

      <span className="navbar-text text-white ms-3">
        Usuário: {user?.nome}
      </span>

      <button className="btn btn-danger ms-auto" onClick={handleLogout}>
        Sair
      </button>
    </nav>
  );
}
