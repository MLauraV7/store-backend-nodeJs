document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-to-cart");
  if (!btn) return;
  const pid = btn.dataset.pid || btn.dataset.id;
  if (!pid) return alert("ID de producto no encontrado");
  addToCart(pid);
});

document.addEventListener("DOMContentLoaded", () => {
  updateCartLink();
  loadCartOnPage();
});

function isValidObjectId(id) {
  return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);
}

async function getOrCreateCart() {
  let cartId = localStorage.getItem("cartId");
  if (cartId && !isValidObjectId(cartId)) {
    localStorage.removeItem("cartId");
    cartId = null;
  }

  if (!cartId) {
    const res = await fetch("/api/carts", { method: "POST" });
    if (!res.ok) throw new Error("No se pudo crear carrito");
    const data = await res.json();
    cartId = data._id;
    localStorage.setItem("cartId", cartId);
  }
  return cartId;
}

async function addToCart(pid) {
  try {
    const cartId = await getOrCreateCart();
    const res = await fetch(`/api/carts/${cartId}/products/${pid}`, { method: "POST" });
    if (!res.ok) throw new Error("Error al agregar al carrito");
    alert("Producto agregado al carrito con éxito");
    updateCartLink();
  } catch (err) {
    console.error(err);
    alert("No se pudo agregar el producto al carrito");
  }
}

function updateCartLink() {
  const link = document.getElementById("cart-link");
  const cartId = localStorage.getItem("cartId");
  if (link && cartId && isValidObjectId(cartId)) {
    link.href = `/carts/${cartId}`;
  }
}

async function loadCartOnPage() {
  const container = document.getElementById("cart-container");
  if (!container) return;

  const cartId = localStorage.getItem("cartId");
  if (!cartId) {
    container.innerHTML = "<p>No tenés carrito todavía.</p>";
    return;
  }

  try {
    const res = await fetch(`/api/carts/${cartId}`);
    if (!res.ok) throw new Error("No se encontró carrito");
    const cart = await res.json();

    if (!cart.products || cart.products.length === 0) {
      container.innerHTML = "<p>Tu carrito está vacío.</p>";
      return;
    }

    let html = "<ul>";
    cart.products.forEach(item => {
      const prod = item.product;
      html += `<li>
        <strong>${prod.title}</strong> - $${prod.price} (x${item.quantity})
        <button class="btn remove-from-cart" data-pid="${prod._id}">Eliminar</button>
      </li>`;
    });
    html += "</ul>";
    html += `<button id="empty-cart" class="btn">Vaciar carrito</button>`;
    container.innerHTML = html;

    document.querySelectorAll(".remove-from-cart").forEach(btn => {
      btn.addEventListener("click", async () => {
        const pid = btn.dataset.pid;
        await fetch(`/api/carts/${cartId}/products/${pid}`, { method: "DELETE" });
        await loadCartOnPage();
      });
    });

    const emptyBtn = document.getElementById("empty-cart");
    if (emptyBtn) {
      emptyBtn.addEventListener("click", async () => {
        await fetch(`/api/carts/${cartId}`, { method: "DELETE" });
        await loadCartOnPage();
      });
    }

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Error al cargar carrito.</p>";
  }
}