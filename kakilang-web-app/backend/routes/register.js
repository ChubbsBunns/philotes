const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const router = require("express").Router();

/**
 * POST Request to register user
 */
router.route("/add").post(async (req, res) => {
  const user = req.body;

  // Check if email has already registered
  const takenEmail = await User.findOne({ email: user.email });

  if (takenEmail) {
    res.json({ message: "Invalid Email or Password", isSuccessful: false });
  } else {
    // Safely encrypt the password
    user.password = await bcrypt.hash(req.body.password, 10);

    // Construct a user from the model
    const newUser = new User({
      name: user.name,
      major: user.major,
      house: user.house,
      floor: user.floor,
      cca: user.cca,
      email: user.email.toLowerCase(),
      password: user.password,
    });

    // Save the user to mongoDB
    newUser.save();
    res.json({ message: "Success", isSuccessful: true });
  }
});

module.exports = router;
