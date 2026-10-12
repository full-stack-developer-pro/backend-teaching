import Order from "../models/orderModel.js";

// Create a new order
export const createNewOrder = async (orderData) => {
  return await Order.create(orderData);
};

// Get order by ID with populated user and product details
export const getOrderById = async (id) => {
  return await Order.findById(id)
    .populate("user", "name email")
    .populate("orderItems.product", "name price category");
};

// Get orders belonging to a specific user with date ranges and pagination
export const getOrdersByUserId = async (userId, queryParams = {}) => {
  const { status, startDate, endDate, page = 1, limit = 10 } = queryParams;

  const filter = { user: userId };
  if (status) {
    filter.status = status;
  }
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate("orderItems.product", "name price")
    .sort("-createdAt")
    .skip(skip)
    .limit(limitNum);

  return {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    orders,
  };
};

// Get all orders across platform (Admin view with status, date filters & pagination)
export const getAllOrders = async (queryParams = {}) => {
  const { status, startDate, endDate, page = 1, limit = 10 } = queryParams;

  const filter = {};
  if (status) {
    filter.status = status;
  }
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate("user", "name email")
    .populate("orderItems.product", "name price")
    .sort("-createdAt")
    .skip(skip)
    .limit(limitNum);

  return {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    orders,
  };
};
