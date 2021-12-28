# Descriptions for the `config.json` entries:
```JSON
{
  "agent": "curl/7.68.0",             // set the user agent, this works well for most sites
  "clean": 10,                        // how often to clean the rate limit cache, in seconds
  "expire": 180,                      // how big the rate limit window is, in seconds
  "limit": 15,                        // global rate limit, accross all router entries
  "failed": 5,                        // how many times a site can fail before we put it on cooldown
  "retry": 86400,                     // how long is the site failure cooldown, in seconds
  "refresh": 60,                      // how often do we refresh our IP with the sites
  "port": 6969,                       // what port should we run on
  "gateway": "10.96.67.1",            // what external IP should be tested for internet connectivity
  "router": {
    "root": {                         // root path (don't change) + rate limit count
      "path": "/",
      "limit": 10
    },
    "health": {
      "path": "/health",              // health path + rate limit
      "limit": 5
    },
    "text": {
      "path": "/text",                // text path + rate limit
      "limit": 3
    },
    "json": {
      "path": "/json",                // json path + rate limit
      "limit": 5
    },
    "ip": {
      "path": "/ip",                  // ip path + rate limit
      "limit": 5
    }
  },
  "services": [                       // what sites should we use, add as many as you want
    "https://ifconfig.co",
    "https://dynamicdns.park-your-domain.com/getip",
    "https://ipinfo.io/ip",
    "https://ifconfig.me",
    "https://api.ipify.org",
    "https://showip.net",
    "https://www.wtfismyip.com/text",
    "https://www.ifconfig.io",
    "https://www.myexternalip.com/raw",
    "https://ip4.top10vpn.com"
  ],
  "startup": 5,                       // how long before we first check our IP on startup
  "tagsep": "-",                      // internal, shouldn't need to change this, see code
  "timeout": 300,                     // how long before we re-use a site after last use
  "ui": {                             // error, debug, and info strings go here
    "expire": "Expiring rate limit: ",
    "gateway": "Remote gateway is down: ",
    "healthy": "Healthy, go away.",
    "hello": "Starting IPdiff v1.0.0!",
    "limit": "Hit rate limit: ",
    "nobueno": "Failed to access: ",
    "norefresh": "Failed to refresh our IP with: ",
    "nosite": "Failed to select a site to refresh our IP.",
    "request": {
      "health": "Incoming health request from: ",
      "health2": "Incoming full health request from: ",
      "text": "Incoming text request from: ",
      "json": "Incoming json request from: ",
      "ip": "Incoming ip request from : "
    },
    "site": "Refresh selecting: ",
    "sitesep": " of ",
    "startup": "Listening on port: ",
    "textsep": "<BR><BR>",
    "them": "Your IP: ",
    "update": "New IP for us: ",
    "us": "My IP: "
  }
}
```