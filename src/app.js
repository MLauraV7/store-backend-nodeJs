import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import exphbs from "express-handlebars";

import connectDB from "./config/db.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";

import Product from "./models/product.model.js";
import Cart from "./models/cart.model.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Handlebars
app.engine(
  "handlebars",
  exphbs.engine({
    helpers: {
      eq: (a, b) => a === b,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Rutas API
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Vista de productos paginados
app.get("/products", async (req, res) => {
  try {
    let { limit = 8, page = 1, sort, query } = req.query;
    limit = parseInt(limit) || 8;
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
      firstBlock: result.docs.slice(0, 8).map(d => d.toObject()),
      secondBlock: result.docs.slice(8, 16).map(d => d.toObject()),
      page: result.page,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      limit,
      sort,
      query,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar productos");
  }
});

// Detalle de producto
app.get("/products/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) return res.status(404).send("Producto no encontrado");
    res.render("productDetail", { product: product.toObject() });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener producto");
  }
});

app.get("/carts", (_req, res) => res.render("cart"));

// Vista de un carrito específico (por id)
app.get("/carts/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate("products.product");
    if (!cart) return res.status(404).send("Carrito no encontrado");
    res.render("cart", { cart: cart.toObject() });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener carrito");
  }
});

// raíz /products
app.get("/", (_req, res) => res.redirect("/products"));

// SOCKET.IO
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  const sendProducts = async () => {
    const products = await Product.find().lean();
    io.emit("products", products);
  };

  sendProducts();

  socket.on("newProduct", async (data) => {
    try {
      await Product.create(data);
      sendProducts();
    } catch (e) {
      console.error("Error al agregar producto:", e.message);
    }
  });

  socket.on("deleteProduct", async (pid) => {
    try {
      await Product.findByIdAndDelete(pid);
      sendProducts();
    } catch (e) {
      console.error("Error al eliminar producto:", e.message);
    }
  });
});

// Conección DB y levantar servidor
connectDB();
const PORT = 8080;
httpServer.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));