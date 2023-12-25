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
         return res.status(400).render('login',{msg:'Pls enter',msg_type:"e"});
      }   

      db.query('SELECT * FROM login_page where Email=?', [Email], async(err, result) =>{
            //console.log(result);
             if(result.length<=0){
                 return res.status(400).render('login',{msg:'Pls enter correct email or password', msg_type:"e"});

             } else{
               if( !(await bcrypt.compare(Password,result[0].Password))){
                 return res.status(400).render('login2',{msg:'Pls enter correct email or password ',msg_type:"e"});
                   
               } else{
                  //res.send('goood');
                  const id = result[0].Email;
                  const token = jwt.sign({ id:id},process.env.JWT_SECRET,
                                {expiresIn:process.env.JWT_EXPIRES_IN });

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
   
   const { Name, Email, Password, Conform_Password, Balance}=req.body

   db.query(
           "SELECT Email FROM login_page where email=?",[Email], async  (err, result) =>{
                 if(err){
                    console.log(err);
                 } 
                  //console.log(result);

                       
                  
                if(result.length>0){
                    return res.render('login',{msg:'Email is already taken',msg_type:"e"});
                  
                 }
                else if (Password !== Conform_Password){
                   return res.render('login',{msg:'Wrong Password ',msg_type:"e"});
                  
                 }
                 let hashedPassword = await bcrypt.hash(Password, 8);
                  // console.log(hashedPassword);

                 db.query('INSERT INTO  login_page set ?',
                 {Name:Name, Email:Email, Password:hashedPassword, Conform_Password:hashedPassword},
                 (err, result) => {
                  if(err){
                     console.log(err);
                     console.log(result);
                  }else {
                    return  res.render('login',{msg:'Regiter is sucessfull ',msg_type:"g"});
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
               //console.log(result);
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
exports.bet= async (req,res,next)=>{
   const betam=req.body;
   
   if(req.cookies.Bala){
      try{
        const decode= await promisify(jwt.verify)(req.cookies.Bala, process.env.JWT_SECRET);
      // console.log(decode.id);
        db.query('SELECT * FROM login_page WHERE Email=?',[decode.id],(err, result)=>{
        // console.log(result);
        if(!result){
         return next();
        }
        user = result[0];
        const Email = user.Email;
        const betam1= user.Balance - betam.betam ;
        
        console.log(user.Balance);
         if(user.Balance<betam.betam){
            console.log('insufie fund')
         }else{
           // UPDATE `login_page` SET `Balance` = '5000' WHERE `login_page`.`Email` = 'bala@gmail.com';
          // console.log(betam.betam);

          
              
               db.query('UPDATE login_page SET Balance=? WHERE Email=?',[betam1,Email], (err, row) => { 
                  if(err) throw err; 
                  console.log(row); 

                 // INSERT INTO customers

                 
              });
              console.log(betam.betam)

              let query = `INSERT INTO login_page  (bat1) VALUES (?);`; 

               db.query(query,[betam.betam], (err, row) => { 
                  if(err) throw err; 
                  console.log("Row inserted with id = " + rows.insertId);
               });
            };

        res.status(200).redirect('/home');
        return  next();
        });
      } catch (err){
        //console.log(err);
        return next();
      }
     } else{
      next();
     }
}