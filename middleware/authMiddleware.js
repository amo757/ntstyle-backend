import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/UserModel.js'; // 👈 შეამოწმე, შენს models ფოლდერში ამ ფაილს რა ჰქვია?

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // ვამოწმებთ, აქვს თუ არა ჰედარს Authorization და იწყება თუ არა "Bearer"-ით
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // ვიღებთ ტოკენს (Bearer ტოკენის_კოდი)
      token = req.headers.authorization.split(' ')[1];

      // ვშიფრავთ ტოკენს
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ვპოულობთ მომხმარებელს აიდის მიხედვით და ვინახავთ req.user-ში (პაროლის გარეშე)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export { protect };