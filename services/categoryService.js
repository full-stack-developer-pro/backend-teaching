import Category from "../models/categoryModel.js";

// Fetch all categories
export const getAllCategories = async () => {
  return await Category.find().sort({ name: 1 });
};

// Fetch single category by ID
export const getCategoryById = async (id) => {
  return await Category.findById(id);
};

// Create a new category
export const createCategory = async (categoryData) => {
  return await Category.create(categoryData);
};

// Update a category by ID
export const updateCategoryById = async (id, updateData) => {
  return await Category.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

// Delete a category by ID
export const deleteCategoryById = async (id) => {
  return await Category.findByIdAndDelete(id);
};
