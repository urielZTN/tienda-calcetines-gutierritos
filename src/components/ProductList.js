// src/components/ProductList.js
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [filter, setFilter] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filter, q, page]);

  async function fetchCategories() {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) return console.error(error);
    setCats(data);
  }

  async function fetchProducts() {
    setLoading(true);
    try {
      let query = supabase.from("products").select("*").order("created_at", { ascending: false });
      if (filter) query = query.eq("category_id", filter);
      if (q) query = query.ilike("name", `%${q}%`);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("fetchProducts", err);
    } finally {
      setLoading(false);
    }
  }

  const addToCart = (product) => {
    const key = "cart_v1";
    const raw = localStorage.getItem(key);
    const current = raw ? JSON.parse(raw) : [];
    const idx = current.findIndex((c) => c.id === product.id);
    if (idx >= 0) current[idx].qty += 1;
    else
      current.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        qty: 1,
        image: product.image_path ? `/img/${product.image_path}` : "/img/calcetines1.jpg"
      });
    localStorage.setItem(key, JSON.stringify(current));
  };

  return (
    <div className="product-section">
      <div className="search-filter">
        <input
          placeholder="Buscar productos..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Todas las categorías</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <div className="product-grid">
          {products.length === 0 && <p>No hay productos disponibles</p>}
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <img
                src={p.image_path ? `/img/${p.image_path}` : "/img/calcetines1.jpg"}
                alt={p.name}
              />
              <h3>{p.name}</h3>
              <p className="desc">{p.description}</p>
              <p className="stock">En existencia: {p.stock}</p>
              <div className="product-footer">
                <span className="price">${Number(p.price).toFixed(2)}</span>
                <button onClick={() => addToCart(p)}>Agregar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pagination">
        <button onClick={() => setPage((s) => Math.max(1, s - 1))}>Anterior</button>
        <span>Página {page}</span>
        <button onClick={() => setPage((s) => s + 1)}>Siguiente</button>
      </div>
    </div>
  );
}
