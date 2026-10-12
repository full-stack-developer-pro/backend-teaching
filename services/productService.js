import Product from "../models/productModel.js";

// Fetch all products with search, filter, sort, and pagination
export const getAllProducts = async (queryParams = {}) => {
  const { search, category, sort, fields, page = 1, limit = 2, startDate, endDate } = queryParams;

  // 1. Build Filter object
  const filter = {};

  // Search by keyword (name)
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  // Filter by category
  if (category) {
    filter.category = category;
  }

  // Date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // 2. Pagination calculation
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 2;
  const skip = (pageNum - 1) * limitNum;

  // 3. Sorting (default: newest first)
  const sortBy = sort || "-createdAt";

  // 4. Field selection
  const selectFields = fields ? fields.split(",").join(" ") : "";

  // 5. Execute MongoDB query
  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter).skip(skip).limit(limitNum)
    .populate("category", "name description")
    .populate("user", "name email")
    .sort(sortBy)
    .select(selectFields);

  return {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    products,
  };
};

// Fetch single product by ID
export const getProductById = async (id) => {
  return await Product.findById(id)
    .populate("category", "name description")
    .populate("user", "name email");
};

// Fetch products created by a specific user
export const getProductsByUserId = async (userId, queryParams = {}) => {
  const pageNum = Number(queryParams.page) || 1;
  const limitNum = Number(queryParams.limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const total = await Product.countDocuments({ user: userId });
  const products = await Product.find({ user: userId })
    .populate("category", "name description")
    .sort("-createdAt")
    .skip(skip)
    .limit(limitNum);

  return {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    products,
  };
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
