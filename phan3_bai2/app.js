const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Kết nối với MongoDB
mongoose.connect('mongodb://mongodb:27017/nodeapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Đã kết nối với MongoDB'))
  .catch(err => console.error('Không thể kết nối với MongoDB:', err));

// Định nghĩa Schema
const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', itemSchema);

app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Chào mừng đến với Node.js API!');
});

// Lấy tất cả các items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tạo item mới
app.post('/api/items', async (req, res) => {
  const item = new Item({
    name: req.body.name,
    description: req.body.description
  });

  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Ứng dụng đang chạy tại http://localhost:${port}`);
});