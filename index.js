require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


let urlAndShorts = []; 

app.post("/api/shorturl", (req, res) => {
  const { url } = req.body; 
  
  try {
    const baseUrl = new URL(url);

    if (!['http:', 'https:'].includes(baseUrl.protocol)) {
      return res.json({ error: 'invalid url' });
    }
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  const { hostname } = new URL(url);
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      const urltoLower = url.toLowerCase();
      const isUrlAlreadyExisted = urlAndShorts.find(item => 
        item.original_url.toLowerCase() === urltoLower
      );

      if(isUrlAlreadyExisted) {
        return res.json({
          original_url: isUrlAlreadyExisted.original_url,
          short_url: isUrlAlreadyExisted.short_url
        });
      } else {
        const short_url = urlAndShorts.length + 1; 
        const newShortUrl = { original_url: url, short_url };
        urlAndShorts.push(newShortUrl);
        return res.json(newShortUrl);
      }
    }
  });
});


app.get("/api/shorturl/:short_url", (req, res) => {

  const short_url = parseInt(req.params.short_url); 

  const isExist = urlAndShorts.find(item => item.short_url === short_url); 

  if (isExist) {
    return res.redirect(isExist.original_url); 

  } else {
    return res.json({ error: 'invalid url' }); 
  }
  
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
