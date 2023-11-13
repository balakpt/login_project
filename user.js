const { query } = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');


const db=mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASS,
    database:process.env.DATABASE_DB
});

exports.login = (req,res) =>{
   try {
      const { Email, Password}=req.body;

      if(!Email || !Password){
         return res.status(400).render('login',{msg:'pls enter '});
      }   

      db.query('SELECT * FROM login_page where Email=?', [Email], async(err, result) =>{
            // console.log(result);
             if(result.length<=0){
                 return res.status(400).render('login',{msg:'pls enter correct email or password '});

             } else{
               if( !(await bcrypt.compare(Password,result[0].Password))){
                 return res.status(400).render('login',{msg:'pls enter correct email or password '});
                   
               } else{
                  //res.send('goood');
                  const id = result[0].Email;
                  const token = jwt.sign({ id:id},process.env.JWT_SECRET,{
                     expiresIn:process.env.JWT_EXPIRES_IN,

                  });
                 // console.log('this is token'+token);
                  const cookieOptions={
                     expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES * 24*60*60*1000),
                     httpOnly:true,
                  };
                  res.cookie('Bala',token,cookieOptions);
                  res.status(200).redirect('/home');
               }
             }
      });

   } catch(err){
      console.log(err);
   }
};


exports.register = (req,res) =>{
   
   const { Name, Email, Password, Conform_Password }=req.body

   db.query(
           "SELECT Email FROM login_page where email=?",[Email], async  (err, result) =>{
                 if(err){
                    console.log(err);
                 } 
                       
                  
                if(result.length>0){
                    return res.render('register',{msg:'Email is already taken'});
                 }
                else if (Password !== Conform_Password){
                   return res.render('register',{msg:'Wrong Password '});
                 }
                 let hashedPassword = await bcrypt.hash(Password, 8);
                   // console.log(hashedPassword);

                 db.query('INSERT INTO  login_page set ?',
                 {Name:Name, Email:Email, Password:hashedPassword, Conform_Password:hashedPassword},
                 (err, result) => {
                  if(err){
                     console.log(err);
                  }else {
                    return  res.render('register',{msg:'Regiter is sucessfull '});
                  }

           });
         }); 

};

exports.isLoggedIn = async (req,res,next) => {
        //  req.name =' cheking.....';
        //console.log(req.cookies);
           if(req.cookies.Bala){
            try{
              const decode= await promisify(jwt.verify)(req.cookies.Bala, process.env.JWT_SECRET);
             // console.log(decode);
              db.query('SELECT * FROM login_page WHERE Email=?',[decode.id],(err, result)=>{
              // console.log(result);
              if(!result){
               return next();
              }
              req.user = result[0];
              return  next();
              });
            } catch (err){
              //console.log(err);
              return next();
            }
           } else{
            next();
           }
};

exports.logout = async (req,res)=>{
  
   res.cookie('Bala', 'logout',{expires: new Date(Date.now()+ 2* 1000),httpOnly:true,});

   res.status(200).redirect('/');
   
};