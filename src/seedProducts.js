// src/seedProducts.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "./models/product.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const MONGO_URI = process.env.MONGO_URI;

const products = [
  { title: "Mouse Inalámbrico", description: "Mouse óptico inalámbrico", code: "ELEC001", price: 25, stock: 50, category: "electrónica", thumbnails: ["/images/mouse-inalambrico.jpg"]},
  { title: "Auriculares Bluetooth", description: "Auriculares inalámbricos con cancelación de ruido", code: "ACCE001", price: 60, stock: 40, category: "accesorios electrónicos", thumbnails: ["/images/auris.jpg"]},
  { title: "Escritorio Oficina", description: "Escritorio de madera 120x60cm", code: "MUEB001", price: 150, stock: 15, category: "muebles para oficina", thumbnails: ["/images/escritorio.jpg"]},
  { title: "Silla Ergonómica", description: "Silla de oficina con soporte lumbar", code: "MUEB002", price: 200, stock: 20, category: "muebles para oficina", thumbnails: ["/images/silla.jpg"]},
  { title: "Monitor 24 pulgadas", description: "Monitor LED Full HD", code: "ELEC003", price: 130, stock: 25, category: "electrónica", thumbnails: ["/images/tv24.jpg"]},
  { title: "Lámpara de escritorio", description: "Lámpara LED regulable", code: "MUEB003", price: 45, stock: 35, category: "muebles para oficina", thumbnails: ["/images/lampara_de_escritorio.jpg"]},
  { title: "Teclado Numérico", description: "Teclado USB para PC", code: "ACCE004", price: 15, stock: 80, category: "accesorios electrónicos", thumbnails: ["/images/teclado-num.jpg"]},
  { title: "Cámara Web HD", description: "Cámara web para videollamadas HD", code: "ELEC004", price: 35, stock: 25, category: "electrónica", thumbnails: ["/images/cam.jpg"]},
  { title: "Cargador Rápido 20W", description: "Cargador USB-C rápido", code: "ACCE006", price: 18, stock: 60, category: "accesorios electrónicos", thumbnails: ["/images/cargador.jpg"]},
  { title: "Smartwatch", description: "Reloj inteligente con pulsómetro", code: "ELEC007", price: 90, stock: 25, category: "electrónica", thumbnails: ["/images/reloj.png"]},
  { title: "Tablet 10\"", description: "Tablet Android 10 pulgadas", code: "ELEC008", price: 200, stock: 20, category: "electrónica", thumbnails: ["/images/tablet.jpg"]},
  { title: "Altavoz Bluetooth", description: "Altavoz portátil 10W", code: "ACCE008", price: 40, stock: 35, category: "accesorios electrónicos", thumbnails: ["/images/altavoz-blue.jpg"]},
  { title: "Teclado Inalámbrico", description: "Teclado Bluetooth compacto", code: "ACCE009", price: 50, stock: 30, category: "accesorios electrónicos", thumbnails: ["/images/teclado-inalambrico.jpg"]},
  { title: "Monitor Curvo 27\"", description: "Monitor curvo Full HD", code: "ELEC009", price: 180, stock: 15, category: "electrónica", thumbnails: ["/images/Monitor-Gamer-27-Curvo.jpeg"]},
  { title: "Silla Gaming", description: "Silla gamer con soporte lumbar", code: "MUEB007", price: 220, stock: 10, category: "muebles para oficina", thumbnails: ["/images/silla-gamer.jpg"]},
  { title: "Lámpara LED RGB", description: "Lámpara de escritorio con colores", code: "MUEB008", price: 60, stock: 20, category: "muebles para oficina", thumbnails: ["/images/lampara-led.jpg"]},
];


const seedDB = async () => {
  try {
    if (!MONGO_URI) throw new Error("MONGO_URI no definido en .env");
    await mongoose.connect(MONGO_URI);
    console.log("Conectado a MongoDB Atlas");

    await Product.deleteMany();
    console.log("Productos anteriores eliminados");

    await Product.insertMany(products);
    console.log("Productos insertados correctamente");

    await mongoose.connection.close();
    console.log("Conexión cerrada");
  } catch (error) {
    console.error(error);
  }
};

seedDB();