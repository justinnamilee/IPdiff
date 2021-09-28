import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';



// **********
// * Globals.

let us = ''; // ? storage for our IP
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
const lut = {};
const err = {};
const app = express();

// ? pre-load our targets last-hit time into the lut
for (const s of config.services) {
  lut[s] = Date.now() - (config.timeout * 1000);
  err[s] = Date.now() - (config.retry * 1000);
}



// ********************
// * Some shenannigans.

function getIP(r) {
  // ? get IP and chop off ::ffff: from IPv4 addresses
  return (r.headers['x-forwarded-for'] || r.ip).replace('::ffff:', '');
}

function qShuffle(a) {
  // ? ask me no questions, I will tell you no lies
  return a.map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

async function refreshMyIP() {
  // ? every refresh period, select a random(ish) site, see if our IP is new
  let site = undefined;

  for (const s of qShuffle(config.services)) {
    if ((err[s] + (config.retry * 1000)) < Date.now() && (lut[s] + (config.timeout * 1000)) < Date.now()) {
      site = s;
      break;
    }
  }

  if (typeof site !== 'undefined') {
    const res = await fetch(site, { 'headers': { 'User-Agent': config.agent } });

    // ! console.debug(config.ui.site + site);
    lut[site] = Date.now();

    if (res.status === 200) {
      const txt = await res.text();
      const newUs = txt.replace(/[^\u0020-\u007E]/g, '');

      if (us !== newUs) {
        us = newUs;

        console.log(config.ui.site + site);
        console.log(config.ui.update + us);
      }
    } else {
      err[site] = Date.now();
      console.error(config.ui.norefresh + site);
    }
  } else {
    console.error(config.ui.nosite);
  }
}



// **********************************
// * Express router entries and such.

app.get('/', (req, res) => {
  // ? send as little back as possible on a root request
  const them = getIP(req);
  console.log(config.ui.request.health + them);

  res.send(config.ui.healthy);
});

app.get('/health', (req, res) => {
  // ? send some real health information back
  const them = getIP(req);
  console.log(config.ui.request.health2 + them);

  let count = 0;

  for (const s of config.services) {
    if ((err[s] + (config.retry * 1000)) < Date.now()) {
      count++;
    }
  }

  res.json({
    'available': count,
    'total': config.services.length,
    'me': us,
    'you': them,
    'last': Math.max(...Object.keys(lut).map((k) => lut[k]))
  });
});

app.get('/text', (req, res) => {
  // ? crappy html response
  const them = getIP(req);
  console.log(config.ui.request.text + them);

  res.send(config.ui.us + us + config.ui.textsep + config.ui.them + them);
});

app.get('/json', (req, res) => {
  // ? cool json response
  const them = getIP(req);
  console.log(config.ui.request.json + them);

  res.json({ 'me': us, 'you': them });
});

app.listen(config.port, () => {
  console.log(config.ui.startup + config.port);
});



// **************************
// * Interval and start call.

setInterval(refreshMyIP, (config.refresh * 1000));
setTimeout(refreshMyIP, (config.startup * 1000));
