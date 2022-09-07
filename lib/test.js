
const configuration = {
    HOST: "us-east.connect.psdb.cloud",
    USERNAME: "nudsnw8jtzllbmgf8mia",
    PASSWORD: "pscale_pw_pBsHqVOS7QYzAbn0TwsQxHNJtOwteelH3GdBRaxAWbX",
    DATABASE: "kinship-main"
}

"pw_pBsHqVOS7QYzAbn0TwsQxHNJ"

function callback(data, data2) {
    console.log(data2)
}
const email = "niglet@gmail.io"
function login(email, password, callback) {
    const mysql = require('mysql');
    const bcrypt = require('bcrypt');
  
    const connection = mysql.createConnection({
      host: configuration.DB_HOST,
      user: configuration.DB_USERNAME,
      password: configuration.DB_PASSWORD,
      database: configuration.DB_NAME
    });
  
    connection.connect();
  
    const query = 'SELECT id, first_name, last_name, email, password FROM users WHERE email = ?';
  
    connection.query(query, [ email ], function(err, results) {
      if (err) return callback(err);
      if (results.length === 0) return callback(new WrongUsernameOrPasswordError(email));
      const user = results[0];
  
      bcrypt.compare(password, user.password, function(err, isValid) {
        if (err || !isValid) return callback(err || new WrongUsernameOrPasswordError(email));
  
        callback(null, {
          user_id: user.id.toString(),
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email
        });
      });
    });
  }

  login()