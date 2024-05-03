const express = require('express');
const app = express();
var passwordHash = require('password-hash');
const bodyParser = require("body-parser");

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({extended : false}));

app.use(express.static("public"));

app.set("view engine","ejs");

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore , Filter} = require('firebase-admin/firestore');

var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount),
});
 
const db = getFirestore();

app.get("/", function (req,res){
  res.sendFile(__dirname + "/public/" + "aa.html");
});

app.post("/signupSubmit", function(req,res){
    console.log(req.body);
  db.collection("usersDemo")
    .where(
        Filter.or(
          Filter.where("email" , "==" ,req.body.email),
          Filter.where("userName" , "==" ,req.body.username)
        )
    )
    .get()
    .then((docs) => {
    if (docs.size > 0){
      res.send("Sorry,This account is already Exists with email and username");
    } else {
      db.collection("usersDemo")
        .add({
        userName : req.body.username,
        email : req.body.email,
        password : passwordHash.generate(req.body.password),
      })
      .then(() => {
        res.sendFile(__dirname + "/public/" + "aa.html");
      })
      .catch(() => {
        res.send("Something went wrong");
      });
    } 
  });
});

app.post("/loginSubmit", function(req,res){


 // passwordHash.verify(req.query.password, hashedPassword)
  db.collection("usersDemo")
    .where("userName", "==" , req.body.username)
    .get()
    .then((docs) => {
      let verified = false;
      docs.forEach((doc) => {
        verified = passwordHash.verify(req.body.password, doc.data().password);
      });

      if(verified){
        res.render("home");
      } else{
        res.send("Fail");
      }
  });

});
app.get('/cards',(req,res)=>{
    res.render('cards11');
});
app.get('/forms',(req,res)=>{
    res.render('form.ejs');
})

app.get('/reserve', (req, res) => {
    res.sendFile(__dirname + '/public/' + 'reserve.html');
  });
  
  app.get('/payment', (req, res) => {
      res.sendFile(__dirname +'/public/' + 'payment.html');
  });
  
  app.post('/reserve',(req,res)=>{
    console.log(req.body);
    db.collection("Reservations").add({
      Name: req.body.name,
      Email: req.body.email,
      Phone:req.body.phone,
      Location:req.body.location,
      Date:req.body.date,
      Time:req.body.time,
      People:req.body.people,
      Special_Requests:req.body.special_requests,
      access_key: '810e3275-ca64-40d9-8244-0c70a99bf626'
   })
   axios.post('https://api.web3forms.com/submit', formData)
   .then(() => {
        res.sendFile(__dirname + '/public/' + 'payment.html');
      })
   .catch(() => {
          res.send('something went wrong');
      });
  });
  
  app.post('/payment',(req,res) => {
      console.log(req.body);
      db.collection("Payment_Details").add({
          Name:req.body.name,
          Email:req.body.email,
          Address:req.body.address,
          City:req.body.city,
          Country:req.body.country,
          Zip_Code:req.body.zipcode,
          Card_Name:req.body.cardname,
          Card_Number:req.body.cardnumber,
          Expiry_Month:req.body.expmonth,
          Expiry_Year:req.body.expyear,
          CVV:req.body.cvv
      })
  });



app.listen(5000,() => {
    console.log('server started');
});