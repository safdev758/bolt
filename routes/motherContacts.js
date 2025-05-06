const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Bysitter = require('../models/babysitter');
const Mother = require('../models/mother');
router.get('/mother/contacts', auth, async (req, res) => {
    const mother = await Mother.findById(req.user.id).populate('contacts');
    res.json(mother.contacts);
  });
  router.get('/babysitter/contacts',auth, async(req,res)=>{
    const babysitter = await Bysitter.findById(req.user.id).populate('contacts');
    res.json(babysitter.contacts);
  })
module.exports = router;