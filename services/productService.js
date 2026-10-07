import Product from "../models/productModel.js";

// Fetch all products with populated category and user details
export const getAllProducts = async () => {
  return await Product.find()
    .populate("category", "name description")
    .populate("user", "name email")
    .sort({ createdAt: -1 });
};

// Fetch a single product by ID with populated category and user
export const getProductById = async (id) => {
  return await Product.findById(id)
    .populate("category", "name description")
    .populate("user", "name email");
};

// Create a new product
export const createNewProduct = async (productData) => {
  const product = await Product.create(productData);
  return await product.populate([
    { path: "category", select: "name description" },
    { path: "user", select: "name email" },
  ]);
};

// Update a product by ID
export const updateProductById = async (id, updateData) => {
  return await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("category", "name description")
    .populate("user", "name email");
};

// Delete a product by ID
export const deleteProductById = async (id) => {
  return await Product.findByIdAndDelete(id);
};
