# LDApp based BoomerangJS server

LDApp based bundle to host BoomerangJS applications, scheduler, browser based client and example application.

## Quick Start Guide

### Install using npm

- install using npm `npm install boomerang-server`
- change folder `cd node_modules/boomerang-server`
- start boomerang-server using npm `npm start` or node `node ldapp.js`

### Install from sources

- clone git repository `git clone https://github.com/zazukoians/boomerang-server.git`
- change to LDApp folder `cd boomerang-server`
- install dependencies using npm `npm install`
- start boomerang-server using npm `npm start` or node `node ldapp.js`

### Browser Client

Now you can start the browser based client with the following URL:

[https://localhost:8443/client/](https://localhost:8443/client/)

Wait till the status of tasks changed to finished and reload the page.
Repeat these steps until no more tasks appear in the list.


### Node Client

You can also use the node client to run the tasks:

- change to the BoomerangJS client `cd node_modules/boomerang-client`
- start the node client with the schedule url as parameter
	`node node-client.js https://localhost:8443/apps/pi/data/schedule`