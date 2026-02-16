import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 📧 1. ტრანსპორტერის შექმნა (Gmail App Password)
// ეს გარეთ გამაქვს, რომ ყოველ ჯერზე თავიდან არ შეიქმნას
// ✅ ახალი ვერსია (პორტი 587)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // პირდაპირ ვუთითებთ Google-ის სერვერს
  port: 587,              // ეს პორტი მუშაობს Render-ზე
  secure: false,          // 587 პორტისთვის ეს უნდა იყოს false
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // ეს ეხმარება კავშირის დამყარებაში
  }
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

    // 📧 2. მეილების გაგზავნა (Background Process)
    // არ ველოდებით (await-ის გარეშე), რომ კლიენტს პასუხი სწრაფად დაუბრუნდეს
    try {
      console.log("📨 Sending emails...");

      // A) მეილი მომხმარებელს (Confirmation)
      transporter.sendMail({
        from: '"N.T.Style Orders" <amiamo757@gmail.com>', // 👈 ეს გამოჩნდება ლამაზად
        to: req.user.email, // კლიენტის მეილი
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

      // B) მეილი შენ (ადმინს) - დეტალური ინფო
      transporter.sendMail({
        from: '"System Bot" <amiamo757@gmail.com>',
        to: "amiamo757@gmail.com", // 👈 აქ მოდის შენთან
        subject: `🔔 ახალი შეკვეთა: ${req.user.name} - ${createdOrder.totalPrice} GEL`,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2 style="color: green;">💰 ახალი შეკვეთა შემოვიდა!</h2>
            <p><strong>მომხმარებელი:</strong> ${req.user.name} (${req.user.email})</p>
            <p><strong>თანხა:</strong> ${createdOrder.totalPrice} GEL</p>
            <p><strong>მისამართი:</strong> ${shippingAddress.address}, ${shippingAddress.city}</p>
            <p><strong>ტელეფონი:</strong> ${shippingAddress.postalCode || 'მითითებული არაა'}</p> 
            <br/>
            <a href="https://ntstyle.ge/order/${createdOrder._id}" style="background: #000; color: #fff; padding: 10px; text-decoration: none;">შეკვეთის ნახვა</a>
          </div>
        `,
      });

    } catch (error) {
      console.error("❌ Email sending failed:", error);
      // არ ვაჩერებთ პროცესს, რადგან შეკვეთა უკვე ბაზაშია
    }

    res.status(201).json(createdOrder);
  }
});

export { addOrderItems };