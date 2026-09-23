import crypto from "crypto";

import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import razorpay from "../config/razorpay.js";

export const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Order items are required",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        message: "Shipping address is required",
      });
    }

    const allowedPaymentMethods = [
      "cod",
      "upi",
      "online",
    ];

    if (
      !paymentMethod ||
      !allowedPaymentMethods.includes(
        paymentMethod
      )
    ) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    let subtotal = 0;
    const orderItems = [];

    // Check products and stock
    for (const item of items) {
      const product = await Product.findById(
        item.product
      );

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.product}`,
        });
      }

      if (
        !item.quantity ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: "Invalid product quantity",
        });
      }

      if (
        product.stock < item.quantity
      ) {
        return res.status(400).json({
          message: `${product.name} is out of stock or has insufficient stock`,
        });
      }

      subtotal +=
        product.price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      });
    }

    const deliveryCharge =
      subtotal >= 1000 ? 0 : 99;

    const totalAmount =
      subtotal + deliveryCharge;

    // --------------------------------
    // COD PAYMENT
    // --------------------------------

    if (paymentMethod === "cod") {
      for (const item of items) {
        const product = await Product.findById(
          item.product
        );

        product.stock -= item.quantity;

        await product.save();
      }

      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod: "cod",
        subtotal,
        deliveryCharge,
        totalAmount,
        status: "pending",
      });

      return res.status(201).json({
        message: "Order placed successfully",
        order,
      });
    }

    // --------------------------------
    // UPI QR PAYMENT
    // --------------------------------

    if (paymentMethod === "upi") {
      for (const item of items) {
        const product = await Product.findById(
          item.product
        );

        product.stock -= item.quantity;

        await product.save();
      }

      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod: "upi",
        subtotal,
        deliveryCharge,
        totalAmount,
        status: "pending",
      });

      return res.status(201).json({
        message:
          "UPI order placed. Payment verification pending.",
        order,
      });
    }

    // --------------------------------
    // RAZORPAY ONLINE PAYMENT
    // --------------------------------

    if (paymentMethod === "online") {
      const razorpayOrder =
        await razorpay.orders.create({
          amount: Math.round(
            totalAmount * 100
          ),
          currency: "INR",
          receipt: `order_${Date.now()}`,
        });

      return res.status(201).json({
        message:
          "Payment order created",

        razorpayOrder,

        orderData: {
          items: orderItems,
          shippingAddress,
          subtotal,
          deliveryCharge,
          totalAmount,
        },
      });
    }
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// --------------------------------
// VERIFY RAZORPAY PAYMENT
// --------------------------------

export const verifyPayment = async (
  req,
  res
) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shippingAddress,
      subtotal,
      deliveryCharge,
      totalAmount,
    } = req.body;

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    if (
      generatedSignature !==
      razorpay_signature
    ) {
      return res.status(400).json({
        message:
          "Invalid payment signature",
      });
    }

    for (const item of items) {
      const product = await Product.findById(
        item.product
      );

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      if (
        product.stock < item.quantity
      ) {
        return res.status(400).json({
          message: `${product.name} has insufficient stock`,
        });
      }
    }

    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(
        item.product
      );

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      });

      product.stock -= item.quantity;

      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: "online",
      subtotal,
      deliveryCharge,
      totalAmount,
      status: "confirmed",
    });

    res.status(201).json({
      message:
        "Payment verified and order placed",
      order,
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// --------------------------------
// MY ORDERS
// --------------------------------

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// --------------------------------
// ALL ORDERS - ADMIN
// --------------------------------

export const getAllOrders = async (
  req,
  res
) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// --------------------------------
// UPDATE ORDER STATUS - ADMIN
// --------------------------------

export const updateOrderStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.status = status;

    await order.save();

    res.json({
      message:
        "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};