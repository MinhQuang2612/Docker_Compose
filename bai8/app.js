const express = require('express');
const mysql = require('mysql2');
const app = express();

const connection = mysql.createConnection({
  host: 'db',
  user: 'user',
  password: 'password',
  database: 'mydb'
});

// Thử kết nối và tự động thử lại nếu thất bại
function connectWithRetry() {
  console.log('Đang cố gắng kết nối đến MySQL...');
  connection.connect(function(err) {
    if (err) {
      console.error('Kết nối thất bại:', err);
      console.log('Sẽ thử lại sau 5 giây...');
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log('Đã kết nối thành công đến MySQL!');
    }
  });
}

connectWithRetry();

app.get('/', (req, res) => res.send('Connected to MySQL!'));

app.listen(3002, () => console.log('Server running on port 3002'));