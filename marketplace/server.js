const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

const marketplaceDir = path.resolve('./marketplace');

app.use(express.static(marketplaceDir));

app.listen(PORT, () => {
  console.log('Frontend server running at http://localhost:' + PORT);
});
