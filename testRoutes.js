const express = require('express');
const router = express.Router();
const { testBackend } = require('../controllers/testController');

router.get('/', testBackend);

module.exports = router;