import React, { useState, useEffect } from "react";
import "../App.css";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("tarjeta");
  const [cardInfo, setCardInfo] = useState({
    type: "visa",
    number: "",
    exp: "",
    cvv: "",
  });

  // ✅ Cargar carrito inicial
  useEffect(() => {
    const stored = localStorage.getItem("cart_v1");
    if (stored) {
      const parsed = JSON.parse(stored);
      setItems(parsed);
      calcTotal(parsed);
    }
  }, []);

  // ✅ NUEVO: Escuchar cambios en tiempo real del localStorage
  // Esto hace que el carrito se actualice aunque esté abierto
  useEffect(() => {
    const interval = setInterval(() => {
      const updated = JSON.parse(localStorage.getItem("cart_v1")) || [];
      setItems((prev) => {
        // Evita actualizaciones innecesarias si no hay cambios
        if (JSON.stringify(prev) !== JSON.stringify(updated)) {
          calcTotal(updated);
          return updated;
        }
        return prev;
      });
    }, 500); // cada medio segundo verifica cambios

    return () => clearInterval(interval);
  }, []);

  const calcTotal = (arr) => {
    const sum = arr.reduce((acc, p) => acc + p.price * p.qty, 0);
    setTotal(sum);
  };

  const updateQty = (id, delta) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    );
    setItems(updated);
    localStorage.setItem("cart_v1", JSON.stringify(updated));
    calcTotal(updated);
  };

  const removeItem = (id) => {
    const filtered = items.filter((item) => item.id !== id);
    setItems(filtered);
    localStorage.setItem("cart_v1", JSON.stringify(filtered));
    calcTotal(filtered);
  };

  const handleCardChange = (e) => {
    setCardInfo({ ...cardInfo, [e.target.name]: e.target.value });
  };

  const handlePayment = () => {
    if (paymentMethod === "tarjeta") {
      alert(
        `Pago con tarjeta ${cardInfo.type} procesado correctamente.\nNúmero: ${cardInfo.number}`
      );
    } else {
      alert("Pago en efectivo registrado correctamente.");
    }
    setShowPayment(false);
    setItems([]);
    localStorage.removeItem("cart_v1");
    setTotal(0);
  };

  if (items.length === 0) {
    return (
      <aside className="cart">
        <h3>Carrito</h3>
        <p>No hay productos agregados.</p>
      </aside>
    );
  }

  return (
    <aside className="cart">
      <h3>Carrito</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <img src={item.image} alt={item.name} />
            <div className="cart-info">
              <p className="cart-name">{item.name}</p>
              <p>${item.price.toFixed(2)}</p>
              <div className="qty-controls">
                <button onClick={() => updateQty(item.id, -1)}>-</button>
                <span>{item.qty}</span>
                <button onClick={() => updateQty(item.id, +1)}>+</button>
              </div>
              <p className="subtotal">
                Subtotal: ${(item.price * item.qty).toFixed(2)}
              </p>
            </div>
            <button className="remove-btn" onClick={() => removeItem(item.id)}>
              ✖
            </button>
          </li>
        ))}
      </ul>
      <h4>Total: ${total.toFixed(2)}</h4>

      {/* Botón de pagar decorado */}
      <button className="checkout-btn" onClick={() => setShowPayment(true)}>
        💳 Pagar
      </button>

      {showPayment && (
        <div className="payment-modal">
          <div className="payment-content">
            <h3>Realizar Pago</h3>

            <label>Método de pago:</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="tarjeta">Tarjeta</option>
              <option value="efectivo">Efectivo</option>
            </select>

            {paymentMethod === "tarjeta" && (
              <div id="card-info">
                <label>Tipo de tarjeta:</label>
                <select
                  name="type"
                  value={cardInfo.type}
                  onChange={handleCardChange}
                >
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">American Express</option>
                </select>

                <label>Número de tarjeta:</label>
                <input
                  type="text"
                  name="number"
                  value={cardInfo.number}
                  onChange={handleCardChange}
                  placeholder="0000 0000 0000 0000"
                />

                <label>Fecha expiración:</label>
                <input
                  type="text"
                  name="exp"
                  value={cardInfo.exp}
                  onChange={handleCardChange}
                  placeholder="MM/AA"
                />

                <label>CVV:</label>
                <input
                  type="text"
                  name="cvv"
                  value={cardInfo.cvv}
                  onChange={handleCardChange}
                  placeholder="123"
                />
              </div>
            )}

            {paymentMethod === "efectivo" && (
              <div id="cash-info">
                <p>El pago en efectivo se realizará al momento de la entrega.</p>
              </div>
            )}

            <button onClick={handlePayment}>Confirmar Pago</button>
            <button className="close-btn" onClick={() => setShowPayment(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
