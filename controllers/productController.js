import * as productService from "../services/productService.js";

// Get all products
export const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// Get single product by ID
export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Get products created by the currently logged-in user
export const getMyProducts = async (req, res, next) => {
  try {
    const products = await productService.getProductsByUserId(req.user._id);
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// Get products created by a specific user ID
export const getUserProducts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const products = await productService.getProductsByUserId(userId);
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// Create new product
export const createProduct = async (req, res, next) => {
  try {
    const { name, price, description, category, inStock } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide both name and price for the product",
      });
    }

    const product = await productService.createNewProduct({
      name,
      price,
      description,
      category,
      inStock,
      user: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Update product by ID
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingProduct = await productService.getProductById(id);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id: ${id}`,
      });
    }

    // Ownership check: Only owner of the product or admin can update it
    if (
      req.user &&
      req.user.role !== "admin" &&
      existingProduct.user &&
      existingProduct.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this product",
      });
    }

    const updatedProduct = await productService.updateProductById(id, req.body);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Delete product by ID
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingProduct = await productService.getProductById(id);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id: ${id}`,
      });
    }

    // Ownership check: Only owner of the product or admin can delete it
    if (
      req.user &&
      req.user.role !== "admin" &&
      existingProduct.user &&
      existingProduct.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this product",
      });
    }

    const deletedProduct = await productService.deleteProductById(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (error) {
    next(error);
  }
};
