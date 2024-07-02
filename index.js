require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let urlObj = [];

app.post('/api/shorturl', function(req, res) {
  const urlRegex = /^(https?:\/\/)(www\.)?/;

  if (urlRegex.test(req.body.url)) {
    let newUrl;
    try {
      newUrl = new URL(req.body.url).hostname;
    } catch (e) {
      return res.json({ error: 'invalid url' });
    }
    console.log("This is the value of new URL", newUrl);

    dns.lookup(newUrl, (error) => {
      if (error) {
        return res.json({ error: 'Invalid Hostname' });
      } else {
        const foundObj = urlObj.find(obj => obj.original_url === req.body.url);
        if (foundObj) {
          return res.json({ original_url: req.body.url, short_url: foundObj.short_url });
        } else {
          let rand = urlObj.length + 1;
          urlObj.push({
            original_url: req.body.url,
            short_url: rand
          });
          return res.json({ original_url: req.body.url, short_url: rand });
        }
      }
    });
  } else {
    return res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const linkNo = parseInt(req.params.short_url);

  const foundObj = urlObj.find(obj => obj.short_url === linkNo);
  if (foundObj) {
    return res.redirect(foundObj.original_url);
  } else {
    return res.json({ error: 'short_url not found' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
