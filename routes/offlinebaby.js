const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const BabysittingRequest = require('../models/BabysittingRequest');
const babysitter = require('../models/babysitter');

router.post('/add-child-offline', async (req, res) => {
  // ✅ Extract and verify the JWT from Authorization header
  const authHeader = req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  let userId;
  let babysitterDoc;

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Handle possible variations in payload key
    userId = decoded.userId || decoded.id;
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload: missing user ID' });
    }

    babysitterDoc = await babysitter.findById(userId);
    if (!babysitterDoc) {
      return res.status(401).json({ message: 'Babysitter not found' });
    }
  } catch (err) {
    console.error('Token error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  // ✅ Validate request body
  const { name, age, babysittingDate, message } = req.body;
  if (!name || !age || !babysittingDate?.date || !babysittingDate?.time || !message) {
    return res.status(400).json({ message: 'Incomplete child, babysitting date info, or missing message' });
  }

  try {
    const newRequest = new BabysittingRequest({
      mother: '661dbfc37982954f1cf429ab', // Replace with actual mother ID or dynamic logic
      babysitter: babysitterDoc._id,
      child: {
        name,
        age,
        babysittingDate,
        message
      },
      status: 'accepted' // Since it's an offline request
    });

    await newRequest.save();
    return res.status(201).json({ message: 'Child added (offline) successfully' });
  } catch (err) {
    console.error('Save error:', err);
    return res.status(500).json({ message: 'Error saving offline child request' });
  }
});

module.exports = router;
