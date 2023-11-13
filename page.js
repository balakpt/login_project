const express = require('express');
const router = express.Router();
const UserControler = require('../controler/user');



router.get(['/','/login'], (req,res)=>{
    res.render('login');
});



router.get('/register', (req,res)=>{
    res.render('register');
});

router.get('/profile',UserControler.isLoggedIn, (req,res)=>{
    if(req.user){
        res.render('profile',{user:req.user});
        } else{
        res.redirect('login');
       // console.log(req.user);
 
      }
});

router.get('/home', UserControler.isLoggedIn,(req,res)=>{
  //  console.log(req.user);
     if(req.user){
       res.render('home',{user:req.user});
      // console.log(req.user);

       } else{
       res.redirect('login');
      // console.log(req.user);

     }
   
});

module.exports=router;