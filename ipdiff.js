import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';



// **********
// * Globals.

let us = '';
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
const lut = {};
const app = express();

// ? pre-load our targets last-hit time into the lut
for (const s of config.services) {
  lut[s] = Date.now() - (config.timeout * 1000);
}



// **********************************
// * Express router entries and such.

app.get('/', (req, res) => {
  const them = req.headers['x-forwarded-for'] || req.ip;
  console.log(config.ui.request.health + them);

  res.send(config.ui.healthy);
});

app.get('/text', (req, res) => {
  const them = req.headers['x-forwarded-for'] || req.ip;
  console.log(config.ui.request.text + them);

  res.send(`${config.ui.us}${us}<BR><BR>${config.ui.them}${them}`);
});

app.get('/json', (req, res) => {
  const them = req.headers['x-forwarded-for'] || req.ip;
  console.log(config.ui.request.json + them);

  res.json({'me': us, 'you': them});
});

app.listen(config.port, () => {
  console.log(config.ui.startup + config.port);
});



// *********************
// * Other shenannigans.

function qShuffle(a) {
  return a.map((value) => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value)
}

async function refreshMyIP() {
  let site = undefined;

  for (const s of qShuffle(config.services)) {
    if ((lut[s] + (config.timeout * 1000)) < Date.now()) {
      site = s;
      lut[s] = Date.now();

      // ! console.debug(config.ui.site + s);

      break;
    }
  }

  if (typeof site !== 'undefined') {
    const res = await fetch(site, {'headers': {'User-Agent': 'curl/7.68.0'}});
    const txt = await res.text();
    const newUs = txt.replace(/[^\u0020-\u007E]/g, '');

    // TODO: add check for non-200 return

    if (us !== newUs) {
      us = newUs;
      console.log(config.ui.update + us);
    }
  } else {
    console.error(config.ui.norefresh);
  }
}



// ****************************
// * Intervals and start calls.

setInterval(refreshMyIP, (config.refresh * 1000));
setTimeout(refreshMyIP, (config.startup * 1000));
