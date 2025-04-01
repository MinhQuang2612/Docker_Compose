// ./result/server.js
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const socketIo = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static('public'));

// Database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'db',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Get voting results
async function getVotes() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT vote, COUNT(id) AS count FROM votes GROUP BY vote');
    
    // Convert to required format
    const votes = {
      a: 0,
      b: 0
    };
    
    result.rows.forEach((row) => {
      votes[row.vote] = parseInt(row.count);
    });
    
    return votes;
  } catch (err) {
    console.error('Error fetching votes', err);
    return { a: 0, b: 0 };
  } finally {
    client.release();
  }
}

// Socket.io connection
io.on('connection', async (socket) => {
  console.log('Client connected');
  
  // Send data immediately on connection
  socket.emit('results', await getVotes());
  
  // Update every 1 second
  const interval = setInterval(async () => {
    socket.emit('results', await getVotes());
  }, 1000);
  
  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log('Client disconnected');
  });
});

// Start server
server.listen(80, () => {
  console.log('Result service running on port 80');
});