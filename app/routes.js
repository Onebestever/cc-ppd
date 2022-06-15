const user = require("./models/user");
require('dotenv').config();


module.exports = function (app, passport, db) {

  const {
    ObjectId
  } = require('mongodb') //gives access to _id in mongodb
  //Collection variable
  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });



  // PROFILE SECTION =========================

  app.get('/profile', isLoggedIn, async function (req, res) {
   const results = db.collection('journalEntries').find().toArray((err, result) => {
      console.log(req.user)
      if (err) return console.log(err)
      console.log(result)


      res.render('profile.ejs', {

        user: req.user,
        'journalEntries': result,
        allUsers: result

      })
    })
  });


  //VIEWERS LOGIN ////////
  app.get('/viewers', isLoggedIn, function (req, res) {
    db.collection('users').find().toArray((err, result) => {
      if (err) return console.log(err)
      console.log(result)


      res.render('viewers.ejs', {
        user: req.user,
        allUsers: result
      })
    })
  });


  //USER PROFILE
  app.get('/viewers', isLoggedIn, function (req, res) {
    db.collection('journalEntries').find().toArray((err, result) => {
      if (err) return console.log(err)
      console.log('result', result)

      //update find to filter out/
      // let myWorkLogs = result.filter(doc => doc.name === req.user.local.email)
      // console.log('myWorkLogs', myWorkLogs)

      res.render('viewers.ejs', {
        user: req.user,
        orders: result
      })
    })
  });

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  // viewers Page Routes ===============================================================






  app.post('/log', (req, res) => {
    // console.log(req.body)
    db.collection('journalEntries').insertOne({
      dailyPost: req.body.dailyPost,
      date: req.body.date,
      emotion: req.body.emotion,
      stressLevel: req.body.stressLevel,
      harmful: req.body.harmful,
      note: req.body.note,
      starred: false
    }, (err, result) => {
      if (err) return console.log(err)
      //console.log(result)
      console.log('saved to database')
      res.redirect('/profile')
    })
  })

  /* 



  app.put('/favorite', (req, res) => {
    console.log('hey im the id ' ,req.body)
    db.collection('dailyMoods')

    .findOneAndUpdate({
      _id: ObjectId(req.body.id)
    }, {
      $set: {
        favorited: true
      }
    }, {
      sort: {_id: -1},
      upsert: true
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
  })

  */





  app.put('/addStar', (req, res) => {
    console.log(ObjectId(req.body.id))
    console.log('adding star')
    console.log('hey im the id ', req.body)
    db.collection('journalEntries')
      .findOneAndUpdate({
        _id: ObjectId(req.body.postObjectID),
      }, {
        $set: {
          starred: true,
        }
      }, {
        sort: {
          _id: -1
        }, //Sorts documents in db ascending (1) or descending (-1)
        // upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })

  app.put('/removeStar', (req, res) => {
    console.log('removing star')
    db.collection('journalEntries')
      .findOneAndUpdate({
        _id: ObjectId(req.body.postObjectID)
      }, {
        $set: {
          starred: false,
        }
      }, {
        sort: {
          _id: -1
        }, //Sorts documents in db ascending (1) or descending (-1)
        // upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })


  app.delete('/deleteOrder', (req, res) => {
    db.collection('journalEntries').findOneAndDelete({
      _id: ObjectId(req.body.postObjectID)
    }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })

  //Chart Routes ===============================================================

  app.get('/chart', isLoggedIn, function (req, res) {
    db.collection('journalEntries').find().toArray((err, journalEntries) => {
      if (err) return console.log(err)
      console.log('result', journalEntries)
      let stressCount = [0, 0, 0, 0, 0, 0, 0] // sum of stress
      let chartData = [0, 0, 0, 0, 0, 0, 0] // days of the week that take the value of stressLevel
      //update find to filter out/
      // let myWorkLogs = result.filter(doc => doc.name === req.user.local.email)
      // console.log('myWorkLogs', myWorkLogs)
      for (let i = 0; i < journalEntries.length; i++) {
        const d = new Date((new Date(journalEntries[i].date)).getTime() + 12 * 60 * 60 * 1000) //12 hours * 60 mins * 60 secs * 1000 milliseconds <=
        const dayOfWeek = d.getDay()
        chartData[dayOfWeek] += Number(journalEntries[i].stressLevel)
        stressCount[dayOfWeek]++ //increse
      }
      console.log(chartData)
      for (let i = 0; i < chartData.length; i++) {
        if (stressCount[i] > 0) {
          chartData[i] = chartData[i] / stressCount[i]
        }
      }

      console.log(chartData)
      console.log(stressCount)


      res.render('chart.ejs', {
        user: req.user,
        journalEntries: journalEntries,
        chartData: chartData
      })
    })
  });


  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', {
      message: req.flash('loginMessage')
    });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', {
      message: req.flash('signupMessage')
    });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    // successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }), function (req, res) {
    console.log('testing signup', req.body)

    req.user.local.viewerType = req.body.viewerType //set user database to value from ejs
    req.user.save()
    console.log('thhis is the user ', req.user, req.body.viewerType)
    if (req.body.viewerType === 'partner') {
      res.redirect('/partner')
    } else if (req.body.viewerType === 'client') {
      res.redirect('/profile')
    } else {
      res.redirect('/viewers')
    }
  });

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    let user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

};


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}