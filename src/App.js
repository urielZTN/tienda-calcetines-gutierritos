// src/App.js
import React, { useEffect, useState } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminPanel from "./components/AdminPanel";
import Cart from "./components/Cart";
import Home from "./components/Home";
import Header from "./components/Header";

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [viewCart, setViewCart] = useState(false);

  useEffect(() => {
    // Obtener sesión
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    // Obtener nombre y rol del perfil
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error perfil:", error);
        return;
      }
      setProfile(data);
    };
    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
  };

  // Si no hay sesión (login/register)
  if (!user) {
    return (
      <div className="auth-page">
        <h1>Tienda Calcetines Gutierritos</h1>
        <div className="auth-forms">
          <Login />
          <Register />
        </div>
      </div>
    );
  }

  // Si es admin
  if (profile?.role === "admin") {
    return (
      <div>
        <header className="sticky-header">
          <h1>Tienda Calcetines - Admin</h1>
          <div className="menu-buttons">
            <button onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </header>
        <main>
          <AdminPanel />
        </main>
      </div>
    );
  }

  // Usuario normal
  return (
    <div>
      <header className="sticky-header">
        <h1>Tienda Calcetines Gutierritos</h1>
        <div className="menu-buttons">
          <button onClick={() => setViewCart((s) => !s)}>Carrito</button>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>

      <main>
        <Home user={user} />
        {viewCart && <Cart />}
      </main>
    </div>
  );
}

export default App;
