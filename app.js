var express = require('express');
var app = express()
var fileUpload = require('express-fileupload');
var path=require('path');
var mongoose=require("mongoose");
var passwordHash =require('password-hash');


var  url= "mongodb://127.0.0.1:27017/reply";
mongoose.Promise=global.Promise;
mongoose.connect(url);
app.use(fileUpload());
//app.use(express.static(app.join("/home/pujitha/Desktop/myweb-projects/reply/uploads")));
app.use('/uploads', express.static(__dirname+'/uploads'));


var session = require("sessionstorage");
var schema= new mongoose.Schema({
    
    fname:
    {
        type:String,
        required :true
    },
    lname:
    {
        type:String,
        required:true
    },
    uname:
    {
        type:String,
        required:true
    },
    email:
    {
        type:String,
        required:true
    },
    password:
    {
        type:String,
        required:true
    }
    
})


var schema2= new mongoose.Schema({
    uname:
    {
        type:String,
        required:true
    },
    qtopic:
    {
        type:String,
        required :true
    },
    question:
    {
        type:String,
        required:true
    },
    filename:
    {
        type:String,
        required:true
    }
})

var t=mongoose.model("userdetail",schema);
var t2=mongoose.model("querydetail",schema2);
var bodyParser=require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.engine('html', require('ejs').renderFile);
app.set("view engine","html");


//app.use(session({secret: 'code'}));
app.get("/",(req,res)=>{
    res.render("index.html");
})

app.get("/register",(req,res)=>{
    res.render("register.html");
})

app.get("/login",(req,res)=>{
    res.render("login.html");
})

app.get("/logout",(req,res)=>{
    session.setItem("loggedIN",false);
    res.render("index.html");
})

app.get("/query",(req,res)=>{
    res.render("query.html");
})
app.post("/createaccount",(req,res)=>{
    console.log(req.body);
    var tabledata = new t(req.body);
    var hashedPassword=passwordHash.generate(req.body.password);
    console.log("Hashed password during signup:"+hashedPassword);
    mongoose.connect(url,function(err,db){
        db.collection('userdetails').insertOne({
            fname:req.body.fname,
            lname:req.body.lname,
            uname:req.body.uname,
            email:req.body.email,
            //password:req.body.password,
            password:hashedPassword,
            

        })
    })
    res.render("index.html");
})

app.get("/admin",(req,res)=>{
    mongoose.connect(url,function(err,db){
        db.collection('querydetails').find().toArray(function(err,i){
            if(err)
                return console.log(err);
         //   cuser=session.getItem("uname");
            res.render("admin.html",{dbarr:i});    
        })
   })
})

app.get("/dashboard",(req,res)=>{
    mongoose.connect(url,function(err,db){
        db.collection('querydetails').find().toArray(function(err,i){
            if(err)
                return console.log(err);
            cuser=session.getItem("uname");
            res.render("dashborad.html",{dbarr:i,cuser});    
        })
   })
})

app.post("/check",(req,res)=>{
    mongoose.connect(url,function(err,db){
        var pass=req.body.password;
        var uname=req.body.uname;
        console.log("user name is :"+uname);
        console.log("Password is :"+pass);
       // var hashedPassword2=passwordHash.generate('req.body.password');
        //console.log("hashed password during login :"+hashedPassword2);  
        
       // passwordHash.verify('pass', hashedPassword)
/*       db.collection('userdetails').find({uname:"rd"},{password:1,fname:0,lname:0,email:0,uname:0}).toArray(function(err,result){
        
        if (err) {
            console.log(err);
        } else if (result.length) {
            console.log("abcd is ;"+result);
        } else {
            socket.emit("No documents found");
        };
       })
   */    
        db.collection('userdetails').findOne({uname:uname},function(err,doc){
            if(err) throw err;
            if(doc){
                console.log("found",doc.fname);
                console.log("found with password ",doc.password);
                var x=doc.password;
                console.log("x is :",x);
                console.log("After verifying :",passwordHash.verify(pass,x));
                session.setItem("loggedIn",true);
                session.setItem("uname",uname);
               // session.setItem("email",email);
                if(uname==="admin")
                    res.redirect("/admin");
                console.log(session.getItem("loggedIn"));
                console.log("current user is:"+session.getItem("uname"));
               // res.render("home.html");
               res.render("query.html");
            }
            else{
                console.log("Not found");
                res.render("login.html");
            }
            

        })
    })
   
})

app.post('/upload', function(req, res) {
    console.log("upload entered");
    console.log(req);
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;

  // Use the mv() method to place the file somewhere on your server


 uploadPath = '/home/pujitha/Desktop/myweb-projects/reply' + '/uploads/' + sampleFile.name;
//uploadPath = __dirname + '/uploads/' + sampleFile.name;
  
sampleFile.mv(uploadPath, function(err) {
    if (err)
      return res.status(500).send(err);
      var tabledata2 = new t2(req.body);

    mongoose.connect(url,function(err,db){
        db.collection('querydetails').insertOne({
            uname:session.getItem("uname"),
            qtopic:req.body.qtopic,
            question:req.body.question,
            filename:req.files.sampleFile.name
        })

    })


    res.send('File uploaded!');
  });
});


app.post('/adminreply', function(req, res) {
    console.log("Admin upload entered");
    console.log(req);
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;

  // Use the mv() method to place the file somewhere on your server


 uploadPath = '/home/pujitha/Desktop/myweb-projects/reply' + '/adminuploads/' + sampleFile.name;
//uploadPath = __dirname + '/uploads/' + sampleFile.name;
  
sampleFile.mv(uploadPath, function(err) {
    if (err)
      return res.status(500).send(err);
      
    res.send('File uploaded!');
  });
});

app.listen(4000,(req,res)=>{
    console.log("listening to port 4000");
})