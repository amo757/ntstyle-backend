import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io'; 
import cors from 'cors';

// ---------------------------------------------------------
// 1. როუტერების იმპორტი
// ---------------------------------------------------------
import productRoutes from './routes/productRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js'; 
import userRoutes from './routes/userRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import orderRoutes from './routes/orderRoutes.js'; // <--- ✅ 1. დაემატა შეკვეთის როუტერი

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
  'http://localhost:5174'     // რეზერვი
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
// 4. როუტერების ჩართვა
// ---------------------------------------------------------
app.use('/api/products', productRoutes);
app.use('/api/payment', paymentRoutes); 
app.use('/api/users', userRoutes);      
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/orders', orderRoutes); // <--- ✅ 2. დაემატა ეს ხაზი! ახლა /api/orders იმუშავებს

// ჯანმრთელობის შემოწმება
app.get('/', (req, res) => {
  res.send('API is running... 🟢');
});

// ---------------------------------------------------------
// 5. Socket.io
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
// 6. სერვერის გაშვება
// ---------------------------------------------------------
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});