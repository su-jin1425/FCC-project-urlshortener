require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();
const urlparser = require('url');
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
const urlDatabase = {};
let shortUrlId = 1;
app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;
  try {
    const urlObject = new URL(url);
    if (!urlObject.protocol.includes('http')) {
      return res.json({ error: 'invalid url' });
    }
    dns.lookup(urlObject.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }
      urlDatabase[shortUrlId] = url;
      res.json({
        original_url: url,
        short_url: shortUrlId
      });
      shortUrlId++;
    });
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
});
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];
  
  if (!originalUrl) {
    return res.json({ error: 'No short URL found for the given input' });
  }
  res.redirect(originalUrl);
});
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});