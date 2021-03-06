var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var dbconfig = require('../database.js');
var conn = mysql.createConnection(dbconfig);
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var options = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '111111',
  database: 'sejongTrack'
};
router.use(session({
  secret: '12sdfwerwersdfserwerwef', //keboard cat (랜덤한 값)
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore(options)
}));
/*
const Speech = require('@google-cloud/speech');
const projectId = 'speech-ddb';
const speechClient = Speech({
  projectId: projectId
});
const fileName = './public/baedal-kr.flac';
const options = {
  //encoding: 'LINEAR16',
  encoding: 'FLAC',
  sampleRateHertz: 16000,
  languageCode: 'ko-KR'
  //anguageCode: 'en-US'
};
*
/* GET home page. */
/*
router.get('/', function(req, res, next) {
  speechClient.recognize(fileName, options)
  .then((results) => {
    const transcription = results[0];
    console.log(`Transcription: ${transcription}`);
  })
  .catch((err) => {
    console.error('ERROR:', err);
  });
  res.render('index', { title: 'Express' });
});
router.use(bodyParser.raw({ type: 'audio/x-flac', limit: '50mb' }));
*/

router.get('/', function(req, res, next) {
  if (req.session.authId) {
    res.render('user-home', {
      title: 'Express',
      user: req.session.authId,
			userName: req.session.authName
    });
  } else {
    res.render('home', {
      title: 'Express'
    });
  }
});

router.post('/', function(req, res, next) {
  console.log(req.body);
  res.send('안녕');
});
router.post('/login', function(req, res, next) {
  var student_id = req.body.id;
  var student_password = req.body.password;
  console.log('id: ' + student_id);
  console.log('password: ' + student_password);

  var sql = "SELECT * FROM student WHERE student_number=?";

  conn.query(sql, [student_id], function(error, results, fields) {
    if (error) {
      console.log(error);
      res.send('fail');
    } else {
      var user = results[0];

      if (student_password == user.password) {
        console.log(user);
        req.session.authName = student_id;
        req.session.authId = user.student_id;
        req.session.save(function() {
          console.log('성공');
        });
        res.send(user);
      } else {
        console.log('fail');
        res.send('fail');
      }
    }
  });
});
router.get('/logout', function(req, res, next) {
  delete req.session.authId;
  delete req.session.authName;
  req.session.save(function() {
    res.redirect('/');
  });
});
router.post('/favorite', function(req, res, next) {
  var track_id = req.body.id;
  var track_name = req.body.name;
  var student_id = req.session.authId;
  //var sql = "INSERT INTO `user` (`name`, `password`) VALUES (?, ?);";
  var sql = "INSERT INTO `favorTrack` (`track_id`, `student_id`) VALUES (?, ?);";
  //var sql = "INSERT INTO `user` (`name`, `password`) VALUES (?, ?);";

  conn.query(sql, [track_id, student_id], function(error, results, fields) {
    if (error) {
      console.log(error);
			//res.send('fail');
    } else {
      console.log('results', results);
			//res.send('success');
    }
  });

});
router.post('/unfavorite', function(req, res, next) {
  var track_id = req.body.id;
  var track_name = req.body.name;
  var student_id = req.session.authId;
  //var sql = "INSERT INTO `user` (`name`, `password`) VALUES (?, ?);";
  var sql = "DELETE FROM `favorTrack` WHERE `track_id`=? AND `student_id`=?;";
  //var sql = "INSERT INTO `user` (`name`, `password`) VALUES (?, ?);";

  conn.query(sql, [track_id, student_id], function(error, results, fields) {
    if (error) {
      console.log(error);
    } else {
      console.log('results', results);
    }
  });

});
module.exports = router;
