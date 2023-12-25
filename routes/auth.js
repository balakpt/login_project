const express = require('express');
const router = express.Router();
const UserControler = require('../controler/user');

router.post('/login',UserControler.login);
router.post('/register',UserControler.register);
router.get('/logout',UserControler.logout);
router.post('/bet',UserControler.bet);



module.exports=router;