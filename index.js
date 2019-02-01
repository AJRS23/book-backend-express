const Joi = require('joi');
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
let cors = require('cors');
const uuidv1 = require('uuid/v1');
app.use(cors());

app.use(express.json());


app.use(function verifiyToken(req,res,next){
  if (isPublic(req.path)) next();
  else{
    const authToken = req.headers['auth-token'];
    if(typeof authToken !== 'undefined'){
      jwt.verify(authToken, 'secretKey', (err,authData)=>{
        if(err){
          return res.sendStatus(403);
        }
        req.user = authData.newUser
        
        //Next middleware
        next();
      });
    }else{
      res.sendStatus(403);
    }
  }
});

function isPublic (path){
  return (path === "/v2/user" || path == "/v2/user/login")
}


let books = [
{
  customer: "aramirez",
  value: []
}
  
];
let users = [
  {
     username: 'alvaro',
     customer: 'aramirez',
     password: '1234'
  }
  
]

//REGISTER
app.post('/v2/user',(req,res)=>{
  const { error } = validateRegister(req.body);
  //400 bad request
  if(error) return res.status(400).send(error.details[0].message);

  const newUser = {
    username: req.body.username,
    customer: req.body.customer,
    password: req.body.password
  }

  const newCustomer = {
    customer: req.body.customer,
    value: []
  }

  users.push(newUser);
  books.push(newCustomer);
  res.status(200).send("Registered");
  
})

// LOGIN
app.post('/v2/user/login',(req,res)=>{ 
  const { error } = validateLogin(req.body);
  //400 bad request
  if(error) return res.status(400).send(error.details[0].message);

  const userFound = users.find(u => u.username == req.body.username)
  if(!userFound) return res.status(404).send('User not found')
  if(userFound.password !== req.body.password) return res.status(401).send('Password incorrect')

  const newUser = {
    username: req.body.username,
    customer: userFound.customer
  }
  
  jwt.sign({newUser}, 'secretKey',{expiresIn: '300s'}, (err, token) => {
     res.json({
       username: newUser.username,
       customer: newUser.customer,
       token 
     });
  });
})


// GET ALL BOOKS
app.get('/v2/book', (req,res) => {
  console.log(req.user)
  const customerFound = books.find(b => b.customer == req.user.customer)
  if(!customerFound) return res.status(404)
  
  res.send(customerFound.value);
});

// GET BOOK
app.get('/v2/book/:id', (req, res)=>{
  const customerFound = books.find(b => b.customer == req.user.customer)
  if(!customerFound) return res.status(404)

  const book = customerFound.value.find(b => b.id == req.params.id);
  if(!book) return res.status(404).send ('The book was not found')  //404 = object not found

  res.send(book);
  //res.send(req.query); //?sortBy=name
});

// ADD BOOK
app.post('/v2/book',(req,res)=>{
  
  const { error } = validateBook(req.body);
  //400 bad request
  if(error) return res.status(400).send(error.details[0].message);

  const bookFound = books.find(b => b.customer == req.user.customer)
  if(!bookFound) return res.status(404).send
  
  console.log("bookFound "+bookFound)
  
  const book = {
    id: uuidv1(),
    name: req.body.name,
    author: req.body.author
  };
  bookFound.value.push(book)
  res.send(book);
  
});

// UPDATE BOOK
//Falta corregirlo
app.put('/v2/book/:id', (req,res)=>{

  const book = books.find(b => b.id == parseInt(req.params.id));
  if(!book) return res.status(404).send ('The book was not found')

  //const validate = validateBook(req.body);
  const { error } = validateBook(req.body);
  //400 bad request
  if(error) return res.status(400).send(error.details[0].message);

  book.name = req.body.name;
  book.author = req.body.author;

  res.send(book);
});

// DELETE BOOK
app.delete('/v2/book/:id',(req,res)=>{
  
  const customerFound = books.find(b => b.customer == req.user.customer)
  if(!customerFound) return res.status(404).send('customer incorrecto')

  const book = customerFound.value.find(b => b.id == req.params.id);
  if(!book) return res.status(404).send ('The book was not found')

  const index = customerFound.value.indexOf(book);
  customerFound.value.splice(index,1);
  console.log(customerFound)
  
  res.send(book);

})

// RENEW TOKEN
app.post('/v2/user/renew',(req,res)=>{
  const newUser = {
    username: req.user.username,
    customer: req.user.customer
  }

  jwt.sign({newUser}, 'secretKey',{expiresIn: '60s'}, (err, token) => {
    res.json({
      username: newUser.username,
      customer: newUser.customer,
      token 
    });
 });

})


//export PORT = 5000 -> en la terminal
const port = process.env.PORT || 3000;
app.listen(8080, () => console.log(`Listening on port 8080...`))
 

function validateBook(book){
  const schema = {
    name: Joi.string().required(),
    author: Joi.string().required()
  }

  return Joi.validate(book, schema);
}

function validateRegister(user){
  const schema = {
    username: Joi.string().required(),
    password: Joi.string().required(),
    customer: Joi.string().required()
  }
  return Joi.validate(user, schema);
}

function validateLogin(user){
  const schema = {
    username: Joi.string().required(),
    password: Joi.string().required(),
    customer: Joi.string()
  }
  return Joi.validate(user, schema);
}