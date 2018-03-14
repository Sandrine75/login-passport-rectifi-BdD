var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

//// page register////
router.get('/register', function(req, res){
	res.render('register');
});

//// page login ////
router.get('/login', function(req, res){
	res.render('login');
});

//// page register users ////
router.post('/register', function(req, res){
	var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

//// Validation des informations ////
	req.checkBody('name', 'Name is required').notEmpty(); // notEmpty >> a remplir
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);// equivalent à password
// pour avoir une notification en rouge en haut (name is required) lorsqu'une des données n'est pas renseignée, voir code ligne 4 à 9 dans register.handlebars
    
	var errors = req.validationErrors();
    
    if(errors){
            res.render('register');
            }
    else {
            var newUser = new User({
                name: name,
                email: email,
                username: username,
                password: password
            });

           // création du user dans le model       
            User.createUser(newUser, function(err, user){
                if(err) throw err;
                console.log(user); 
            }); 
        // message flash success message
        // router.flash changé par req.flash
        req.flash('success_msg', 'Vous êtes bien enregistré et vous pouvez vous iddentifier par votre Login'); // Nota : pour afficher ce message, il faut ajouter un template. Aller dans Layout.hadlebars lignes 30 à 41
        res.redirect('/users/login');
    };
  
});

//////////////part 3


        passport.use(new LocalStrategy(
          function(username, password, done) {
              User.getUserByUsername(username, function(err, user){
               if(err) throw err;
               if(!user){
                      return done(null, false, {message: 'Utilisateur inconnu'});
                  }

            User.comparePassword(password, user.password, function(err, isMatch){
                      if(err) throw err;
                      if(isMatch){
                        return done(null, user);
                      }else {
                      return done(null, false, {message: 'Mot de passe invalide'});
                  }
              }); 
           });
        }));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login', // pour le login, on utilise la base en local
    passport.authenticate('local', {succesRedirect:'/', failureRedirect: '/users/login', failureFlash: true}),
    function(req, res) {
        res.redirect('/');
    });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'Vous êtes déconnecté');

	res.redirect('/users/login');
});
//////////////

module.exports = router;