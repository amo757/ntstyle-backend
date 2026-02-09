import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import nodemailer from 'nodemailer'; // <--- ✅ დაემატა იმპორტი

// ---------------------------------------------------------
// 1. როუტერების იმპორტი
// ---------------------------------------------------------
import productRoutes from './routes/productRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// გარემოს ცვლადების ჩატვირთვა
dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 5000;

// ---------------------------------------------------------
// 2. CORS კონფიგურაცია
// ---------------------------------------------------------
const allowedOrigins = [
  'https://ntstyle.ge',       // შენი მთავარი დომენი
  'https://www.ntstyle.ge',   // www ვერსია
  'http://localhost:5173',    // შენი ლოკალური React
  'http://localhost:5174',    // რეზერვი
  'https://ntstyle-api.onrender.com' // საკუთარი თავი (ტესტირებისთვის)
];

const corsOptions = {
  origin: (origin, callback) => {
    // !origin ნიშნავს, რომ სერვერიდან სერვერზე იგზავნება მოთხოვნა (მაგ. Postman ან ბრაუზერის პირდაპირი ლინკი)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ---------------------------------------------------------
// 3. მონაცემთა ბაზა
// ---------------------------------------------------------
const connectDB = async () => {
  try {
    const connString = process.env.MONGO_URL || process.env.MONGODB_URI;

    if (!connString) {
      throw new Error("MongoDB connection string is missing in .env file");
    }

    await mongoose.connect(connString);
    console.log('MongoDB Connected Successfully! 🚀');
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

// ---------------------------------------------------------
// 4. სატესტო მეილის როუტერი (დროებითი)
// ---------------------------------------------------------
app.get('/test-email', async (req, res) => {
  const { EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT } = process.env;

  // HTML პასუხის მომზადება
  res.setHeader('Content-Type', 'text/html');
  res.write(`<h1>📧 Email Debugger</h1>`);
  res.write(`<p><strong>User:</strong> ${EMAIL_USER}</p>`);
  res.write(`<p><strong>Port from Env:</strong> ${EMAIL_PORT}</p>`);

  try {
    // ვქმნით ტრანსპორტერს (მკაცრად 465 პორტზე და Secure: true)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // 465-ისთვის აუცილებელია true
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000 // 10 წამიანი ტაიმერი
    });

    res.write(`<p>🔌 Connecting to Gmail (Port 465)...</p>`);
    
    // კავშირის შემოწმება
    await transporter.verify();
    res.write(`<p style="color:green; font-weight:bold;">✅ Connection Verified!</p>`);

    // მეილის გაგზავნა
    res.write(`<p>📨 Sending test email...</p>`);
    const info = await transporter.sendMail({
      from: `"Test Debugger" <${EMAIL_USER}>`,
      to: EMAIL_USER, // საკუთარ თავს უგზავნის
      subject: "Test Email from Render Server",
      html: "<h3>It Works! 🎉</h3><p>If you received this, the email system is working correctly.</p>"
    });

    res.write(`<h2 style="color:green">🎉 SUCCESS! Email Sent.</h2>`);
    res.write(`<pre>Message ID: ${info.messageId}</pre>`);
    res.end();

  } catch (error) {
    res.write(`<h2 style="color:red">❌ FAILED</h2>`);
    res.write(`<p><strong>Error Message:</strong> ${error.message}</p>`);
    res.write(`<p><strong>Error Code:</strong> ${error.code}</p>`);
    res.write(`<pre style="background:#eee; padding:10px;">${JSON.stringify(error, null, 2)}</pre>`);
    res.end();
  }
});

// ---------------------------------------------------------
// 5. სტანდარტული როუტერები
// ---------------------------------------------------------
app.use('/api/products', productRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/orders', orderRoutes);

// ჯანმრთელობის შემოწმება
app.get('/', (req, res) => {
  res.send('API is running... 🟢');
});

// ---------------------------------------------------------
// 6. Socket.io
// ---------------------------------------------------------
const io = new Server(httpServer, {
  cors: corsOptions
});

io.on('connection', (socket) => {
  console.log('New client connected via Socket.io:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// ---------------------------------------------------------
// 7. სერვერის გაშვება
// ---------------------------------------------------------
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});