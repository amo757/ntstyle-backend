import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 📧 მეილის გაგზავნის ფუნქცია (მხოლოდ SSL - Port 465)
const sendOrderEmail = async (order, recipientEmail, userInfo) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',  // 👈 ხელით ვუთითებთ ჰოსტს
      port: 465,               // 👈 ვიყენებთ 465-ს (SSL)
      secure: true,            // 👈 465-ისთვის ეს აუცილებლად true უნდა იყოს
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      family: 4, // 👈 იძულებით IPv4 (გაჭედვის თავიდან ასაცილებლად)
    });

    const mailOptions = {
      from: `"N.T.Style" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Order Confirmation: #${order._id}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>თქვენი შეკვეთა მიღებულია!</h2>
          <p>Order ID: ${order._id}</p>
          <p>Total: ${order.totalPrice} GEL</p>
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

    // 📧 მეილების გაგზავნა (Await - ველოდებით, რომ არ გაითიშოს)
    console.log("⏳ Sending emails on Port 465...");
    
    await sendOrderEmail(createdOrder, process.env.EMAIL_USER, { name: 'Admin', email: process.env.EMAIL_USER });
    await sendOrderEmail(createdOrder, req.user.email, { name: req.user.name, email: req.user.email });

    console.log("✅ All done, sending response.");
    res.status(201).json(createdOrder);
  }
});

export { addOrderItems };