//Requiring Mongoose module in our project
var mongoose = require("mongoose");
//add the passport-local-mongoose to our user model
var passportLocalMongoose = require("passport-local-mongoose");

//Define a User Schema with two properties: username and password
var UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

//Take the passport-local-mongoose plugin that we required in app.js 
UserSchema.plugin(passportLocalMongoose);

//Take the schema and compile it to a model
//The module.exports or exports is a special object which is included in every JS file in the Node.js application by default. 
module.exports = mongoose.model("User", UserSchema);