import express from 'express';
import User from '../models/UserModel.js';
import generateToken from '../utils/generateToken.js'; // სტანდარტული იმპორტი ჯობია

const router = express.Router();

// -------------------------------------------------------------------------
// 1. LOGIN & REGISTER
// -------------------------------------------------------------------------

// @route   POST /api/users/login
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

// @route   POST /api/users
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
        console.error("Registration Error:", error); 
        res.status(500).json({ message: 'რეგისტრაციის სისტემური შეცდომა' });
    }
});

// -------------------------------------------------------------------------
// 2. WISHLIST (შესწორებული და გამართული)
// -------------------------------------------------------------------------

// @route   PUT /api/users/wishlist
// @desc    Add or Remove item (Toggle)
router.put('/wishlist', async (req, res) => {
    const { userId, productId } = req.body;

    try {
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: "მომხმარებელი ვერ მოიძებნა" });
        }

        // ✅ შესწორება: ვამოწმებთ String-ად გადაყვანილ ID-ებს (უფრო საიმედოა)
        const alreadyAdded = user.wishlist.some(id => id.toString() === productId);

        if (alreadyAdded) {
            // თუ არის - ამოშალოს
            user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        } else {
            // თუ არ არის - დაამატოს
            user.wishlist.push(productId);
        }

        await user.save();

        // ვაბრუნებთ დასურათებულ (Populated) სიას
        const updatedUser = await User.findById(userId).populate('wishlist');
        
        res.json(updatedUser.wishlist);

    } catch (error) {
        console.error("Wishlist Update Error:", error);
        res.status(500).json({ message: "სერვერის შეცდომა ვიშლისტის განახლებისას" });
    }
});

// @route   GET /api/users/:id/wishlist
// @desc    Get user wishlist
router.get('/:id/wishlist', async (req, res) => {
    try {
        // მნიშვნელოვანია .populate('wishlist'), რომ ფრონტმა მიიღოს ფოტო და ფასი
        const user = await User.findById(req.params.id).populate('wishlist');
        
        if (user) {
            res.json(user.wishlist);
        } else {
            res.status(404).json({ message: "მომხმარებელი ვერ მოიძებნა" });
        }
    } catch (error) {
        console.error("Wishlist Fetch Error:", error);
        res.status(500).json({ message: "ვერ მოხერხდა ვიშლისტის წამოღება" });
    }
});

export default router;