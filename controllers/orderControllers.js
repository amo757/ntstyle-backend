import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 📧 მეილის გაგზავნის ფუნქცია
const sendOrderEmail = async (order, recipientEmail, userInfo) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"N.T.Style" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Order Confirmation: #${order._id}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>მადლობა შეკვეთისთვის!</h2>
          <p>Order ID: ${order._id}</p>
          <p>Total: ${order.totalPrice} GEL</p>
        </div>
      `,
    };

    // აქ ველოდებით გაგზავნას (await)
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${recipientEmail}`);
  } catch (error) {
    console.error(`❌ Email Failed:`, error);
    // აქ არ ვაგდებთ throw error-ს, რადგან მეილის გამო შეკვეთა არ უნდა გაუქმდეს
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

    // 1. ვინახავთ შეკვეთას
    const createdOrder = await order.save();

    // 2. 📧 მეილების გაგზავნა (AWAIT - ველოდებით!)
    // ეს არის ის, რაც შევცვალეთ. სერვერი არ უპასუხებს ფრონტს, სანამ მეილს არ გაუშვებს.
    console.log("⏳ Sending emails before response...");
    
    await sendOrderEmail(createdOrder, process.env.EMAIL_USER, { name: 'Admin', email: process.env.EMAIL_USER });
    await sendOrderEmail(createdOrder, req.user.email, { name: req.user.name, email: req.user.email });

    // 3. მხოლოდ ახლა ვაბრუნებთ პასუხს
    console.log("✅ All done, sending response to frontend.");
    res.status(201).json(createdOrder);
  }
});

export { addOrderItems };