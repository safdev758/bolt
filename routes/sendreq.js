const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
router.post('/send-request/:babysitterId', auth, async (req, res) => {
    const { babysitterId } = req.params;
    const { name, age, month, day, time } = req.body;
    const motherId = req.user.id;
  
    const request = new BabysittingRequest({
      mother: motherId,
      babysitter: babysitterId,
      child: { name, age, babysittingDate: { month, day, time } }
    });
  
    await request.save();
    res.status(201).json({ message: 'Request sent successfully', request });
  });
  module.exports = router;
  