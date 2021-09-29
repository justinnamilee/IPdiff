import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';



// **********
// * Globals.

let us = ''; // ? storage for our IP

const app = express();
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
console.log(config.ui.hello);

const lut = {}; // ? last update time
const err = {}; // ? errors and such
const url = {}; // ? user rate limit

// ? pre-load our targets last-hit time into the lut
for (const s of config.services) {
  lut[s] = Date.now() - (config.timeout * 1000);
  err[s] = Date.now() - (config.retry * 1000);
}



// ********************
// * Some shenannigans.

function applyRateLimit(u, l) {
  const tag = u + config.tagsep + l;
  const t = Date.now();
  let limit = false;

  // ? check endpoint, then global rate limits
  for (const item of [[tag, config.router[l].limit], [u, config.limit]]) {
    const i = item[0];
    const j = item[1];

    if (i in url) {
      url[i].push(t);

      if (url[i].length > j) {
        // ? keep limit lists fixed length
        url[i].splice(0, url[i].length - j);

        console.log(config.ui.limit + i);
        limit = true;
      }
    } else {
      url[i] = [t];
    }
  }

  return limit;
}

function cleanRateLimit() {
  const t = Date.now();

  for (const tag in url) {
    let i = url[tag].length;

    while (i--) {
      if (url[tag][i] + (config.expire * 1000) < t) {
        url[tag].splice(i, 1);
      }
    }

    if (url[tag].length === 0) {
      delete url[tag];
    }
  }
}

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
  const t = Date.now();
  let site = undefined;

  for (const s of qShuffle(config.services)) {
    if ((err[s] + (config.retry * 1000)) < t && (lut[s] + (config.timeout * 1000)) < t) {
      site = s;
      break;
    }
  }

  if (typeof site !== 'undefined') {
    try {
      const res = await fetch(site, { 'headers': { 'User-Agent': config.agent } });

      // ! console.debug(config.ui.site + site);
      lut[site] = t;

      if (res.status === 200) {
        const txt = await res.text();
        const newUs = txt.replace(/[^\u0020-\u007E]/g, '');

        if (us !== newUs) {
          us = newUs;

          console.log(config.ui.site + site);
          console.log(config.ui.update + us);
        }
      } else {
        err[site] = t;
        console.log(config.ui.norefresh + site);
      }
    } catch (e) {
      err[site] = t;
      console.log(config.ui.norefresh + site);

      throw e;
    }
  } else {
    console.log(config.ui.nosite);
  }
}



// **********************************
// * Express router entries and such.

app.get(config.router.root.path, (req, res) => {
  // ? send as little back as possible on a root request
  const them = getIP(req);

  if (applyRateLimit(them, "root")) {
    res.sendStatus(429);
  } else {
    console.log(config.ui.request.health + them);
    res.send(config.ui.healthy);
  }
});

app.get(config.router.health.path, (req, res) => {
  // ? send some real health information back
  const them = getIP(req);

  if (applyRateLimit(them, "health")) {
    res.sendStatus(429);
  } else {
    console.log(config.ui.request.health2 + them);

    const t = Date.now();
    let count = 0;

    for (const s of config.services) {
      if ((err[s] + (config.retry * 1000)) < t) {
        count++;
      }
    }

    res.json({
      'available': count,
      'total': config.services.length,
      'me': us,
      'you': them,
      'last': Math.max(...Object.keys(lut).map((k) => lut[k])),
      'epoch': t
    });
  }
});

app.get(config.router.text.path, (req, res) => {
  // ? crappy html response
  const them = getIP(req);

  if (applyRateLimit(them, "text")) {
    res.sendStatus(429);
  } else {
    console.log(config.ui.request.text + them);
    res.send(config.ui.us + us + config.ui.textsep + config.ui.them + them);
  }
});

app.get(config.router.json.path, (req, res) => {
  // ? cool json response
  const them = getIP(req);

  if (applyRateLimit(them, "json")) {
    res.sendStatus(429);
  } else {
    console.log(config.ui.request.json + them);
    res.json({ 'me': us, 'you': them });
  }
});

app.listen(config.port, () => {
  console.log(config.ui.startup + config.port);
});



// **************************
// * Interval and start call.

setInterval(cleanRateLimit, (config.clean * 1000));

setInterval(refreshMyIP, (config.refresh * 1000));
setTimeout(refreshMyIP, (config.startup * 1000));
