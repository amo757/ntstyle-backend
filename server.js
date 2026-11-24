import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import nodemailer from 'nodemailer'; 

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
  'http://127.0.0.1:5173',    // 👈 დაამატე ეს ხაზი!
  'http://localhost:5174',    // რეზერვი
  'http://127.0.0.1:5174',    // 👈 რეზერვი IP-ით
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
// 4. სატესტო მეილის როუტერი (Gmail + App Password)
// ---------------------------------------------------------
app.get('/test-email', async (req, res) => {
  // ვიღებთ .env-დან შენს ახალ მეილს და კოდს
  const { EMAIL_USER, EMAIL_PASS } = process.env;

  res.setHeader('Content-Type', 'text/html');
  res.write(`<h1>📧 Gmail App Password Tester</h1>`);
  
  if (!EMAIL_USER || !EMAIL_PASS) {
      res.write(`<h2 style="color:red">❌ Error: .env variables missing!</h2>`);
      res.write(`<p>Make sure EMAIL_USER and EMAIL_PASS are set in your .env file.</p>`);
      return res.end();
  }

  res.write(`<p>User: ${EMAIL_USER} (Trying to connect...)</p>`);
  
  try {
    // ⚠️ აქ უკვე ვიყენებთ Gmail-ის სერვისს
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER, // აქ ჩაჯდება amiamo757@gmail.com
        pass: EMAIL_PASS, // აქ ჩაჯდება 16-ნიშნა კოდი
      },
    });

    res.write(`<p>🔌 Verifying Gmail Connection...</p>`);
    await transporter.verify();
    res.write(`<p style="color:green; font-weight:bold;">✅ Connection Verified!</p>`);

    res.write(`<p>📨 Sending test email to yourself...</p>`);
    
    // გაგზავნა საკუთარ თავთან
    await transporter.sendMail({
      from: `"N.T.Style Admin" <${EMAIL_USER}>`, 
      to: EMAIL_USER, // საკუთარ თავს ვუგზავნით ტესტს
      subject: "Test Email from Server (Gmail App Password)",
      html: "<h3>It Works! 🎉</h3><p>Your Gmail App Password setup is correct.</p>"
    });

    res.write(`<h2 style="color:green">🎉 SUCCESS! Email Sent. Check your Inbox.</h2>`);
    res.end();

  } catch (error) {
    res.write(`<h2 style="color:red">❌ FAILED</h2>`);
    res.write(`<p><strong>Error Message:</strong> ${error.message}</p>`);
    res.write(`<pre>${JSON.stringify(error, null, 2)}</pre>`);
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
app.get('/ping', (req, res) => {
    res.status(200).send('Server is awake and running!');
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