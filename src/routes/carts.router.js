import express from "express";
import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

const router = express.Router();

// Crear carrito
router.post("/", async (_req, res) => {
  try {
    const cart = await Cart.create({ products: [] });
    res.status(201).json(cart.toObject());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Obtener carrito con productos válidos
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(cid))
      return res.status(404).json({ error: "Carrito no encontrado" });

    const cart = await Cart.findById(cid).populate("products.product");
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    // Filtrar productos eliminados
    cart.products = cart.products.filter(p => p.product !== null);

    res.json(cart.toObject());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Agregar producto o incrementar cantidad
router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid))
      return res.status(400).json({ error: "IDs inválidos" });

    const productExists = await Product.findById(pid);
    if (!productExists) return res.status(404).json({ error: "Producto no encontrado" });

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    const idx = cart.products.findIndex(p => p.product.toString() === pid);
    if (idx !== -1) cart.products[idx].quantity += 1;
    else cart.products.push({ product: pid, quantity: 1 });

    await cart.save();
    const populated = await Cart.findById(cart._id).populate("products.product");
    populated.products = populated.products.filter(p => p.product !== null);

    res.json(populated.toObject());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Reemplazar array de productos
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;
    if (!Array.isArray(products))
      return res.status(400).json({ error: "El body debe contener un array 'products'" });

    for (const item of products) {
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product))
        return res.status(400).json({ error: "Producto con ID inválido en el array" });

      const p = await Product.findById(item.product);
      if (!p) return res.status(404).json({ error: `Producto ${item.product} no existe` });

      if (!item.quantity || typeof item.quantity !== "number" || item.quantity < 1) item.quantity = 1;
    }

    const cart = await Cart.findByIdAndUpdate(cid, { products }, { new: true }).populate("products.product");
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = cart.products.filter(p => p.product !== null);
    res.json(cart.toObject());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Actualizar cantidad de un producto
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid))
      return res.status(400).json({ error: "IDs inválidos" });

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    const item = cart.products.find(p => p.product.toString() === pid);
    if (!item) return res.status(404).json({ error: "El producto no está en el carrito" });

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) return res.status(400).json({ error: "Cantidad inválida" });

    item.quantity = qty;
    await cart.save();

    const populated = await Cart.findById(cart._id).populate("products.product");
    populated.products = populated.products.filter(p => p.product !== null);
    res.json(populated.toObject());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Eliminar un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid))
      return res.status(400).json({ error: "IDs inválidos" });

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();

    const populated = await Cart.findById(cart._id).populate("products.product");
    populated.products = populated.products.filter(p => p.product !== null);
    res.json(populated.toObject());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Vaciar carrito
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(cid)) return res.status(400).json({ error: "ID inválido" });

    const cart = await Cart.findByIdAndUpdate(cid, { products: [] }, { new: true }).populate("products.product");
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    res.json(cart.toObject());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;