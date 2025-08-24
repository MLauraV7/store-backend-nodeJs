const fs = require('fs').promises;
const path = require('path');

class CartManager {
  constructor() {
    const dataPath = path.join(__dirname, '../data/carts.json');
    this.path = dataPath;
  }

  async getCarts() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async createCart() {
    try{
      const carts = await this.getCarts();

      const newId = carts.length === 0 ? 1 : carts[carts.length - 1].id + 1;

      const newCart = {
        id: newId,
        products: []
      };

      carts.push(newCart);
      await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
      return newCart;
    } catch (error){
      console.error("Error al crear el carrito:", error);
      return null;
    }
  }

  async getCartById(id) {
    try{
      const carts = await this.getCarts();
      return carts.find(c => c.id === id);
    } catch (error) {
      console.error("Error al obtener el carrito id:", error);
      return null;
    }
  }

  async addProductToCart(cartId, productId) {
    try {
      const carts = await this.getCarts();
      const cartIndex = carts.findIndex(c => c.id === cartId);

      if (cartIndex === -1) {
        return null;
      }

      const cart = carts[cartIndex];

      const productInCart = cart.products.find(p => p.product === productId);

      if (productInCart) {
        productInCart.quantity += 1;
      } else {
        cart.products.push({ product: productId, quantity: 1 });
      }

      carts[cartIndex] = cart;
      await fs.writeFile(this.path, JSON.stringify(carts, null, 2));

      return cart;
    } catch (error){
      console.error("Error al agregar el producto al carrito:", error);
      return null;
    }
  }
}

module.exports = CartManager;