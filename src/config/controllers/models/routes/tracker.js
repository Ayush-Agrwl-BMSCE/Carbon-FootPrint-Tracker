const express = require('express');
const { trackActivity, getStats } = require('../../trackerController');
const router = express.Router();
router.post('/activity', trackActivity);
router.get('/stats/:user_id', getStats);
module.exports = router;