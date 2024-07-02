require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const dns = require('dns');
const URL = require('url').URL;

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
  const urlRegex = /^(http:\/\/www\.|https:\/\/www\.)\w*\.(com)$/;
  
  if (urlRegex.test(req.body.url)) {
    const newUrl = new URL(req.body.url).hostname;
    dns.lookup(newUrl, (error) => {
      if (error) {
       return res.json({ error: 'Invalid Hostname' });
      }
      else{
      let shortUrl=isSameValuePresent(req.body.url, urlObj)
        if (shortUrl) {
       return res.json({ original_url: req.body.url, short_url: shortUrl });
        
      } else {
        let rand = Math.floor(Math.random() * 100000);
        urlObj.push({
          original_url: req.body.url,
          short_url: rand
        });
        return res.json({ original_url: req.body.url, short_url: rand });
      }
        
      }
    });  
  } 
  else{
    return res.json({ error: 'invalid url' })
  }
  
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const linkNo = parseInt(req.params.short_url);
  // Find the corresponding original_url based on short_url
  const foundObj = urlObj.find(obj => obj.short_url === linkNo);
  if (foundObj) {
     return res.redirect(foundObj.original_url );
  } else {
   return res.json({ error: 'short_url not found' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

function isSameValuePresent(reqUrl, urlObj) {
  const foundObj = urlObj.find(obj => obj.original_url === reqUrl);
  return foundObj ? foundObj.short_url : false;
}
