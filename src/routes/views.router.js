import express from "express";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";

const router = express.Router();

// Página de listado con paginación
router.get("/products", async (req, res) => {
  try {
    let { limit = 10, page = 1, sort, query } = req.query;
    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;

    const filter = {};
    if (query) {
      const q = String(query).toLowerCase();
      if (q === "available") filter.status = true;
      else if (q === "unavailable") filter.status = false;
      else filter.category = query;
    }

    const sortOption = {};
    if (sort === "asc") sortOption.price = 1;
    if (sort === "desc") sortOption.price = -1;

    const result = await Product.paginate(filter, { limit, page, sort: sortOption });

    res.render("products", {
      products: result.docs.map(d => d.toObject()),
      page: result.page,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      limit, sort, query
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar productos");
  }
});

// Detalle de producto con botón "Agregar al carrito"
router.get("/products/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) return res.status(404).send("Producto no encontrado");
    res.render("productDetail", { product: product.toObject() });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener producto");
  }
});

// Página general del carrito
router.get("/carts", (_req, res) => res.render("cart"));

// Vista de un carrito específico (por id)
router.get("/carts/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate("products.product");
    if (!cart) return res.status(404).send("Carrito no encontrado");
    res.render("cart", { cart: cart.toObject() });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener carrito");
  }
});

export default router;