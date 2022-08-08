const express = require('express');
const mysql = require('mysql');
var cors = require('cors')


const routes = require('./routes')
const config = require('./config.json')

const app = express();

// whitelist localhost 3000
app.use(cors({ credentials: true, origin: ['http://localhost:3000'] }));

// ********************************************
//            MOVIES OSCARS APIs
// ********************************************

// get data for single title using title_id
app.get('/title', routes.title);

// get data for all cast in single title
app.get('/title_casts', routes.title_casts);

// get data for single cast using cast_id
app.get('/cast', routes.cast);

// get data for all titles a cast has appeared
app.get('/cast_titles', routes.cast_titles);

// get list of recommended movies based on user input
app.get("/recommend", routes.recommend);

// get results from user's search parameters for titles
app.get("/search/title", routes.search_title);

// get results from user's search parameters for cast
app.get("/search/cast", routes.search_cast);

// get answer options for random quiz question
app.get("/quiz/win", routes.quiz_win);

// FOR HOME PAGE (Part 1) -- To get the winning movies of each year
app.get("/getOscarWinningMovies", routes.getOscarWinningMovies);

// FOR HOME PAGE (Part 2) -- Get maximum winner for each category
app.get("/getMaxWinner", routes.getMaxWinner);


app.listen(config.server_port, () => {
    console.log(`Server running at http://${config.server_host}:${config.server_port}/`);
});

module.exports = app;
