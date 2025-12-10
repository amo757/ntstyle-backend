import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io'; // დავტოვოთ, იქნებ მომავალში დაგჭირდეს (მაგ. შეკვეთის ნოტიფიკაციისთვის)
import cors from 'cors';

// როუტერების იმპორტი
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// გარემოს ცვლადების ჩატვირთვა
dotenv.config({ path: './.env' });

const app = express();
const httpServer = createServer(app);

const port = process.env.PORT || 5000;

// ---------------------------------------------------------
// 1. CORS კონფიგურაცია
// ---------------------------------------------------------
const allowedOrigins = [
  'https://ntstyle.ge',      // პროდაქშენ დომენი
  'http://localhost:5173',   // ლოკალური ფრონტი
  'http://localhost:5174'    // რეზერვი
];

const corsOptions = {
  origin: allowedOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json()); 

// ---------------------------------------------------------
// 2. მონაცემთა ბაზა
// ---------------------------------------------------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB-სთან კავშირი წარმატებულია! ✅');
  } catch (error) {
    console.error('MongoDB Error:', error.message);
    process.exit(1); // გათიშვა შეცდომის დროს
  }
};
connectDB();

// ---------------------------------------------------------
// 3. როუტერები
// ---------------------------------------------------------
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);

// სატესტო როუტი, რომ გავიგოთ სერვერი მუშაობს თუ არა
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ---------------------------------------------------------
// 4. Socket.io (მომავალი ფუნქციებისთვის)
// ---------------------------------------------------------
const io = new Server(httpServer, {
  cors: corsOptions
});

io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);
  // აქ შეგიძლია დაამატო სხვა ლოგიკა მომავალში
});


// ---------------------------------------------------------
// 5. სერვერის გაშვება
// ---------------------------------------------------------
httpServer.listen(port, () => {
  console.log(`სერვერი გაშვებულია: http://localhost:${port}`);
});