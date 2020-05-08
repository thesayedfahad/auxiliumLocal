import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Item model to find data in DB
import User from "../models/User.model";

const userRouter = express.Router();

// @route     POST api/users
// @desc      Register a new User
// @access    Public (implement auth later)
userRouter.post("/", async (req, res) => {
  const { name, email, password, firstName, lastName, userType } = req.body;

  // Simple validation
  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" })
  };

  // Check existing user
  const foundUser = await User.findOne({ email });
  if (foundUser) { return res.status(400).json({ msg: "User already exists" })}
  // User.findOne({ email }).then(foundUser => {
  //   if (foundUser) { return res.status(400).json({ msg: "User already exists" })}
  // })

  // If user doesn't exist
  const newUser = new User({
    name,
    email, 
    password,
    firstName,
    lastName,
    userType
  });

  // create Salt and hash for user password
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save()
        .then(user => {
          // JWT sign in 
          jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
              if (err) throw err;
              // This is where we generate a token for the user
              res.json({
                token, // <-- Json Web Token
                user: {
                  userId: user.id,
                  name: user.name,
                  email: user.email
                }
              });
            }
          )
        });
    });
  });
});

export default userRouter;
