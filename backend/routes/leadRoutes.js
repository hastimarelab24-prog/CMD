const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
const {getLeads,createLead,updatedLead,transitionStatus,deleteLead}=require('../controllers/leadController')
router.route('/').get(getLeads).post(createLead);
router.route('/:id').put(authMiddleware,updatedLead).delete(authMiddleware,deleteLead);
router.patch('./:id/status',authMiddleware,transitionStatus);
module.exports = router;