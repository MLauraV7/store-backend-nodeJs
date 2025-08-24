const socket = io();

socket.on('products', (products) => {
  const list = document.getElementById('product-list');
  list.innerHTML = '';
  products.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${p.title}</strong> - $ ${p.price}
    <br>${p.description}
    <br><em>Categoría:</em> ${p.category} | <em>Stock:</em> ${p.stock} | <em>ID:</em> ${p.id}`;
    list.appendChild(li);
  });    
});

const productForm = document.getElementById('product-form');
productForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(productForm);
  const product = {
    title: formData.get('title'),
    description: formData.get('description'),
    price: parseFloat(formData.get('price')),
    stock: parseInt(formData.get('stock')),
    category: formData.get('category'),
    code: `code-${Date.now()}`
  };

  socket.emit('newProduct', product);
  productForm.reset();
});

const deleteForm = document.getElementById('delete-form');
deleteForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(deleteForm);
  const id = formData.get('id');

  socket.emit('deleteProduct', id);
  deleteForm.reset();
});