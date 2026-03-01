import express from 'express';
import User from '../models/UserModel.js';
import generateToken from '../utils/generateToken.js';
import { sendWelcomeEmail } from '../utils/sendWelcomeEmail.js'; 

const router = express.Router();

// --- LOGIN ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            hasUsedWelcomePromo: user.hasUsedWelcomePromo, // 👈 დაემატა ეს ხაზი
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'ელ. ფოსტა ან პაროლი არასწორია' });
    }
});

// --- REGISTER (აქ ხდება მეილის გამოძახება) ---
router.post('/', async (req, res) => {
    const { name, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'მომხმარებელი ამ ელ. ფოსტით უკვე არსებობს' });
    }

    try {
        const user = await User.create({ name, email, password });

        if (user) {
            console.log("👤 მომხმარებელი შეიქმნა, ვაგზავნით მეილს...");

            // 📩 მეილის გაგზავნა (ფონურად, await-ის გარეშე, რომ მომხმარებელი არ ალოდინოს)
            sendWelcomeEmail(user.email, user.name)
                .then(() => console.log(`Email task finished for ${user.email}`))
                .catch(err => console.error("Email task failed", err));

            res.status(201).json({ 
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                hasUsedWelcomePromo: user.hasUsedWelcomePromo, // 👈 დაემატა ეს ხაზი
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

// --- WISHLIST ---
router.put('/wishlist', async (req, res) => {
    const { userId, productId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "მომხმარებელი ვერ მოიძებნა" });

        const alreadyAdded = user.wishlist.some(id => id.toString() === productId);
        if (alreadyAdded) {
            user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        } else {
            user.wishlist.push(productId);
        }

        await user.save();
        const updatedUser = await User.findById(userId).populate('wishlist');
        res.json(updatedUser.wishlist);
    } catch (error) {
        res.status(500).json({ message: "სერვერის შეცდომა ვიშლისტის განახლებისას" });
    }
});

router.get('/:id/wishlist', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('wishlist');
        if (user) res.json(user.wishlist);
        else res.status(404).json({ message: "მომხმარებელი ვერ მოიძებნა" });
    } catch (error) {
        res.status(500).json({ message: "ვერ მოხერხდა ვიშლისტის წამოღება" });
    }
});

export default router;