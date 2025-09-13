import express from "express";
import Product from "../models/product.model.js";

const router = express.Router();

router.get("/", async (req, res) => {
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

    // Sort por precio asc/desc
    const sortObj = {};
    if (sort === "asc") sortObj.price = 1;
    if (sort === "desc") sortObj.price = -1;

    const result = await Product.paginate(filter, { limit, page, sort: sortObj });

    res.json({
      status: "success",
      payload: result.docs.map((d) => d.toObject()),
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product.toObject());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description = "", code, price, status = true, stock, category, thumbnails = [] } = req.body;
    if (!title || !code || price == null || stock == null || !category) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    const created = await Product.create({ title, description, code, price, status, stock, category, thumbnails });
    res.status(201).json(created.toObject());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(updated.toObject());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.pid);
    if (!deleted) return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ message: "Producto eliminado" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;