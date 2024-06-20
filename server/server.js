const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const axios = require('axios');
//const { headers } = require('next/headers');

const express = require('express');
const { createClip } = require('./utilities/utilities');
require('dotenv').config();
const port = process.env.PORT || 3000;
nextApp.prepare().then(() => {
  const server = express();
  server.use(express.json());


  server.post('/api/create', async (req, res) => {
    const { clips, videoUrl } = req.body; // Extract the URL from the request body
    console.log("API/CREATE");
    //console.log(req.body);

    //console.log(clips);
    //let clip = createClip(videoUrl, clips)
    
    res.status(201).send('Resource created');
    // Proxy the request to Next.js app
    return handle(req, res);
  });

  server.get('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});

/*// Enable CORS for all routes
  server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', `http://localhost`);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  server.post('/api/create', async (req, res) => {
    const { url } = req.body; // Extract the URL from the request body
    console.log(url);
    const response = await axios.get(url);
    console.log(response.data);
    //res.send(response.data);
      // Proxy the request to Next.js app
    return handle(req, res);
  });

 

  server.all('*', (req, res) => {
    console.log("all");
    return handle(req, res);
  });*/