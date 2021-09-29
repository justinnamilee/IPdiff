# IPdiff~!
Who are you and who am I?

## What does it do?
Returns the public IP address of this server and of the requester.

## Why?
Useful for monitoring boxes connected to VPNs for internet IP redirection.

## How to!

### Install:
```
$ git clone https://github.com/justinnamilee/IPdiff.git
$ cd IPdiff
$ npm install
```

### Run:
```
$ node ipdiff.js
```

### Usage:
```
$ curl http://your-application-host.local:6969/json
```

## Available Services!

```
/
```
- Provides a basic health line to let you know it's working.


```
/health
```
- Returns a full json health status.


```
/text
```
- Returns the service's external IP and the requester's IP in text/html format (for some reason).


```
/json
```
- Returns the service's external IP and the requester's IP in json format.


```
/ip
```
- Returns the requester's IP only, like a good IP lookup service would in text/plain format.


## Traps For Young Players?

Make sure you enable the `x-forwarded-for` header if you are running behind a reverse proxy.