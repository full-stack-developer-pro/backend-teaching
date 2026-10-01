import Product from "../models/productModel.js";

// Fetch all products
export const getAllProducts = async () => {
  return await Product.find().sort({ createdAt: -1 });
};

// Fetch a single product by ID
export const getProductById = async (id) => {
  return await Product.findById(id);
};

// Create a new product
export const createNewProduct = async (productData) => {
  const product = new Product(productData);
  return await product.save();
};

// Update a product by ID
export const updateProductById = async (id, updateData) => {
  return await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

// Delete a product by ID
export const deleteProductById = async (id) => {
  return await Product.findByIdAndDelete(id);
};
