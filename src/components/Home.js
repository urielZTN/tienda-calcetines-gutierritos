// src/components/Home.js
import React, { useEffect, useState } from "react";
import ProductList from "./ProductList";

export default function Home({ user }) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (user?.email) {
      // Si el correo es "uriel@gmail.com", se mostrará "uriel"
      const extractedName = user.email.split("@")[0];
      setName(extractedName.charAt(0).toUpperCase() + extractedName.slice(1));
    }
  }, [user]);

  return (
    <div className="home-container">
      <section className="welcome-banner">
        <div className="welcome-content">
          <h1 className="welcome-title">🧦 ¡Bienvenido {name || "Usuario"}! 🧦</h1>
          <p className="welcome-text">
            ¡Nos alegra verte de nuevo en <span>Calcetines Gutierritos</span>! 🎉
            <br />
            Explora nuestra gran variedad de calcetines: deportivos, formales y de uso diario.
            <br />
            ¡Añade tus favoritos al carrito y luce con estilo!
          </p>
          <button className="explore-btn">Explorar productos</button>
        </div>
      </section>

      {/* Lista de productos */}
      <ProductList />
    </div>
  );
}
