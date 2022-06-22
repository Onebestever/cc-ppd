
const user = require("./models/user");



//////////////////
module.exports = function (app, passport, db ) {
  require('dotenv').config();
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
  console.log(accountSid, authToken)
  const client = require('twilio')(accountSid, authToken);
  
  const {
    ObjectId
  } = require('mongodb') //gives access to _id in mongodb
  //Collection variable
  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });



  app.get('/whoWeAre', function (req, res) {

      res.render('whoWeAre.ejs')
  });






  // PROFILE SECTION =========================

  app.get('/profile', isLoggedIn, function(req, res) {
    if(req.user.local.viewerType === 'partner'){
      res.redirect('/partner')
    // } else if (req.user.local.viewerType === 'client') {
    //    res.redirect('/client')
    // } else if( req.user.local.viewerType === 'doctor') {
    //    res.redirect('/doctor')
    // } else if (req.user.local.viewerType === 'lovedOne') {
    //    res.redirect('/lovedOne')
    // } 
    // else{
    //   res.redirect('/')
    }
    db.collection('journalEntries').find({postedBy: req.user._id}).toArray((err, result) => {
      // console.log('this is the first',req.user, 
      // 'this is the specific one', req.user._id, 
      // 'this is the whole thing', result, 'this is the post',)

      if (err) return // console.log(err)
      let page 
     if( req.user.local.viewerType === 'partner') {
        page = "partner.ejs"
      } else if (req.user.local.viewerType === 'client') {
        page = "profile.ejs"
      } else if( req.user.local.viewerType === 'doctor') {
        page = "doctors.ejs"
      } else if (req.user.local.viewerType === 'lovedOne') {
        page = "viewers.ejs"
      } 
      res.render(  `${page}`, {
       
        user: req.user,
        'journalEntries': result,
        'toDoList': result

      })
    })
});













app.get('/journalEntries/:ObjectId', isLoggedIn, function(req, res) {
  // console.log('this is objectId',ObjectId)
  const postId = ObjectId(req.params.ObjectId)
  // // console.log('this is req params',req.params)

  db.collection('journalEntries').find({_id: postId}).toArray((err, result) => {
    // // console.log('this is the first',req.user, 
    // 'this is the specificapp. one', req.user._id, 
    // 'this is the whole thing', result, 'this is the post',)

    if (err) return // console.log(err)
    res.render('post.ejs', {
     
      user: req.user,
      'journalEntries': result
    })
  })
});


// app.get('/page/:id', isLoggedIn, function(req, res) {
//   let postId = ObjectId(req.params.id)
//   db.collection('journalEntries').find({postedBy: postId}).toArray((err, result) => {
//     if (err) return // console.log(err)
//     res.render('page.ejs', {
//       'journalEntries': result
//     })
//   })
// });


