import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 📧 მეილის გამგზავნი ფუნქცია (უნივერსალური)
const sendOrderEmail = async (order, recipientEmail, userInfo) => {
  // შემოწმება: არსებობს თუ არა პაროლი და მეილი .env-ში
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials missing in .env");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com', // დავამატეთ ჰოსტი
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // ლოკალურზე პრობლემების თავიდან ასაცილებლად
      }
    });

    // მეილის დიზაინი HTML-ში
    const mailOptions = {
      from: `"N.T.Style" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Order Confirmation: #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
          <h2 style="color: #000; text-align: center;">მადლობა შეკვეთისთვის!</h2>
          <p style="text-align: center;">თქვენი შეკვეთა წარმატებით გაფორმდა.</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; margin: 20px 0;">
            <h3>🛒 შეკვეთის დეტალები:</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>ჯამური თანხა:</strong> ${order.totalPrice} GEL</p>
            <p><strong>გადახდის მეთოდი:</strong> ${order.paymentMethod}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3>👤 მყიდველის ინფორმაცია:</h3>
            <p><strong>სახელი:</strong> ${userInfo.name}</p>
            <p><strong>Email:</strong> ${userInfo.email}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3>🚚 მიწოდების მისამართი:</h3>
            <p>${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
            <p><strong>ტელეფონი:</strong> ${order.shippingAddress.phoneNumber}</p>
          </div>

          <hr>
          <p style="font-size: 12px; color: #888; text-align: center;">© 2024 N.T.Style Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to: ${recipientEmail}`);
  } catch (error) {
    console.error(`❌ Email error for ${recipientEmail}:`, error.message);
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
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
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // 🚀 ცვლილება: პასუხს ვაბრუნებთ მომენტალურად!
    // აქ კოდი აღარ ჩერდება და მომხმარებელი გადადის შემდეგ გვერდზე
    res.status(201).json(createdOrder);

    // 📧 მეილები იგზავნება ფონურად (Background)
    const userInfo = {
      name: req.user.name,
      email: req.user.email
    };

    console.log("📨 Starting background email process...");

    // ადმინისტრატორთან გაგზავნა (await-ის გარეშე)
    sendOrderEmail(createdOrder, process.env.EMAIL_USER, userInfo)
      .catch(err => console.log("Admin email failed:", err));

    // მყიდველთან გაგზავნა (await-ის გარეშე)
    sendOrderEmail(createdOrder, userInfo.email, userInfo)
      .catch(err => console.log("User email failed:", err));
  }
});

export { addOrderItems };