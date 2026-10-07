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

// Get orders belonging to a specific user (Order -> User)
export const getOrdersByUserId = async (userId) => {
  return await Order.find({ user: userId })
    .populate("orderItems.product", "name price")
    .sort({ createdAt: -1 });
};

// Get all orders across platform (Admin)
export const getAllOrders = async () => {
  return await Order.find()
    .populate("user", "name email")
    .populate("orderItems.product", "name price")
    .sort({ createdAt: -1 });
};
