[![License](https://img.shields.io/github/license/justinnamilee/IPdiff)](LICENSE)
![Node](https://img.shields.io/badge/Node.js-18.17.1-339933)

# IPdiff

> Compare your server’s public IP with each incoming request (diff), in multiple formats... Or Just send back the incoming IP.

---

## Table of Contents

* [Features](#features)
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Configuration](#configuration)
  * [Example `config.json`](#example-configjson)
  * [Key Reference](#key-reference)
  * [Router Settings](#router-settings)
* [Usage](#usage)
* [Endpoints](#endpoints)
* [Examples](#examples)
* [Contributing](#contributing)
* [License](#license)

---

## Features

* 📦 **Minimal dependencies** (just Node.js, `Express`, and `node-fetch`)
* 🔄 Multiple output formats: JSON, HTML/text, or plain-text
* 🚦 Built-in rate limiting per endpoint
* 🛡️ Health check with full JSON status
* 🔁 Configurable external IP services & intervals

---

## Prerequisites

* Node.js ≥ 12.x, probably?
* npm ≥ 6.x, also probably?

---

## Installation

```bash

git clone https://github.com/justinnamilee/IPdiff.git
cd IPdiff
npm install
```

---

## Configuration

### Example `config.json`

```jsonc

{
  "agent":   "curl/7.68.0",       // User-Agent for external queries
  "clean":   10,                  // Rate-limit cache clean interval (s)
  "expire":  180,                 // Rate-limit window size (s)
  "limit":   15,                  // Global max requests per window
  "failed":  5,                   // Max failures before cooldown
  "retry":   86400,               // Failure cooldown duration (s)
  "refresh": 60,                  // IP refresh interval (s)
  "port":    6969,                // HTTP server port
  "gateway": "1.0.0.1",           // IP used to verify connectivity
  "router": {                     // See below for router section
    "root":   { "path": "/",       "limit": 10 },
    "health": { "path": "/health", "limit":  5 },
    "text":   { "path": "/text",   "limit":  3 },
    "json":   { "path": "/json",   "limit":  5 },
    "ip":     { "path": "/ip",     "limit":  5 }
  },
  "services": [                   // Sites we hit to get our own IP
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
  "startup": 5,                   // Delay before first IP check (s)
  "tagsep":  "-",                 // Internal tag separator
  "timeout": 300,                 // Site reuse cooldown (s)
  "ui": {
    "expire":    "Expiring rate limit: ",
    "gateway":   "Remote gateway is down: ",
    "healthy":   "Healthy, go away.",
    "hello":     "Starting IPdiff...",
    "limit":     "Hit rate limit: ",
    "nobueno":   "Failed to access: ",
    "norefresh": "Failed to refresh our IP with: ",
    "nosite":    "Failed to select a site to refresh our IP.",
    "request": {
      "health":  "Incoming health request from: ",
      "health2": "Incoming full health request from: ",
      "text":    "Incoming text request from: ",
      "json":    "Incoming json request from: ",
      "ip":      "Incoming ip request from: "
    },
    "site":      "Refresh selecting: ",
    "sitesep":   " of ",
    "startup":   "Listening on port: ",
    "textsep":   "\n",
    "them":      "Your IP: ",
    "update":    "New IP for us: ",
    "us":        "My IP: "
  }
}
```

#### Key Reference

| Key       | Type   | Default       | Description                                            |
| --------- | ------ | ------------- | ------------------------------------------------------ |
| `agent`   | String | `curl/7.68.0` | User-Agent header for external IP services.            |
| `clean`   | Number | `10`          | Interval to clean rate-limit cache (seconds).          |
| `expire`  | Number | `180`         | Rate-limit window duration (seconds).                  |
| `limit`   | Number | `15`          | Global max requests per window.                        |
| `failed`  | Number | `5`           | Failures allowed per service before cooldown.          |
| `retry`   | Number | `86400`       | Cooldown after failures (seconds).                     |
| `refresh` | Number | `60`          | Interval between IP refreshes (seconds).               |
| `port`    | Number | `6969`        | HTTP server listening port.                            |
| `gateway` | String | `1.0.0.1`     | IP used to verify outbound connectivity.               |
| `startup` | Number | `5`           | Delay before first IP check on startup (seconds).      |
| `tagsep`  | String | `-`           | Internal tag separator, really don't worry about this. |
| `timeout` | Number | `300`         | Site reuse cooldown after last use (seconds).          |

#### Router Settings

| Name     | Path      | Limit |
| -------- | --------- | ----- |
| `root`   | `/`       | 10    |
| `health` | `/health` | 5     |
| `text`   | `/text`   | 3     |
| `json`   | `/json`   | 5     |
| `ip`     | `/ip`     | 5     |

> Note: The *Limit* is the rate-limit for that endpoint.

---

## Usage

```bash

node ipdiff.js
```

By default, it binds to the port in your `config.json`.
> **Ensure `X-Forwarded-For` is enabled if you’re behind a reverse proxy.**

---

## Endpoints

| Endpoint  | Description                                           | Format             |
| --------- | ----------------------------------------------------- | ------------------ |
| `/`       | Simple health check (200 OK)                          | `text/plain`       |
| `/health` | Full JSON status (rate limits, last IP, uptime, etc.) | `application/json` |
| `/text`   | Server IP & client IP in HTML/text                    | `text/html`        |
| `/json`   | Server IP & client IP as JSON                         | `application/json` |
| `/ip`     | Client IP only                                        | `text/plain`       |

---

## Examples

```bash

curl http://localhost:6969/json
```

```json

{
  "me": "203.0.113.42",
  "you": "198.51.100.24"
}
```

---

## Contributing

1. Probably just open an issue or something.
2. ???
3. Profit.

---

## License

GPLv3 © [justinnamilee](https://github.com/justinnamilee)
