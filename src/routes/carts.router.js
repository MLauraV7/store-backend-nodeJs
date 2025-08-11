const express = require('express');
const router = express.Router();
const CartManager = require('../managers/CartManager');
const cartManager = new CartManager();

router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    console.log("Error al crear el carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get('/:cid', async (req, res) => {
  try{
    const cid = parseInt(req.params.cid);
    const cart = await cartManager.getCartById(cid);
  
    if (cart) {
      res.json(cart);
    } else {
      res.status(404).json({ error: "Carrito no encontrado" });
    } 
  } catch (error) {
    console.error("Error al obtener carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  try{
    const cid = parseInt(req.params.cid);
    const pid = parseInt(req.params.pid);

    const updatedCart = await cartManager.addProductToCart(cid, pid);
    if (updatedCart) {
      res.json(updatedCart);
    } else {
      res.status(404).json({ error: "Carrito no encontrado" });
    }
  } catch (error) {
    console.error("Error al agregar producto al carrito:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;