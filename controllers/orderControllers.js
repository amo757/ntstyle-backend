import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import { Resend } from 'resend'; 
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

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

  console.log("📥 შემოსული shippingAddress:", JSON.stringify(shippingAddress));

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const customerPhone =
      shippingAddress?.phoneNumber ||
      shippingAddress?.phone ||
      shippingAddress?.mobile ||
      req.user?.phoneNumber ||
      req.user?.phone ||
      'არ არის';

    const customerName =
      shippingAddress?.fullName ||
      (shippingAddress?.firstName && shippingAddress?.lastName
        ? `${shippingAddress.firstName} ${shippingAddress.lastName}`
        : req.user.name);

    const order = new Order({
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x.product,
        _id: undefined,
      })),
      user: req.user._id,
      shippingAddress: {
        ...shippingAddress,
        fullName: customerName,
        phoneNumber: customerPhone !== 'არ არის' ? customerPhone : '',
        phone: customerPhone !== 'არ არის' ? customerPhone : '',
      },
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // 1. პროდუქტების სიის გენერაცია
    const itemsListHtml = orderItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br/>
          ${item.size ? `<span style="color: #555; font-size: 12px;">ზომა: ${item.size}</span>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.qty || item.quantity || 1} x ${item.price} GEL
        </td>
      </tr>
    `).join('');

    try {
      console.log("🚀 Attempting to send separate emails to Admin and User...");

      // 📧 ა) წერილი მომხმარებლისთვის
      await resend.emails.send({
        from: 'N.T.Style <info@ntstyle.ge>',
        to: [req.user.email],
        subject: 'მადლობა შეკვეთისთვის! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">N.T.Style</h2>
            </div>
            <div style="padding: 20px; color: #333;">
              <h3 style="text-align: center;">თქვენი შეკვეთა მიღებულია!</h3>
              <p>მოგესალმებით ${customerName}, თქვენი შეკვეთა <strong>#${createdOrder._id.toString().slice(-6).toUpperCase()}</strong> წარმატებით გაფორმდა.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #f8f8f8;">
                  <th style="padding: 10px; text-align: left;">პროდუქტი</th>
                  <th style="padding: 10px; text-align: center;">რაოდენობა</th>
                </tr>
                ${itemsListHtml}
              </table>
              <div style="text-align: right; font-size: 18px; font-weight: bold; border-top: 2px solid #eee; padding-top: 10px;">
                ჯამური თანხა: ${totalPrice} GEL
              </div>
              <p style="font-size: 12px; color: #888; text-align: center; margin-top: 20px;">
                ჩვენ მალე დაგიკავშირდებით დეტალების დასაზუსტებად.
              </p>
            </div>
          </div>
        `
      });

      // 📧 ბ) წერილი ადმინისთვის
      await resend.emails.send({
        from: 'System <info@ntstyle.ge>',
        to: ['amiamo757@gmail.com'], 
        subject: `🚨 ახალი შეკვეთა! #${createdOrder._id} - ${customerName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #f4f4f4;">
            <div style="background: #fff; padding: 20px; border-radius: 5px;">
              <h2>ახალი შეკვეთის რეპორტი</h2>
              <hr/>
              <h4>👤 მყიდველი:</h4>
              <p><strong>სახელი:</strong> ${customerName}</p>
              <p><strong>ელ-ფოსტა:</strong> ${req.user.email}</p>
              <p><strong>ტელეფონი:</strong> ${customerPhone}</p>
              <p><strong>მისამართი:</strong> ${shippingAddress.address}, ${shippingAddress.city}</p>
              
              <h4>📦 პროდუქტები:</h4>
              <table border="1" cellpadding="10" style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #eee;">
                    <th>პროდუქტი</th>
                    <th>ID</th>
                    <th>ზომა / რაოდ.</th>
                    <th>ფასი</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItems.map(item => `
                    <tr>
                      <td>${item.name}</td>
                      <td><small>${item.product}</small></td>
                      <td>${item.size || 'N/A'} / ${item.qty || item.quantity || 1}</td>
                      <td>${item.price} GEL</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <h3>ჯამური თანხა: ${totalPrice} GEL</h3>
              <p><strong>გადახდის მეთოდი:</strong> ${paymentMethod}</p>
              <br/>
            </div>
          </div>
        `
      });

      console.log("✅ Confirmation and Admin emails sent! Phone:", customerPhone);
    } catch (error) {
      console.error("❌ Email Error:", error.message);
    }

    res.status(201).json(createdOrder);
  }
});

export { addOrderItems };