var pg = require('pg');

var oidcounter = 1
function initialize(){ //Call this when the website starts up
  pg.connect(process.env.DATABASE_URL, function(err, client, done){
    client.query('CREATE TABLE IF NOT EXIST users (oid INTEGER PRIMARY KEY, fbid INTEGER)', function(err, result){
      done();
      if (err){console.error(err); response.send("Error " + err);}
    });
  });
  pg.connect(process.env.DATABASE_URL, function(err, client, done){
    client.query('CREATE TABLE IF NOT EXIST blacklists (oid INTEGER, fbid INTEGER)', function(err, result){
      done();
      if (err){console.error(err); response.send("Error " + err);}
    });
  });
  pg.connect(process.env.DATABASE_URL, function(err, client, done){
    client.query('SELECT oid FROM users WHERE fbid=-1', function(err, result){ //So fbid -1 is used to store the counter
      done();
      if (err){console.error(err); response.send("Error " + err);}
      else{
        if ( result.rows.length==0 ){
          createCounter();
        }else{
          oidcounter = result.rows[0].oid;
        }
      }
    });
  });
}

function createCounter(){
  pg.connect(process.env.DATABASE_URL, function(err, client, done){
    client.query('INSERT INTO users VALUES (1, -1)', function(err, result){
      done();
      if (err){console.error(err); response.send("Error " + err);}
    });
  });
}

function loadUser(yourUserObject){ //Loads the user's blacklist
  yourFBid = yourUserObject.getFbid(); // TODO rename this to whatever method you use
  pg.connect(process.env.DATABASE_URL, function(err, client, done){
    client.query('SELECT oid FROM users WHERE fbid='+yourFBid, function(err, result){
      done();
      if (err){
        console.error(err); response.send("Error " + err);
      }else{
        if (result.rows.length==0){
          yourUserObject.setOid(oidcounter); // TODO function name, etc
          oidcounter++;
          addUser(yourUserObject);
        }else{
          yourUserObject.setOid(result.rows[0].oid);
          loadBlacklist(yourUserObject);
        }
      }
    });
  });
}

function loadBlacklist(userObject){ 
  pg.connect(process.env.DATABASE_URL, function(err, client, done){
    client.query('SELECT fbid FROM blacklists WHERE oid='+userObject.getOid(), function(err, result){
      done();
      if (err){
        console.error(err); response.send("Error " + err);
      }else{
        //node doesn't support for each in...
        var listLength = result.rows.length;
        for (var i=0; i< listLength; i++){
          yourUserObject.addBlacklist(result.rows[i].fbid); // TODO rename this to whatever the addBlacklist function is
        }
      }
    });
  });
}

function addUser(userObject){
  pg.connect(process.env.DATABASE_URL, function(err, client, done){
    client.query('INSERT INTO users VALUES (' + userObject.getOid() + ', ' + userObject.getFBid() + ')', function(err, result){
      done();
      if (err){
        console.error(err); response.send("Error " + err);
      }
    });
  });
  pg.connect(process.env.DATABASE_URL, function(err, client, done){
    client.query('UPDATE users SET oid=oid+1 WHERE fbid=-1', function(err, result){
      done();
      if (err){
        console.error(err); response.send("Error " + err);
      }
    });
  });
}