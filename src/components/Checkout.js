// src/components/Checkout.js
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Checkout({ cartItems, onPaid }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handlePayment = async () => {
    if (!name || !email || !address) {
      alert("Por favor completa todos los campos");
      return;
    }
    if (paymentMethod === "tarjeta" && (!cardNumber || !expiry || !cvv)) {
      alert("Por favor completa los datos de tarjeta");
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      const order = {
        user_id: userId,
        total,
        created_at: new Date(),
        items: cartItems,
        name,
        email,
        address,
        payment_method: paymentMethod,
        card_number: paymentMethod === "tarjeta" ? cardNumber : null,
        card_expiry: paymentMethod === "tarjeta" ? expiry : null,
        card_cvv: paymentMethod === "tarjeta" ? cvv : null,
      };

      const { error } = await supabase.from("orders").insert([order]);
      if (error) throw error;

      // limpiar carrito
      localStorage.removeItem("cart_v1");
      onPaid(); // callback para actualizar vista carrito
      alert("Pago realizado con éxito ✅");
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: "600px",
      margin: "20px auto",
      padding: "20px",
      borderRadius: "12px",
      backgroundColor: "#f9f9f9",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      color: "#000"
    }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Pago de tu pedido</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input type="text" placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
        <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <input type="text" placeholder="Dirección" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />

        <label>Método de pago:</label>
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={inputStyle}>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
        </select>

        {paymentMethod === "tarjeta" && (
          <>
            <input type="text" placeholder="Número de tarjeta" value={cardNumber} onChange={e => setCardNumber(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="MM/AA" value={expiry} onChange={e => setExpiry(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="CVV" value={cvv} onChange={e => setCvv(e.target.value)} style={inputStyle} />
          </>
        )}
      </div>

      <h3 style={{ marginTop: "20px", textAlign: "center" }}>Total: ${total.toFixed(2)}</h3>

      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          marginTop: "16px",
          width: "100%",
          padding: "12px",
          backgroundColor: "#178b62",
          color: "#fff",
          fontWeight: "bold",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          fontSize: "16px",
          transition: "0.3s"
        }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = "#21acbb"}
        onMouseOut={e => e.currentTarget.style.backgroundColor = "#178b62"}
      >
        {loading ? "Procesando..." : "Pagar"}
      </button>
    </div>
  );
}

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "16px"
};
