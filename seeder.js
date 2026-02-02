import mongoose from 'mongoose';
import dotenv from 'dotenv';
import products from './data/products.js';
import Product from './models/ProductModel.js';

// 1. ვტვირთავთ გარემოს ცვლადებს
dotenv.config();

// სადებაგო კოდი - ვნახოთ რას ხედავს
console.log("Checking .env file...");
console.log("MONGO_URI is:", process.env.MONGO_URI ? "FOUND" : "NOT FOUND (UNDEFINED)");

// 2. ბაზასთან დაკავშირება
const connectToDb = async () => {
    try {
        const uri = process.env.MONGO_URI;
        
        // შემოწმება: თუ ლინკი არ არის, გავაჩეროთ პროგრამა და დავწეროთ შეცდომა
        if (!uri) {
            throw new Error("MONGO_URI is missing in .env file! Please check your .env file.");
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Error: ${error.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await connectToDb();

        // ძველის წაშლა და ახლის ჩაწერა
        await Product.deleteMany();
        await Product.insertMany(products);

        console.log('✅ Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Import Error: ${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await connectToDb();
        await Product.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}