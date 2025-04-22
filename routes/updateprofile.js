const express = require('express');
const router = express.Router();
const Babysitter = require('../models/babysitter');
const Mother = require('../models/mother');
router.put('/updateMotherProfile/:id', async (req, res) => {
    try {
      const { fullname,pref_location, preferred_age_groups, bio , profilePhoto  } = req.body;
  
      const updatedMother = await Mother.findByIdAndUpdate(
        req.params.id,
        { fullname,pref_location, preferred_age_groups, bio , profilePhoto  },
        { new: true }
      );
  
      if (!updatedMother) {
        return res.status(404).json({ message: 'Mother not found' });
      }
  
      res.status(200).json({ message: 'Mother profile updated successfully', mother: updatedMother });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong', error });
    }
  });
  router.put('/updateBabysitterProfile/:id', async (req, res) => {
    try {
      const {
        fullname,
        
        age,
        pref_location,
        exp,
        age_grps,
        profilePhoto,
        bio,
         
      } = req.body;
  
      const updatedBabysitter = await Babysitter.findByIdAndUpdate(
        req.params.id,
        {
          fullname,
          
          age,
          pref_location,
          exp,
          age_grps,
          profilePhoto,
          bio,
          
        },
        { new: true }
      );
  
      if (!updatedBabysitter) {
        return res.status(404).json({ message: 'Babysitter not found' });
      }
  
      res.status(200).json({ message: 'Babysitter profile updated successfully', babysitter: updatedBabysitter });
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong', error });
    }
  });
  module.exports = router;
