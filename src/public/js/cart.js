document.addEventListener("DOMContentLoaded", async () => {
  const cartContainer = document.getElementById("cart-container");
  const emptyBtn = document.getElementById("empty-cart-btn");

  let cartId = localStorage.getItem("cartId");

  // Crear carrito automáticamente si no existe
  if (!cartId) {
    try {
      const res = await fetch("/api/carts", { method: "POST" });
      const newCart = await res.json();
      cartId = newCart._id;
      localStorage.setItem("cartId", cartId);
    } catch {
      cartContainer.innerHTML = "<p>No se pudo crear un carrito.</p>";
      return;
    }
  }

  // Función para renderizar carrito
  const renderCart = async () => {
    try {
      const res = await fetch(`/api/carts/${cartId}`);
      const cart = await res.json();

      if (!cart.products || cart.products.length === 0) {
        cartContainer.innerHTML = "<p>Tu carrito está vacío 🛍️</p>";
        return;
      }

      let html = "<ul>";
      cart.products.forEach(item => {
        const prod = item.product;
        const quantity = item.quantity || 1;
        const imgSrc = prod.thumbnails && prod.thumbnails.length 
                      ? prod.thumbnails[0] 
                      : '';

        html += `
          <li>
            <img src="${imgSrc}" alt="${item.product.title}" width="50" style="vertical-align: middle;" />
            <strong>${item.product.title}</strong> - $${item.product.price} c/u
            x <input type="number" min="1" value="${item.quantity}" data-id="${item.product._id}" class="qty-input" />
            = $${item.product.price * item.quantity}
            <button class="remove-btn" data-id="${item.product._id}">❌</button>
          </li>`;
      });
      html += "</ul>";
      cartContainer.innerHTML = html;

      // Eventos para eliminar producto
      document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const pid = btn.dataset.id;
          await fetch(`/api/carts/${cartId}/products/${pid}`, { method: "DELETE" });
          renderCart();
        });
      });

      // Eventos para actualizar cantidad
      document.querySelectorAll(".qty-input").forEach(input => {
        input.addEventListener("change", async () => {
          const pid = input.dataset.id;
          const quantity = parseInt(input.value);
          if (quantity < 1) return;
          await fetch(`/api/carts/${cartId}/products/${pid}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity })
          });
          renderCart();
        });
      });

    } catch (err) {
      console.error(err);
      cartContainer.innerHTML = "<p>Error al cargar el carrito.</p>";
    }
  };

  renderCart();

  // Vaciar carrito
  emptyBtn.addEventListener("click", async () => {
    await fetch(`/api/carts/${cartId}`, { method: "DELETE" });
    renderCart();
  });
});