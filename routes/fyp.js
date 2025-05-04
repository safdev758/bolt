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

// 2. Saved babysitters (unchanged logic – casting strings to ObjectId)
router.get('/saved-babysitters', authenticateToken, async (req, res) => {
  try {
    const motherData = await Mother.findById(req.motherId).lean();
    if (!motherData) return res.status(404).json({ message: 'Mother not found' });

    const savedIds = motherData.saved_babysitters || [];
    if (!savedIds.length) return res.json([]);

    // Fetch all available babysitters
    const allBabysitters = await Babysitter.find({ available: true }).lean();

    // Filter by matching _id.toString() with the savedIds
    const savedWithRatings = allBabysitters.filter(bs =>
      savedIds.includes(bs._id.toString())
    ).map(bs => {
      const ratings = bs.ratings || [];
      const avgRating = ratings.length
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;
      return { ...bs, avgRating };
    });

    // Sort by average rating in descending order
    savedWithRatings.sort((a, b) => b.avgRating - a.avgRating);

    // Return the saved babysitters with ratings
    res.json(savedWithRatings);

  } catch (error) {
    console.error('Error fetching saved babysitters:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

// GET favorite babysitters (full documents) via findById per ID
// GET favorite babysitters (full documents) by JS filtering
router.get('/favorite-babysitters', authenticateToken, async (req, res) => {
  try {
    // 1. Load mother
    const mother = await Mother.findById(req.motherId).lean();
    if (!mother) return res.status(404).json({ message: 'Mother not found' });

    // 2. Grab stored string IDs
    const favIds = Array.isArray(mother.favorite_babysitters)
      ? mother.favorite_babysitters
      : [];
    if (!favIds.length) return res.json([]);

    // 3. Load all available babysitters (or remove filter if you want all)
    const allBabysitters = await Babysitter.find({ available: true }).lean();

    // 4. Filter in JS by matching _id.toString() against the stored strings
    const favorites = allBabysitters.filter(bs =>
      favIds.includes(bs._id.toString())
    );

    // 5. Return the favorites
    res.json(favorites);

  } catch (err) {
    console.error('Error fetching favorites:', err);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
});

module.exports = router;
