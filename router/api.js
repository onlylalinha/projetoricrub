const express = require('express');
const router = express.Router();

const apiController = require('../controllers/apiController')

router.get('/teste', apiController.test);
router.get('/login', apiController.login)

router.get('/details', apiController.details)
router.post('/interest', apiController.add)
router.put('/interest/:id', apiController.update)
router.delete('/interest/:id', apiController.delete)

module.exports = router;