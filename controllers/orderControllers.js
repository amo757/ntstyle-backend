import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js'; // დარწმუნდი, რომ ფაილის სახელი სწორია
import nodemailer from 'nodemailer';

// 📧 მეილის გამგზავნი ფუნქცია (უნივერსალური)
const sendOrderEmail = async (order, recipientEmail, userInfo) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // შენი მეილი .env-დან
        pass: process.env.EMAIL_PASS, // შენი App Password .env-დან
      },
    });

    // მეილის დიზაინი HTML-ში
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail, // ვის ეგზავნება
      subject: `Order Confirmation: Order ${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
          <h2 style="color: #333;">მადლობა შეკვეთისთვის!</h2>
          <p>თქვენი შეკვეთა წარმატებით გაფორმდა.</p>
          
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
          <p style="font-size: 12px; color: #888;">NT Style Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${recipientEmail}`);
  } catch (error) {
    console.error(`❌ Email error for ${recipientEmail}:`, error);
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

    // 2. ინფორმაცია მყიდველის შესახებ (req.user-დან)
    const userInfo = {
      name: req.user.name,
      email: req.user.email
    };

    // 3. მეილის გაგზავნა ადმინისტრატორთან (შენთან)
    // ✅ აქ გასწორდა: ახლა იყენებს env ფაილში გაწერილ მეილს
    await sendOrderEmail(createdOrder, process.env.EMAIL_USER, userInfo);

    // 4. მეილის გაგზავნა მყიდველთან
    await sendOrderEmail(createdOrder, userInfo.email, userInfo);

    res.status(201).json(createdOrder);
  }
});

export { addOrderItems };