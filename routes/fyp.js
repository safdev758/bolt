const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');           // ← make sure mongoose is imported
const Mother = require('../models/mother');
const Babysitter = require('../models/babysitter');
require('dotenv').config();

// Middleware to authenticate and attach mother ID
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

// 1. Recommended babysitters (unchanged)
router.get('/recommended-babysitters', authenticateToken, async (req, res) => {
  try {
    const motherData = await Mother.findById(req.motherId);
    if (!motherData) return res.status(404).json({ message: 'Mother not found' });

    const location = motherData.pref_location;
    const preferredAgeGroups = motherData.preferred_age_groups || [];

    const query = { pref_location: location, available: true };
    if (preferredAgeGroups.length) {
      query.age_grps = { $in: preferredAgeGroups };
    }

    const babysitters = await Babysitter.find(query).lean();
    const babysittersWithRatings = babysitters.map(bs => {
      const ratings = bs.ratings || [];
      const avgRating = ratings.length
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;
      return { ...bs, avgRating };
    });

    babysittersWithRatings.sort((a, b) => b.avgRating - a.avgRating);
    res.json(babysittersWithRatings);

  } catch (error) {
    console.error('Error in recommended:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});
router.get('/saved-babysitters', authenticateToken, async (req, res) => {
  try {
    const mother = await Mother.findById(req.motherId).lean();
    if (!mother) return res.status(404).json({ message: 'Mother not found' });

    const savedIds = mother.saved_babysitters || [];
    if (!savedIds.length) return res.json([]);

    // Load every babysitter (no availability filter)
    const allBabysitters = await Babysitter.find().lean();

    // Filter by the mother’s saved string IDs, return unmodified docs
    const saved = allBabysitters.filter(bs =>
      savedIds.includes(bs._id.toString())
    );

    res.json(saved);

  } catch (error) {
    console.error('Error fetching saved babysitters:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});
// 3. Favorite babysitters (no available filter, raw docs)
router.get('/favorite-babysitters', authenticateToken, async (req, res) => {
  try {
    const mother = await Mother.findById(req.motherId).lean();
    if (!mother) return res.status(404).json({ message: 'Mother not found' });

    const favIds = mother.favorite_babysitters || [];
    if (!favIds.length) return res.json([]);

    // Load every babysitter (no availability filter)
    const allBabysitters = await Babysitter.find().lean();

    // Filter by the mother’s favorite string IDs, return unmodified docs
    const favorites = allBabysitters.filter(bs =>
      favIds.includes(bs._id.toString())
    );

    res.json(favorites);

  } catch (error) {
    console.error('Error fetching favorite babysitters:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

module.exports = router;
