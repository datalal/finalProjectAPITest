var express = require('express');
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser');
var password = require('./password.js');

var connectionString = 'postgres://opxeceunrpgebk:'+password+'@ec2-54-83-25-217.compute-1.amazonaws.com:5432/d4v5g9dp5h91jc?ssl=true';
console.log(connectionString);
var client = new pg.Client(connectionString);

var config = {
  user: 'opxeceunrpgebk', database: 'd4v5g9dp5h91jc', password: password, host: 'ec2-54-83-25-217.compute-1.amazonaws.com',
  port: 5432, max: 100, idleTimeoutMillis: 30000
};

var pool = new pg.Pool(config);

app.use(bodyParser.json({ extended: true }));
app.use(express.static(__dirname + '/public'));

pg.connect(connectionString, function(err, client, done){
 var results = [];
 var query = client.query('SELECT * FROM privy');
 query.on('row', function(row){
   results.push(row);
 });

 query.on('end', function(){
  //  console.log(results);
   client.end();
   return results;
 });

});

app.get('/locationreview', function(req, res, next){
 var results = [];
 pg.connect(connectionString, function(err, client, done) {

   var query = client.query('SELECT * FROM privy ORDER BY rating');

   query.on('row', function(row){
     results.push(row);
   });

   query.on('end', function(){
    //  console.log(results);
     client.end();
     return res.json(results);
   });

 });
});


app.post('/addreview', function(req, res, next){

 var results = [];
 var review = {
   rating: req.body.rating,
   type: req.body.type,
   address: req.body.address,
   comment: req.body.comment,
   family: req.body.family
 };

 pg.connect(connectionString, function(err, client, done) {

    client.query('INSERT INTO privy(rating, type, address, comment, family) values($1, $2, $3, $4, $5)', [review.rating, review.type, review.address, review.comment, review.family]);
    var query = client.query('SELECT * FROM privy ORDER BY rating');

   query.on('row', function(row){
     results.push(row);
   });

   query.on('end', function(){
    //  console.log(results);
     client.end();
     return res.json(results);
   });

 });

});


// app.put('/edit-review/:id', function(req, res, next){
//
//   var results = [];
//   var id = req.params.id;
//   var review = {
//     review: req.body.rating
//   };
//
//   pg.connect(connectionString, function(err, client, done) {
//
//     client.query('UPDATE privy SET product=($1) WHERE id=($2)', [review.rating, id]);
//     var query = client.query('SELECT * FROM privy ORDER BY id');
//
//     query.on('row', function(row){
//       results.push(row);
//     });
//
//     query.on('end', function(){
//       console.log(results);
//       client.end();
//       return res.json(results);
//     });
//   });
// });

// app.delete('/delete-review/:id', function(req, res, next){
//
//   var results = [];
//   var id = req.params.id;
//
//   pg.connect(connectionString, function(err, client, done) {
//
//
//     client.query('DELETE FROM privy WHERE id=($1)', [id]);
//     var query = client.query('SELECT * FROM privy ORDER BY id');
//
//     query.on('row', function(row){
//       results.push(row);
//     });
//
//     query.on('end', function(){
//       console.log(results);
//       client.end();
//       return res.json(results);
//     });
//
//   });
//
// });


var server = app.listen(3000, function() {
 var port = server.address().port;
 console.log('PostgreSQL server running at http://localhost:%s', port);
});
