const express = require('express');
const ProductManager = require('../managers/ProductManager');

const router = express.Router();
const manager = new ProductManager();

router.get('/', async (req, res) => {
  try{
    const products = await manager.getProducts();
  res.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get('/:pid', async (req, res) => {
  try{
    const id = parseInt(req.params.pid);
    const product = await manager.getProductById(id);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post('/', async (req, res) => {
  try{
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const newProduct = await manager.addProduct({
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error al agregar producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
    
});

router.put('/:pid', async (req, res) => {
  try{
    const id = parseInt(req.params.pid);
    const updatedProduct = await manager.updateProduct(id, req.body);

    if (!updatedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    const id = parseInt(req.params.pid);
    const result = await manager.deleteProduct(id);
    if (!result) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;