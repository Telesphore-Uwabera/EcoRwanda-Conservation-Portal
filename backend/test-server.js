console.log('RAILWAY TEST SERVER DEBUG: Starting up. Process environment:', process.env);
const express = require('express');
const app = express();

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Test server is running! PORT: ' + PORT + ' MONGODB_URI: ' + process.env.MONGODB_URI);
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
}); 