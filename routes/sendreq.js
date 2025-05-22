const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const BabysittingRequest = require('../models/BabysittingRequest');
const Notification = require('../models/Notification'); // Import the Notification model
const Mother = require('../models/mother'); // Import the Mother model
router.post('/send-request/:babysitterId', auth, async (req, res) => {
  try {
    const { babysitterId } = req.params;
    const { name, age, date, time, message } = req.body;
    const motherId = req.user.id;
    const mother = await Mother.findById(motherId);
    const motherName = mother.fullname;
    const request = new BabysittingRequest({
      mother: motherId,
      babysitter: babysitterId,
      child: { name, age, babysittingDate: { date, time }, message },
      status: 'pending'
    });
    
    await request.save();

    const notification = new Notification({
      user: babysitterId,
      userType: 'Mother',
      type: 'pending',
      message: `You have a new babysitting request from user ${motherName}.`,
      request: request._id,
    });
    
    await notification.save();

    res.status(201).json({ message: 'Request sent and notification created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;