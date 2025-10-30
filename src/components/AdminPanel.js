// src/components/AdminPanel.js
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image_path: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [editingProduct, setEditingProduct] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) return console.error(error);
    setCategories(data);
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) console.error(error);
    else setProducts(data);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const addProduct = async () => {
    setMessage("");
    if (!newProduct.name || !newProduct.slug || !newProduct.price || !newProduct.stock || !newProduct.category_id) {
      setMessage("❌ Por favor completa todos los campos obligatorios");
      return;
    }
    try {
      const { error } = await supabase.from("products").insert([{
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        category_id: parseInt(newProduct.category_id),
        is_active: true
      }]);
      if (error) throw error;
      setMessage("✔ Producto agregado correctamente!");
      setNewProduct({ name: "", slug: "", description: "", price: "", stock: "", category_id: "", image_path: "" });
      fetchProducts();
    } catch {
      setMessage("❌ Error al agregar producto");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("¿Seguro quieres eliminar este producto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) setMessage("❌ Error al eliminar");
    else { setMessage("✔ Producto eliminado"); fetchProducts(); }
  };

  const startEdit = (p) => { setEditingId(p.id); setEditingProduct({ ...p }); };
  const cancelEdit = () => { setEditingId(null); setEditingProduct({}); };
  const saveEdit = async () => {
    try {
      const { error } = await supabase.from("products").update({
        ...editingProduct,
        price: parseFloat(editingProduct.price),
        stock: parseInt(editingProduct.stock),
        category_id: parseInt(editingProduct.category_id)
      }).eq("id", editingId);
      if (error) throw error;
      setMessage("✔ Producto actualizado");
      setEditingId(null);
      setEditingProduct({});
      fetchProducts();
    } catch {
      setMessage("❌ Error al actualizar");
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="admin-panel">
      <h2>Panel de Administración</h2>
      <div className="add-product">
        <h3>Agregar nuevo producto</h3>
        <input placeholder="Nombre" name="name" value={newProduct.name} onChange={handleInputChange}/>
        <input placeholder="Slug" name="slug" value={newProduct.slug} onChange={handleInputChange}/>
        <input placeholder="Descripción" name="description" value={newProduct.description} onChange={handleInputChange}/>
        <input type="number" placeholder="Precio" name="price" value={newProduct.price} onChange={handleInputChange}/>
        <input type="number" placeholder="Stock" name="stock" value={newProduct.stock} onChange={handleInputChange}/>
        <select name="category_id" value={newProduct.category_id} onChange={handleInputChange}>
          <option value="">Selecciona categoría</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input placeholder="Imagen (ej: calcetin1.jpg)" name="image_path" value={newProduct.image_path} onChange={handleInputChange}/>
        <button onClick={addProduct}>Agregar Producto</button>
        {message && <p>{message}</p>}
      </div>

      <h3>Productos existentes</h3>
      {loading ? <p>Cargando...</p> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Slug</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Categoría</th>
              <th>Imagen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{editingId === p.id ? <input type="number" name="id" value={editingProduct.id} onChange={handleEditChange}/> : p.id}</td>
                <td>{editingId === p.id ? <input name="name" value={editingProduct.name} onChange={handleEditChange}/> : p.name}</td>
                <td>{editingId === p.id ? <input name="slug" value={editingProduct.slug} onChange={handleEditChange}/> : p.slug}</td>
                <td>{editingId === p.id ? <input name="description" value={editingProduct.description} onChange={handleEditChange}/> : p.description}</td>
                <td>{editingId === p.id ? <input type="number" name="price" value={editingProduct.price} onChange={handleEditChange}/> : p.price}</td>
                <td>{editingId === p.id ? <input type="number" name="stock" value={editingProduct.stock} onChange={handleEditChange}/> : p.stock}</td>
                <td>{editingId === p.id ? (
                  <select name="category_id" value={editingProduct.category_id} onChange={handleEditChange}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                ) : p.category_id}</td>
                <td>{editingId === p.id ? <input name="image_path" value={editingProduct.image_path} onChange={handleEditChange}/> : <img src={`/img/${p.image_path}`} alt={p.name} className="product-img"/>}</td>
                <td>
                  {editingId === p.id ? (
                    <>
                      <button onClick={saveEdit}>Guardar</button>
                      <button onClick={cancelEdit}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(p)}>Editar</button>
                      <button onClick={() => deleteProduct(p.id)}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
