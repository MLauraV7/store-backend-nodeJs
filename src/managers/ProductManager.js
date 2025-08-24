const fs = require('fs').promises;
const path = require('path');

class ProductManager {
  constructor() {
    const dataPath = path.join(__dirname, '../data/products.json');
    this.path = dataPath;
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
    try {
      const products = await this.getProducts();
      return products.find(p => p.id === id);
    } catch (error) {
      console.error("Error al obtener el producto por id:", error)
      return null;
    }
  }

  async addProduct(product) {
    try{
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
    } catch (error) {
      console.error("Error al agregar el producto:", error);
      return null;
    }
  }
    

  async updateProduct(id, updatedFields) {
    try{
      const products = await this.getProducts();
      const index = products.findIndex(p => p.id === id);

      if (index === -1) return null;

      const product = products[index];
      products[index] = { ...product, ...updatedFields, id: product.id };

      await fs.writeFile(this.path, JSON.stringify(products, null, 2));
      return products[index];
    } catch (error){
      console.error("Error al actualizar el producto:", error);
      return null;
    }
    
  }

  async deleteProduct(id) {
    try{
      let products = await this.getProducts();
      const initialLength = products.length;
      products = products.filter(p => p.id !== id);

      if (products.length === initialLength) return false;

      await fs.writeFile(this.path, JSON.stringify(products, null, 2));
      return true;
    } catch (error){
      console.error("Error al eliminar el producto:", error);
      return false;
    }
  }
}

module.exports = ProductManager;