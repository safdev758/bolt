const express = require('express');
const router = express.Router();
const Babysitter = require('../models/babysitter'); 





router.put('/updateAvailability/:id', async (req, res) => {
    try {
      const { available } = req.body;
  
      const updatedBabysitter = await Babysitter.findByIdAndUpdate(
        req.params.id,
        { available },
        { new: true }
      );
  
      if (!updatedBabysitter) {
        return res.status(404).json({ message: 'Babysitter not found' });
      }
  
      res.status(200).json({ message: 'Availability updated successfully', babysitter: updatedBabysitter });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong', error });
    }
  });  //il faut modifier search cad search by availability
  module.exports = router
  