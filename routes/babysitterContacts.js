const router = require('express').Router();
const auth = require('../middlewares/auth');
router.get('/babysitter/contacts', auth, async (req, res) => {
    const sitter = await Babysitter.findById(req.user.id).populate('contacts');
    res.json(sitter.contacts);
  });
module.exports =router;  