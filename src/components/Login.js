// src/components/Login.js
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMensaje("Error: " + error.message);
    else setMensaje("¡Inicio de sesión exitoso! ✅");
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Iniciando sesión..." : "Entrar"}
        </button>
      </form>
      
      {/* Botón de Google comentado temporalmente */}
      {/*
      <button onClick={handleLoginGoogle} className="google-btn" disabled={loading}>
        Iniciar con Google
      </button>
      */}
      
      <div className="auth-features">
        <p>🔐 Autenticación segura con Supabase</p>
        <p>⚡ Inicio de sesión rápido</p>
        <p>🎯 Acceso inmediato a tu cuenta</p>
      </div>
      
      {mensaje && <p className={mensaje.includes("Error") ? "error-message" : "success-message"}>{mensaje}</p>}
    </div>
  );
};

export default Login;