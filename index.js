require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const dns = require('dns');
const { URL } = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let urlObj = [];

app.post('/api/shorturl', function(req, res) {
  console.log('Received URL:', req.body.url);  // Log received URL

  const urlRegex = /^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  
  if (urlRegex.test(req.body.url)) {
    let newUrl;
    try {
      newUrl = new URL(req.body.url).hostname;
    } catch (e) {
      return res.json({ error: 'invalid url' });
    }
    console.log('Hostname:', newUrl);  // Log hostname

    dns.lookup(newUrl, (error) => {
      if (error) {
        console.error('DNS Lookup Error:', error);  // Log DNS lookup error
        return res.json({ error: 'Invalid Hostname' });
      } else {
        let shortUrl = findOriginalUrl(req.body.url, urlObj);
        if (shortUrl) {
          return res.json({ original_url: req.body.url, short_url: shortUrl });
        } else {
          let rand = urlObj.length + 1; // Simple increment instead of random
          urlObj.push({
            original_url: req.body.url,
            short_url: rand
          });
          console.log('URL Object:', urlObj);  // Log URL object array
          return res.json({ original_url: req.body.url, short_url: rand });
        }
      }
    });  
  } else {
    console.error('Invalid URL:', req.body.url);  // Log invalid URL
    return res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const linkNo = parseInt(req.params.short_url);
  console.log('Received short_url:', linkNo);  // Log received short_url

  const foundObj = findShortUrl(linkNo, urlObj);
  if (foundObj) {
    return res.redirect(foundObj.original_url);
  } else {
    console.error('short_url not found:', linkNo);  // Log short_url not found
    return res.json({ error: 'short_url not found' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

function findOriginalUrl(reqUrl, urlObj) {
  const foundObj = urlObj.find(obj => obj.original_url === reqUrl);
  return foundObj ? foundObj.short_url : false;
}

function findShortUrl(shortUrl, urlObj) {
  const foundObj = urlObj.find(obj => obj.short_url === shortUrl);
  return foundObj ? foundObj : false;
}