///////////////POST ACTION/////////////////////////////////
app.post('/log',  (req, res) => {
  let user = ObjectId(req.user._id)
  console.log('HELLOOOOOO ITS ME',req.body)
  db.collection('journalEntries').insertOne({
    dailyPost: req.body.dailyPost,
    date: req.body.date,
    emotion: req.body.emotion,
    stressLevel: req.body.stressLevel,
    harmful: req.body.harmful,
    email: req.body.email,
    note: req.body.note,
    starred: false,
    postedBy: user
  }, (err, result) => {
    if (err) return // console.log(err)
    //// console.log(result)
    // console.log('saved to database')
    res.redirect('/profile')
  })
})
/////////////////////sends messages TWILIO///////////////////////////////////////////////////
app.post('/sendSms',  (req, res) => {
  let phoneNumber = '+16178990622'
  client.messages
  .create({
     body: 'This is a test text',
     from: process.env.TWILIO_PHONE_NUMBER,
     to: phoneNumber
   })
  .then(message => console.log('THISISI THE MESSAGE OBJECT',message));
  
})



  //VIEWERS LOGIN ////////
  app.get('/viewers', isLoggedIn, function (req, res) {
    db.collection('users').find().toArray((err, result) => {
      if (err) return // console.log(err)
      // console.log(result)


      res.render('viewers.ejs', {
        user: req.user,
        'journalEntries': result,

        // allUsers: result
      })
    })
  });


  //viewer PROFILE


  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  //relationshipGET forclient to get to page //////////////////////////////////////
  // db.collection.find({
  //   "user": ObjectId("user_id"),
  //   "relationship": ObjectId("")
  // })



  app.get('/relationship', isLoggedIn, function (req, res) {
    console.log('carla hores', req.user)
    db.collection('users').find({_id:ObjectId(req.user._id)}).toArray((err, result) => {
      if (err) console.log(err)
      console.log('result', result)

      res.render('relationship.ejs', {
        user: req.user,
        relationship: req.user.relationship,
        allUsers: result
      })
    })
  });

  //relationship routes for client to find and display email
  app.put('/searchAddUser', (req, res) => {
    console.log('incoming email', req.body.email)
    console.log('current user email', req.user.local.email)
//req.user is a mongoos object we can directly push into
//if  you want to change anything with user target req.user
  //   req.user.relationship.push(req.body.email)
  //   req.user.save(function(err) {
  //        if (err) return // console.log(err)
  //     // console.log('saved to database')
  //     res.send({status:'ok'});
  // });
    db.collection('users').findOneAndUpdate({
      'local.email': req.user.local.email
    }, {
      $push: {
        'relationship': {
          email: req.body.email,
          isStarred: false
        }
      } //to add to an array 'relationship'
    }, (err, result) => {
      if(err){
        console.log('ERROR',err)
      }
      res.send(result)
    })
  })

  
  app.put('/removeStar', (req, res) => {
    // console.log('removing star')
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




  // partners page Routes ===============================================================
  app.get('/partner', isLoggedIn, async function (req, res) {
    const results = db.collection('toDoList').find().toArray((err, result) => {
      // console.log(req.user)
      if (err) return // console.log(err)
      // console.log(result)


      res.render('partner.ejs', {

        user: req.user,
        toDoList: result
      })
    })
   
  });

  // PROFILE client add to do list SECTION =========================
  
  app.post('/toDoListAdd',  (req, res) => {
    let user = ObjectId(req.user._id)
    console.log('HELLOOOOOO ITS ME',req.body)
    db.collection('toDoList').insertOne({
      chore: req.body.chore,
      date: req.body.date,
      postedBy: user,
      isStarred: false
    }, (err, result) => {
      if (err) return // console.log(err)
      //// console.log(result)
      // console.log('saved to database')
      res.redirect('/profile')
    })
  })
  /////////update todo//////////////

  app.put('/crossedOutToDo',  (req, res) => {
    db.collection('toDoList').findOneAndUpdate({
      _id: ObjectId(req.body.id)
    },
    {$set: {
      isStarred: req.body.isStarred ? false : true
    }}, (err, result) => {
      if (err) return // console.log(err)
      //// console.log(result)
      // console.log('saved to database')
      res.redirect('/profile')
    })
  })
///////////deleteToDo/////////////////////////
  

  // feed Page Routes for allowed  ================================================================

  app.get('/feed', isLoggedIn, async function (req, res) {
    const allUsers = await db.collection('users').find().toArray()
    console.log('THIS IS ALL USERS', allUsers)
    const allowedUsers = allUsers.filter(user=> user.relationship.find(r=>r.email=== req.user.local.email))
    console.log('THIS IS ALLOWED USERS', allowedUsers)
    const allowedEmails = allowedUsers.map(user => user.local.email) // list of all emails ppl given permison to see stuff
    console.log('WE ARE LOOKING FOR YOU',allowedEmails)

    db.collection('journalEntries').find({email:{'$in': allowedEmails}}).toArray((err, result) => {
      console.log(req.user) // ask mongo for all journal entries of ppl who have allowed us to see them 
      if (err) return // console.log(err)
      // console.log('this is the result', result.body)

      res.render('feed.ejs', {

        user: req.user,
        'journalEntries': result,
        // allUsers: allUsers

      })
    })
  });




  // viewers Page Routes ===============================================================


  // app.post('/makePost', (req, res) => {
  //   let user = req.user._id
  //   db.collection('posts').save({caption: req.body.caption, img: 'images/uploads/' + req.file.filename, postedBy: user}, (err, result) => {
  //     if (err) return // console.log(err)
  //     // console.log('saved to database')
  //     res.redirect('/profile')
  //   })
  // })


  /* 



  app.put('/favorite', (req, res) => {
    // console.log('hey im the id ' ,req.body)
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
    // console.log(ObjectId(req.body.id))
    // console.log('adding star')
    // console.log('hey im the id ', req.body)
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
    // console.log('removing star')
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
      if (err) return // console.log(err)
      // console.log('result', journalEntries)
      let stressCount = [0, 0, 0, 0, 0, 0, 0] // sum of stress
      let chartData = [0, 0, 0, 0, 0, 0, 0] // days of the week that take the value of stressLevel
      for (let i = 0; i < journalEntries.length; i++) {
        const d = new Date((new Date(journalEntries[i].date)).getTime() + 12 * 60 * 60 * 1000) //12 hours * 60 mins * 60 secs * 1000 milliseconds <=
        const dayOfWeek = d.getDay()
        chartData[dayOfWeek] += Number(journalEntries[i].stressLevel)
        stressCount[dayOfWeek]++ //increse
      }
      // console.log(chartData)
      for (let i = 0; i < chartData.length; i++) {
        if (stressCount[i] > 0) {
          chartData[i] = chartData[i] / stressCount[i]
        }
      }

      // console.log(chartData)
      // console.log(stressCount)


      res.render('chart.ejs', {
        user: req.user,
        journalEntries: journalEntries,
        chartData: chartData
      })
    })
  });
  ////////////////aADD USER TO RELATIONSHIP/////////////////////////////////////
  app.put('/starStatus', (req, res) => {
    // console.log('this is startStatus',req.body) // how we get to the index
    const index = Number(req.body.indexOfRelationship)
    db.collection('users').find({_id:ObjectId(req.user._id)}).toArray((err, result) => {
      if (err) console.log(err)
      // console.log('userReults', result[0].relationship)
      result[0].relationship[index].isStarred = req.body.isStarred ? false : true //condtional for boolean 
      // console.log('userResults Updated', result[0].relationship)
      db.collection('users').findOneAndUpdate({
        _id: ObjectId(req.user._id)
      },  {
        $set: {
          relationship: result[0].relationship,

        }
      }, {
        sort: {
          _id: -1
        }, //Sorts documents in db ascending (1) or descending (-1)
        // upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.redirect('/relationship')
      })
      
    })
    
  })

  app.put('/deleteRelationship', (req, res) => {
    // console.log('this is startStatus',req.body) // how we get to the index
    const index = Number(req.body.indexOfRelationship)
    db.collection('users').find({_id:ObjectId(req.user._id)}).toArray((err, result) => {
      if (err) console.log(err)
      // console.log('userReults', result[0].relationship)
      result[0].relationship.splice(index, 1) //remove 1 from th index
      // console.log('userResults Updated', result[0].relationship)
      db.collection('users').findOneAndUpdate({
        _id: ObjectId(req.user._id)
      },  {
        $set: {
          relationship: result[0].relationship,
        }
      }, {
        sort: {
          _id: -1
        }, //Sorts documents in db ascending (1) or descending (-1)
        // upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.redirect('/relationship')
      })
      
    })
    
  })

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
    // console.log('testing signup', req.body)

    req.user.local.viewerType = req.body.viewerType //set user database to value from ejs
    req.user.save()
    // console.log('thhis is the user ', req.user, req.body.viewerType)
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





// app.put('/addUser', (req, res) => {
//   // console.log('removing star')
//   db.collection('users').findOneAndUpdate({
//     'local.email': req.user.local.email
//   }, {
//     $set: {
//       starred: true,
//     }
//   }, {
//     sort: {
//       _id: -1
//     }, //Sorts documents in db ascending (1) or descending (-1)
//     // upsert: true
//   }, (err, result) => {
//     if (err) return res.send(err)
//     res.send(result)
//   })
// })





// app.delete('/deleteUser', (req, res) => {
//   db.collection('journalEntries').findOneAndDelete({
//     _id: ObjectId(req.body.postObjectID)
//   }, (err, result) => {
//     if (err) return res.send(500, err)
//     res.send('Message deleted!')
//   })
// })