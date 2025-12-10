import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io'; 
import cors from 'cors';

// როუტერების იმპორტი
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// გარემოს ცვლადების ჩატვირთვა
dotenv.config(); // ლოკალურად .env-დან წაიკითხავს, Render-ზე კი სისტემიდან

const app = express();
const httpServer = createServer(app);

// Render ავტომატურად მოგცემს პორტს, ან გამოიყენებს 5000-ს
const port = process.env.PORT || 5000;

// ---------------------------------------------------------
// 1. CORS კონფიგურაცია (ყველაზე მნიშვნელოვანი ნაწილი)
// ---------------------------------------------------------
const allowedOrigins = [
  'https://ntstyle.ge',       // შენი მთავარი დომენი
  'https://www.ntstyle.ge',   // www ვერსიაც (ყოველი შემთხვევისთვის)
  'http://localhost:5173',    // შენი ლოკალური კომპიუტერი
  'http://localhost:5174'     // რეზერვი
];

const corsOptions = {
  origin: (origin, callback) => {
    // თუ origin არ არის (მაგ: Postman-დან რეკავს) ან სიაშია, ვუშვებთ
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin); // კონსოლში გამოაჩენს ვინ დაიბლოკა
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Cookies/Tokens-ისთვის აუცილებელია
};

app.use(cors(corsOptions));
app.use(express.json()); // JSON მონაცემების მისაღებად

// ---------------------------------------------------------
// 2. მონაცემთა ბაზა
// ---------------------------------------------------------
const connectDB = async () => {
  try {
    // Render-ზე ეს ცვლადი Environment Variables-ში უნდა გქონდეს გაწერილი
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected Successfully! 🚀');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

// ---------------------------------------------------------
// 3. როუტერები
// ---------------------------------------------------------
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);

// ჯანმრთელობის შემოწმება (Health Check)
app.get('/', (req, res) => {
  res.send('API is running on Render... 🟢');
});

// ---------------------------------------------------------
// 4. Socket.io (მომავალი ფუნქციებისთვის)
// ---------------------------------------------------------
const io = new Server(httpServer, {
  cors: corsOptions // იგივე CORS წესები სოკეტისთვისაც
});

io.on('connection', (socket) => {
  console.log('New client connected via Socket.io:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// ---------------------------------------------------------
// 5. სერვერის გაშვება
// ---------------------------------------------------------
httpServer.listen(port, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
});