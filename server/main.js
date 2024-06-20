const { app, BrowserWindow} = require('electron');
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const axios = require('axios');

const path = require('path');
//const { headers } = require('next/headers');

const express = require('express');
const { createClip } = require('./utilities/utilities');
require('dotenv').config();
const electronReload = require('electron-reload')
const port = process.env.PORT || 3000;
function createWindow() {
  const win = new BrowserWindow({
    width: 1800,
    height: 1200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true, // Enable context isolation for additional security
      sandbox: true, // Enable sandbox for additional security
      contentSecurityPolicy: "default-src 'self'; script-src 'self';"
      
    },
  });
  //win.loadFile('./src/app/page.js'); //file://${projectRoot}/src/app/page.js
  win.loadURL(`http://localhost:${port}`);

    // Open the DevTools
    win.webContents.openDevTools()

  
}


nextApp.prepare().then(() => {
  const server = express();
  server.use(express.json());

  server.post('/api/downloadall', async (req, res) => {
    const { clips, videoUrl } = req.body; // Extract the URL from the request body
  console.log("API/DOWNLOADALL POST");
    // console.log(req.body);
    await createClip(videoUrl, clips, true);
    
    //let clip = createClip(videoUrl ,clips)
    
    res.status(201).send('Resource created');
    // Proxy the request to Next.js app
    return handle(req, res);
  });

  server.post('/api/create', async (req, res) => {
    const { clips, videoUrl } = req.body; // Extract the URL from the request body
    console.log("API/CREATE POST");
    // console.log(req.body);
    await createClip(videoUrl, clips, false);
    
    //let clip = createClip(videoUrl ,clips)
    
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

    app.whenReady().then(() => {
      createWindow();  
      app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
      });
    });
    
    app.on('window-all-closed', function () {
      if (process.platform !== 'darwin') app.quit();
    });
  });

  
});

