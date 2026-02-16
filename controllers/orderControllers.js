import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 📧 ტრანსპორტერის კონფიგურაცია (დაცული რეჟიმი)
// ვუთითებთ დროის ლიმიტებს, რომ სერვერი არ გაიჭედოს
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // ვცადოთ პორტი 587 (TLS), ეს უფრო სტანდარტულია
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  // 🛑 ეს პარამეტრები გადამწყვეტია Render-ისთვის:
  connectionTimeout: 10000, // 10 წამში თუ არ დაუკავშირდა, გათიშოს
  greetingTimeout: 10000,
  socketTimeout: 10000 
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // 1. შეკვეთის შექმნა ბაზაში
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
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // 📧 2. მეილების გაგზავნა (Safe Mode)
    // Try/Catch ბლოკშია, რომ მეილის შეცდომამ შეკვეთა არ გააფუჭოს
    try {
      console.log("📨 Attempting to send emails...");

      // A) მეილი მომხმარებელს
      await transporter.sendMail({
        from: '"N.T.Style Orders" <amiamo757@gmail.com>',
        to: req.user.email,
        subject: `თქვენი შეკვეთა მიღებულია! #${createdOrder._id}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #333;">მადლობა შეკვეთისთვის! 🎉</h2>
            <p>თქვენი შეკვეთა <strong>#${createdOrder._id}</strong> წარმატებით გაფორმდა.</p>
            <p><strong>გადასახდელი თანხა:</strong> ${createdOrder.totalPrice} GEL</p>
            <hr />
            <p>ჩვენ მალე დაგიკავშირდებით დეტალების დასაზუსტებლად.</p>
            <p style="font-size: 12px; color: #777;">პატივისცემით, N.T.Style გუნდი</p>
          </div>
        `,
      });

      // B) მეილი ადმინს (შენ)
      await transporter.sendMail({
        from: '"System Bot" <amiamo757@gmail.com>',
        to: "amiamo757@gmail.com",
        subject: `🔔 ახალი შეკვეთა: ${req.user.name} - ${createdOrder.totalPrice} GEL`,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2 style="color: green;">💰 ახალი შეკვეთა შემოვიდა!</h2>
            <p><strong>მომხმარებელი:</strong> ${req.user.name} (${req.user.email})</p>
            <p><strong>თანხა:</strong> ${createdOrder.totalPrice} GEL</p>
            <p><strong>მისამართი:</strong> ${shippingAddress.address}, ${shippingAddress.city}</p>
            <p><strong>ტელეფონი:</strong> ${shippingAddress.postalCode || 'N/A'}</p> 
            <br/>
            <a href="https://ntstyle.ge/order/${createdOrder._id}">შეკვეთის ნახვა</a>
          </div>
        `,
      });
      
      console.log("✅ Emails sent successfully!");

    } catch (error) {
      // 🛑 აქ ვიჭერთ ერორს, რომ საიტი არ გაითიშოს
      console.error("⚠️ EMAIL ERROR (Order saved successfully though):");
      console.error(error.message); 
    }

    // პასუხი ბრუნდება ნებისმიერ შემთხვევაში (გაიგზავნა მეილი თუ არა)
    res.status(201).json(createdOrder);
  }
});

export { addOrderItems };