const express = require('express');
const router = express.Router();
const CartManager = require('../managers/CartManager');
const cartManager = new CartManager();

router.post('/', async (req, res) => {
  const newCart = await cartManager.createCart();
  res.status(201).json(newCart);
});

router.get('/:cid', async (req, res) => {
  const cid = parseInt(req.params.cid);
  const cart = await cartManager.getCartById(cid);
  if (cart) {
    res.json(cart);
  } else {
    res.status(404).json({ error: 'Carrito no encontrado' });
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  const cid = parseInt(req.params.cid);
  const pid = parseInt(req.params.pid);

  const updatedCart = await cartManager.addProductToCart(cid, pid);
  if (updatedCart) {
    res.json(updatedCart);
  } else {
    res.status(404).json({ error: 'Carrito no encontrado' });
  }
});

module.exports = router;