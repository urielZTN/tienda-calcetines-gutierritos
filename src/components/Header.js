// src/components/Header.js
import React from "react";

export default function Header({ userName, onToggleCart, onLogout }) {
  return (
    <header className="header-fixed">
      <div className="header-left">
        <h1>Tienda Calcetines Gutierritos</h1>
      </div>
      <div className="header-right">
        <span className="welcome-text">¡Bienvenido {userName}!</span>
        <button onClick={onToggleCart}>Carrito</button>
        <button onClick={onLogout}>Cerrar sesión</button>
      </div>
    </header>
  );
}
