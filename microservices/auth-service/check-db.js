const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'vendor_db'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to vendor_db:', err);
    process.exit(1);
  }
  
  console.log('Connected to vendor_db');
  
  // Show tables
  connection.query('SHOW TABLES', (err, tables) => {
    if (err) throw err;
    console.log('Tables in vendor_db:', JSON.stringify(tables));
    
    // Describe vendors
    connection.query('DESCRIBE vendors', (err, columns) => {
      if (err) throw err;
      console.log('vendors columns:', JSON.stringify(columns));
      
      // Describe services
      connection.query('DESCRIBE services', (err, columns) => {
        if (err) throw err;
        console.log('services columns:', JSON.stringify(columns));
        
        // Let's connect to auth_db too
        const authConn = mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: '',
          database: 'auth_db'
        });
        
        authConn.connect(err => {
          if (err) {
            console.error('Error connecting to auth_db:', err);
            connection.end();
            process.exit(1);
          }
          console.log('Connected to auth_db');
          
          authConn.query('SHOW TABLES', (err, tables) => {
            if (err) throw err;
            console.log('Tables in auth_db:', JSON.stringify(tables));
            
            authConn.query('DESCRIBE users', (err, columns) => {
              if (err) throw err;
              console.log('users columns:', JSON.stringify(columns));
              
              // Let's see some sample users
              authConn.query('SELECT * FROM users', (err, rows) => {
                if (err) throw err;
                console.log('users data:', JSON.stringify(rows));
                
                // Let's see some sample vendors
                connection.query('SELECT * FROM vendors', (err, vrows) => {
                  if (err) throw err;
                  console.log('vendors data:', JSON.stringify(vrows));
                  
                  connection.end();
                  authConn.end();
                });
              });
            });
          });
        });
      });
    });
  });
});
