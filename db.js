var mysql = require('mysql');
var con = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"password",
    database:"project"
});

con.connect(function(err){
    if(err){
        console.log("throw");
    }

    console.log("connected");
});

module.exports = con;