import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://mlvarengo_db_user:1234567laura@e-commerce.eku6rcl.mongodb.net/ecommerceDB?retryWrites=true&w=majority");
    console.log("Conectado a MongoDB Atlas");
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;