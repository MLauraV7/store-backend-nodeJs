const express = require('express');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const ProductManager = require('./managers/ProductManager');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

const productManager = new ProductManager();

app.get('/products', async (req, res)=> {
  const products = await productManager.getProducts();
  res.render('home', { products });
});

app.get('/realtimeproducts', async (req, res) => {
  const products = await productManager.getProducts();
  res.render('realtimeproducts', { products });
});

io.on('connection', async (socket) => {
  console.log('Cliente conectado');

  const products = await productManager.getProducts();
  socket.emit('products', products);

  socket.on('newProduct', async (product) => {
    await productManager.addProduct(product);
    const updatedProducts = await productManager.getProducts();
    io.emit('products', updatedProducts);
  });

  socket.on('deleteProduct', async (id) => {
    await productManager.deleteProduct(parseInt(id));
    const updatedProducts = await productManager.getProducts();
    io.emit('products', updatedProducts);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});