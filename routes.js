const passport = require("passport");
const bcrypt = require("bcrypt");

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }
  

module.exports = function (app, myDataBase) {
    
  app.route("/").get((req, res) => {
    res.render("pug", {
      title: "Connected to Database",
      message: "Please login",
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true
    });
  });

  app.route("/profile").get(ensureAuthenticated, (req, res) => {
    res.render(process.cwd() + "/views/pug/profile", {
      username: req.user.username,
    });
  });

  app
    .route("/login")
    .post(
      passport.authenticate("local", { failureRedirect: "/" }),
      (req, res) => {
        res.redirect("/profile");
      }
    );

  app.route("/profile").get((req, res) => {
    res.render(process.cwd() + "/views/pug/profile");
  });

  app.route("/logout").get((req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.route("/register").post(
    (req, res, next) => {
      myDataBase.findOne({ username: req.body.username }, function (err, user) {
        if (err) {
          next(err);
        } else if (user) {
          console.log("Username is already taken.");
          res.redirect("/");
        } else {
          const hash = bcrypt.hashSync(req.body.password, 12);
          myDataBase.insertOne(
            { username: req.body.username, password: hash },
            (err, doc) => {
              if (err) {
                res.redirect("/");
              } else {
                next(null, doc);
              }
            }
          );
        }
      });
    },
    passport.authenticate("local", { failureRedirect: "/" }),
    (req, res, next) => {
      console.log("Call");
      res.redirect("/profile");
    }
  );
  
  app.route('/auth/github').get(passport.authenticate('github'));
  
  app.route('/auth/github/callback').get(passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/profile', { username : req.displayName });
  });

  app.use((req, res, next) => {
    res.status(404).type("text").send("Not Found");
  });
};
