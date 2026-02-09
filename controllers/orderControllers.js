import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 📧 მეილის გაგზავნის ფუნქცია (Brevo SMTP - Port 587)
const sendOrderEmail = async (order, recipientEmail, userInfo) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // Render-იდან: smtp-relay.brevo.com
      port: process.env.EMAIL_PORT, // Render-იდან: 587
      secure: false,                // 587-ისთვის false
      auth: {
        user: process.env.EMAIL_USER, // Brevo Login
        pass: process.env.EMAIL_PASS, // Brevo Key
      },
    });

    const mailOptions = {
      // მომხმარებელი დაინახავს "N.T.Style"-ს და შენს Gmail-ს
      from: `"N.T.Style" <natiatkhelidze.n.t.style@gmail.com>`, 
      to: recipientEmail,
      subject: `Order Confirmation: #${order._id}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>თქვენი შეკვეთა მიღებულია!</h2>
          <p>Order ID: ${order._id}</p>
          <p>Total: ${order.totalPrice} GEL</p>
          <p>Thank you for shopping with us!</p>
        </div>
      `,
    };

    // ველოდებით გაგზავნას
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${recipientEmail}`);
  } catch (error) {
    console.error(`❌ Email Failed:`, error);
  }
};

// @desc    Create new order
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const order = new Order({
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x.product,
        _id: undefined,
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // 📧 მეილების გაგზავნა Brevo-ს გავლით
    console.log("⏳ Sending emails via Brevo...");
    
    // ადმინს (შენ)
    await sendOrderEmail(createdOrder, "natiatkhelidze.n.t.style@gmail.com", { name: 'Admin' });
    
    // მომხმარებელს
    await sendOrderEmail(createdOrder, req.user.email, { name: req.user.name });

    console.log("✅ All done, sending response.");
    res.status(201).json(createdOrder);
  }
});

export { addOrderItems };