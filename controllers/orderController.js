import * as orderService from "../services/orderService.js";

// Create new order (Logged in user)
export const createOrder = async (req, res, next) => {
  try {
    const { orderItems, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items provided",
      });
    }

    const order = await orderService.createNewOrder({
      user: req.user._id,
      orderItems,
      totalPrice,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Get single order by ID (Owner or Admin)
export const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found with id: ${id}`,
      });
    }

    // Ownership check: Only order owner or admin can view
    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this order",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Get logged-in user's orders (with date filters and pagination)
export const getMyOrders = async (req, res, next) => {
  try {
    const result = await orderService.getOrdersByUserId(req.user._id, req.query);
    res.status(200).json({
      success: true,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      data: result.orders,
    });
  } catch (error) {
    next(error);
  }
};

// Get orders by specific user ID (Owner or Admin)
export const getUserOrders = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (req.user.role !== "admin" && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this user's orders",
      });
    }

    const result = await orderService.getOrdersByUserId(userId, req.query);
    res.status(200).json({
      success: true,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      data: result.orders,
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders across platform (Admin only - with status, date filters, pagination)
export const getAllOrders = async (req, res, next) => {
  try {
    const result = await orderService.getAllOrders(req.query);
    res.status(200).json({
      success: true,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      data: result.orders,
    });
  } catch (error) {
    next(error);
  }
};
