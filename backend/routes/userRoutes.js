const express = require('express');
const router = express.Router();
const {createNewUser,getUserProfile,allUsers} = require('../controllers/userController')

router.post('/create',createNewUser);
router.get('/',getUserProfile);
router.get('/allUsers',allUsers);

module.exports = router;