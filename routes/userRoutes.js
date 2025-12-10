// designer-shop-backend/routes/userRoutes.js

import express from 'express';
import User from '../models/UserModel.js';
const generateToken = (await import('../utils/generateToken.js')).default;

const router = express.Router();

// -------------------------------------------------------------------------
// არსებული მარშრუტები (LOGIN & REGISTER)
// -------------------------------------------------------------------------

// @route   POST /api/users/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'ელ. ფოსტა ან პაროლი არასწორია' });
    }
});

// @route   POST /api/users
router.post('/', async (req, res) => {
    const { name, email, password } = req.body;
    
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'მომხმარებელი ამ ელ. ფოსტით უკვე არსებობს' });
    }

    try {
        const user = await User.create({ name, email, password });

        if (user) {
            res.status(201).json({ 
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'არასწორი მომხმარებლის მონაცემები' });
        }
    } catch (error) {
        console.error("MongoDB Registration Error:", error); 
        let errorMessage = 'რეგისტრაციის სისტემური შეცდომა';
        if (error.name === 'ValidationError') {
            errorMessage = Object.values(error.errors).map(val => val.message).join('; ');
        }
        res.status(500).json({ message: errorMessage });
    }
});

// -------------------------------------------------------------------------
// ✅ ახალი მარშრუტები WISHLIST-ისთვის
// -------------------------------------------------------------------------

// @route   PUT /api/users/wishlist
// @desc    პროდუქტის დამატება ან წაშლა ვიშლისტიდან
router.put('/wishlist', async (req, res) => {
    const { userId, productId } = req.body;

    try {
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: "მომხმარებელი ვერ მოიძებნა" });
        }

        // ვამოწმებთ, არის თუ არა პროდუქტი უკვე დამატებული
        const index = user.wishlist.indexOf(productId);

        if (index === -1) {
            // თუ არ არის, ვამატებთ (Add)
            user.wishlist.push(productId);
        } else {
            // თუ არის, ვშლით (Remove)
            user.wishlist.splice(index, 1);
        }

        await user.save();

        // ვაბრუნებთ განახლებულ ვიშლისტს პროდუქტის დეტალებით (Populate)
        // მნიშვნელოვანია: 'wishlist' ველის populate, რათა ფრონტენდმა მიიღოს ფოტო და სახელი
        const updatedUser = await User.findById(userId).populate('wishlist');
        
        res.json(updatedUser.wishlist);

    } catch (error) {
        console.error("Wishlist Error:", error);
        res.status(500).json({ message: "სერვერის შეცდომა ვიშლისტის განახლებისას" });
    }
});

// @route   GET /api/users/:id/wishlist
// @desc    კონკრეტული მომხმარებლის ვიშლისტის წამოღება
router.get('/:id/wishlist', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('wishlist');
        
        if (user) {
            res.json(user.wishlist);
        } else {
            res.status(404).json({ message: "მომხმარებელი ვერ მოიძებნა" });
        }
    } catch (error) {
        console.error("Fetch Wishlist Error:", error);
        res.status(500).json({ message: "ვერ მოხერხდა ვიშლისტის წამოღება" });
    }
});

export default router;