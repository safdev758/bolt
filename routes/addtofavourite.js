const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Mother = require('../models/mother');
require('dotenv').config();

// Middleware to authenticate mother
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token missing' });

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.motherId = decoded.userId;
    next();
  });
}

// POST /favorite-babysitter - add a babysitter to mother's favorites
router.post('/add-favorite-babysitter', authenticateToken, async (req, res) => {
  const { babysitterId } = req.body;
  if (!babysitterId) {
    return res.status(400).json({ message: 'babysitterId is required' });
  }

  try {
    const mother = await Mother.findById(req.motherId);
    if (!mother) {
      return res.status(404).json({ message: 'Mother not found' });
    }

    // Prevent duplicates
    if (mother.favorite_babysitters.includes(babysitterId)) {
      return res.status(409).json({ message: 'Babysitter already in favorites' });
    }

    mother.favorite_babysitters.push(babysitterId);
    await mother.save();

    res.status(200).json({ message: 'Babysitter added to favorites', favorites: mother.favorite_babysitters });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
});

module.exports = router;
