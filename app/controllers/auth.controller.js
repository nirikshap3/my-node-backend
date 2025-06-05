const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

const jwtSecret = process.env.JWT_SECRET;
const tokenExpiry = process.env.TOKEN_EXPIRY || '1h';

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashed });
    await user.save();

    res.status(200).send({ 
        status: 200,
        message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).send({ 
        status: 500,
        message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).send({ message: 'Invalid password' });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      jwtSecret,
      { expiresIn: tokenExpiry }
    );

    res.status(200).send({ 
        status: 200,
        token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).send({
        status: 500,
        message: err.message });
  }
};
