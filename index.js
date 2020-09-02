// Reference => https://glitch.com/edit/#!/server-side-cache-express?path=server.js%3A51%3A2
const express = require('express');
const fetch = require('node-fetch');
const mcache = require('memory-cache');

const PORT = process.env.PORT || 5000;
// const REDIS_PORT = process.env.PORT || 6379;

// const client = redis.createClient(REDIS_PORT);

const app = express();
// ????
// app.set('view engine', 'jade');


//set response
function setResponse(username, repos) {
    return `<h2>${username} has ${repos} Github</h2>`;
}

// Make request to Github for data
async function getRepos(req, res, next) {
    try {
        console.log('Fetching Data...');

        const { username } = req.params;
        
        const response = await fetch(`https://api.github.com/users/${username}`);

        const data = await response.json();

        const repos = data.public_repos;

        // Set data to memory cache || redis
        mcache.put(username, repos, 3600);
        /*res.send(data);*/
        res.send(setResponse(username, repos));
    } catch (err) {
        console.log(err);
        res.status(500);
    }
}

// Cache middleware
function cache(req, res, next) {
    console.log('middleware caching....');
    const { username } = req.params;

    // cache getBy key then
    /*let key = '__express__' + req.originalUrl || req.url
    let cachedBody = mcache.get(key)
    if (cachedBody) {
      res.send(cachedBody)
      return
    } else {
      res.sendResponse = res.send
      res.send = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body)
      }
      next()
    }*/
    /*mcache.get(username, (err, data) => {
        console.log('1');
        if(err) throw err;
        console.log('2');
        if(data !== null) {
            res.send(setResponse(username, data));
        } else {
            next();
        }
    })*/
    let cachedBody = mcache.get(username);
    if(cachedBody) {
        res.send(setResponse(username, cachedBody));
    } else {
        next();
    }
}

app.get('/repos/:username', cache, getRepos);

app.listen(5000, () => {
    console.log(`App listening on port ${PORT}`);
});