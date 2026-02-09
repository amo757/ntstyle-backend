import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import nodemailer from 'nodemailer'; // <--- ✅ იმპორტი დამატებულია

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
  'https://ntstyle-api.onrender.com' // API (საკუთარი თავი)
];

const corsOptions = {
  origin: (origin, callback) => {
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
// 4. სატესტო მეილის როუტერი (DEBUGGER)
// ---------------------------------------------------------
app.get('/test-email', async (req, res) => {
  const { EMAIL_USER, EMAIL_PASS } = process.env;

  res.setHeader('Content-Type', 'text/html');
  res.write(`<h1>📧 Email Debugger</h1>`);
  
  try {
    // ვქმნით ტრანსპორტერს (ვცადოთ 465 SSL-ით, რადგან ეს ყველაზე საიმედოა)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, 
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false }, // სერთიფიკატის პრობლემების იგნორირება
      connectionTimeout: 10000 // 10 წამი
    });

    res.write(`<p>🔌 Connecting to Gmail (Port 465)...</p>`);
    await transporter.verify();
    res.write(`<p style="color:green; font-weight:bold;">✅ Connection Verified!</p>`);

    res.write(`<p>📨 Sending test email to ${EMAIL_USER}...</p>`);
    await transporter.sendMail({
      from: `"Test Debugger" <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: "Test Email from Render Server",
      html: "<h3>It Works! 🎉</h3><p>Email system is operational.</p>"
    });

    res.write(`<h2 style="color:green">🎉 SUCCESS! Email Sent.</h2>`);
    res.end();

  } catch (error) {
    res.write(`<h2 style="color:red">❌ FAILED</h2>`);
    res.write(`<p><strong>Error Message:</strong> ${error.message}</p>`);
    res.write(`<p><strong>Code:</strong> ${error.code}</p>`);
    res.write(`<p><em>Note: If code is ETIMEDOUT, Gmail is blocking Render's IP.</em></p>`);
    res.end();
  }
});

// ---------------------------------------------------------
// 5. როუტერების ჩართვა
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
// 6. Socket.io და სერვერის გაშვება
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

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});