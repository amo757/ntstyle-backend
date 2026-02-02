// backend/routes/orderRoutes.js
import express from 'express';
const router = express.Router();
import { addOrderItems } from '../controllers/orderControllers.js';
import { protect } from '../middleware/authMiddleware.js'; 

// როცა ვინმე აგზავნის POST მოთხოვნას, ჯერ ამოწმებს ავტორიზაციას (protect), 
// შემდეგ უშვებს კონტროლერს (addOrderItems)
router.route('/').post(protect, addOrderItems);

export default router;