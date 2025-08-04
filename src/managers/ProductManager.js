const fs = require('fs').promises;
const path = require('path');

class ProductManager {
  constructor() {
    this.path = path.resolve('./src/data/products.json');
  }

  async getProducts() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async getProductById(id) {
    const products = await this.getProducts();
    return products.find(p => p.id === id);
  }

  async addProduct(product) {
    const products = await this.getProducts();

    let newId;
    if (products.length === 0) {
      newId = 1;
    } else {
      newId = products[products.length - 1].id + 1;
    }

    const newProduct = { id: newId, ...product };
    products.push(newProduct);

    await fs.writeFile(this.path, JSON.stringify(products, null, 2));
    return newProduct;
  }

  async updateProduct(id, updatedFields) {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) return null;

    const product = products[index];
    products[index] = { ...product, ...updatedFields, id: product.id };

    await fs.writeFile(this.path, JSON.stringify(products, null, 2));
    return products[index];
  }

  async deleteProduct(id) {
    let products = await this.getProducts();
    const initialLength = products.length;
    products = products.filter(p => p.id !== id);

    if (products.length === initialLength) return false;

    await fs.writeFile(this.path, JSON.stringify(products, null, 2));
    return true;
  }
}

module.exports = ProductManager;