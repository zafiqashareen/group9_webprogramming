var express               = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User                  = require("./models/user"),
    expressSanitizer 	  = require("express-sanitizer"),
	methodOverride        = require("method-override")

//Open a connection to the auth_demo_app database on our locally running instance of MongoDB
mongoose.connect("mongodb://localhost/ass_app");

var app = express();

//tell express to use the body-parser, express-session and passport
app.use(require("express-session")({
    secret: "Rusty is the best and cutest dog in the world", //used to encode and decode session
    resave: false,                                           
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//Tell Passport to use the local strategy
passport.use(new LocalStrategy(User.authenticate()));
//Passport reading the session, taking data from the session and encode and decode it 
passport.serializeUser(User.serializeUser());         //encode 
passport.deserializeUser(User.deserializeUser());     // decode

//APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());  //Mount the middleware below the bodyParser() instantiations and above the routes
app.use(methodOverride("_method"));  //override with POST having "?_method=DELETE" or "?_method=PUT"


//MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	date_: {type: Date},
    title: String,
    category: Array,
	amount: String,
    body: String,
	duration: String,
    created: {type: Date, default: Date.now}  //take current date
});
var Blog = mongoose.model("Blog", blogSchema);

//============
// ROUTES
//============

//root route to Home page
app.get("/", function(req, res){
    res.render("home");
});

// REGISTER ROUTES
//get route to show sign up form
app.get("/register", function(req, res){
   res.render("register"); 
});

//route to show Secret page
app.get("/secret",isLoggedIn, function(req, res){
   res.render("secret"); 
});

//post route to handle user sign up
app.post("/register", function(req, res){
    //pass in username and password to a new object, User & create a new user in database
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register'); //go back to sign up page if got error
        }
        //once user been created without error, user will be redirect to the "Secret" page
        //logged the user in using passport
        passport.authenticate("local")(req, res, function(){
           res.redirect("/secret");
        });
    });
});


// LOGIN ROUTES
//route to render login form
app.get("/login", function(req, res){
   res.render("login"); 
});

//route to show success page
app.get("/success",isLoggedIn, function(req, res){
   res.render("success"); 
});

//post route to perform authentication
app.post("/login", passport.authenticate("local", {
    successRedirect: "success",
    failureRedirect: "login"
}) ,function(req, res){
});

//Add isLoggedIn middleware 
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

// LOGOUT ROUTES
app.get("/logout", function(req, res){
    res.redirect("out");
});

//to show out page
app.get("/out",isLoggedIn, function(req, res){
   res.render("out"); 
});


//ABOUTUS
app.get("/about", function(req, res){
	var thing = req.params.thing;
    res.render("about", {thingVar: thing});
});

//GOALS
app.get("/goals", function(req, res){
    var thing = req.params.thing;
    res.render("goals", {thingVar: thing});
});

//REPORT
app.get("/report", function(req, res){
    var thing = req.params.thing;
    res.render("report", {thingVar: thing});
});

// ROOT ROUTE - redirect to index page "/blogs"
app.get("/", function(req, res){
   res.redirect("/blogs");   
});

// INDEX ROUTE - List all blogs
app.get("/blogs", function(req, res){
   Blog.find({}, function(err, blogs){
       if(err){
           console.log("ERROR!");
       } else {
          res.render("index", {blogs: blogs}); 
       }
   });
});

// NEW ROUTE - Show a new blog form
app.get("/blogs/new", function(req, res){
    res.render("new");
});


// CREATE ROUTE - Create a new blog, then redirect somewhere
app.post("/blogs", function(req, res){
    // create blog
    console.log(req.body);
    console.log("===========")
    console.log(req.body);
    Blog.create(req.body.blog, function(err, newGoal){
        if(err){
            res.render("new");
        } else {
            //then, redirect to the index page
            res.redirect("/blogs");
        }
    });
});

// SHOW ROUTE - Show info about one specific blog
app.get("/blogs/:id", function(req, res){
   Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs"); //redirect back to index page
       } else {
           res.render("show", {blog: foundBlog});
       }
   })
});

// EDIT ROUTE - Show edit form for one blog
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs"); //redirect back to index page
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
})


// UPDATE ROUTE - Update particular blog, then redirect somewhere
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body)  //sanitize the blog.body
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
      if(err){
          res.redirect("/blogs"); //redirect back to index page
      }  else {
          res.redirect("/blogs/" + req.params.id); //redirect us to right show page
      }
   });
});

// DELETE ROUTE - Delete a particular blog, then redirect somewhere
app.delete("/blogs/:id", function(req, res){
   //destroy blog & redirect to index page
   Blog.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/blogs");  //redirect back to index page
       } else {
           res.redirect("/blogs");  //redirect back to index page
       }
   })  
});

// GOALS ROUTE - Show a new goal form
app.get("/goal_blogs/goals", function(req, res){
    res.render("goals");
});


// INDEXG ROUTE - List all goals
app.get("/goal_blogs/indexg", function(req, res){
   Blog.find({}, function(err, goal_blogs){
       if(err){
           console.log("ERROR!");
       } else {
          res.render("indexg", {goal_blogs: goal_blogs}); 
       }
   });
});

// CREATE GOAL ROUTE - Create a new goal, then redirect somewhere
app.post("/goal_blogs/indexg", function(req, res){
    // create blog
    console.log(req.body);
    console.log("===========")
    console.log(req.body);
    Blog.create(req.body.goal_blogs, function(err, newBlog){
        if(err){
            res.render("goals");
        } else {
            //then, redirect to the index page
            res.redirect("indexg");
        }
    });
});

// SHOW GOAL ROUTE - Show info about one specific goal
app.get("/goal_blogs/:id", function(req, res){
   Blog.findById(req.params.id, function(err, foundGoalBlog){
       if(err){
           res.redirect("indexg"); //redirect back to index page
       } else {
           res.render("showg", {goal_blogs: foundGoalBlog});
       }
   })
});

// EDIT GOAL ROUTE - Show edit form for one blog
app.get("/goal_blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundGoalBlog){
        if(err){
            res.redirect("indexg"); //redirect back to index page
        } else {
            res.render("editg", {goal_blogs: foundGoalBlog});
        }
    });
});

// UPDATE GOAL ROUTE - Update particular blog, then redirect somewhere
app.put("/goal_blogs/:id", function(req, res){
    req.body.goal_blogs.body = req.sanitize(req.body.goal_blogs.body)  //sanitize the blog.body
   Blog.findByIdAndUpdate(req.params.id, req.body.goal_blogs, function(err, updatedGoalBlog){
      if(err){
          res.redirect("indexg"); //redirect back to index page
      }  else {
          res.redirect("/goal_blogs/" + req.params.id); //redirect us to right show page
      }
   });
});

// DELETE GOAL ROUTE - Delete a particular blog, then redirect somewhere
app.delete("/goal_blogs/:id", function(req, res){
   //destroy blog & redirect to index page
   Blog.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("indexg");  //redirect back to index page
       } else {
           res.redirect("indexg");  //redirect back to index page
       }
   })  
});

// REPORTS ROUTE - Show reports analysis
app.get("/analysis/report", function(req, res){
    res.render("report");
});

// SHOW TABLE ROUTE - Show category table
app.get("/analysis/show_table", function(req, res){
   Blog.find({}, function(err, blogs){
       if(err){
           console.log("ERROR!");
       } else {
          res.render("show_table", {blogs: blogs}); 
       }
   });
});


// Add the "*" route matcher 
app.get("*", function(req,res){
    res.send("Page Not Found!");
});

app.listen(3000, function(){
   console.log("Server has started!!!");
});
