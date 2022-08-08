import config from './config.json'

const getQuizQuestion = async () => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/quiz/win`, {
        method: 'GET',
    })
    return res.json()
}

/**
 * Calls title API
 * @param {String} id title_id
 * @returns JSON object with information on title searched
 */
const titleFetch = async (id) => {
    if(id.length == 0) return;

    var res = await fetch(`http://${config.server_host}:${config.server_port}/title?id=${id}`, {
        method: `GET`,
    });

    return res.json();
}

/**
 * Calls cast API
 * @param {String} id cast_id
 * @returns JSON object with information on cast searched
 */
const castFetch = async (id) => {
    if(id.length == 0) return;

    var res = await fetch(`http://${config.server_host}:${config.server_port}/cast?id=${id}`, {
        method: `GET`,
    });

    return res.json();
}

/**
 * Calls the recommend API
 * @param {Array} titles list of title_id (up to five will be used in query)
 * @param {Array} casts list of cast_id (up to five will be used in query)
 * @param {number} ratingLow low end (inclusive) of rating for return titles
 * @param {number} ratingHigh high end (inclusive) of rating for return titles
 * @param {int} runtimeLow low end (inclusive) of runtime for return titles
 * @param {int} runtimeHigh high end (inclusive) of runtime for return titles
 * @returns the title_id of the top 10 recommended titles based on inputs
 */
const recommendFetch = async (titles, casts, ratingLow = -1, ratingHigh = -1, runtimeLow = -1, runtimeHigh = -1) => {
    if(titles.length == 0 && casts.length == 0) return;

    // set initial url string
    var urlString = `http://${config.server_host}:${config.server_port}/recommend?`;

    // add titles
    var titleNum = 1;
    titles.forEach(function(title) {
        if(urlString.slice(-1) == '?') {
            urlString += `title${titleNum}=${title}`;
            titleNum++;
        } else {
            urlString += `&title${titleNum}=${title}`;
            titleNum++;
        }
    });

    // add casts
    var castNum = 1;
    casts.forEach(function(cast) {
        if(urlString.slice(-1) == '?') {
            urlString += `cast${castNum}=${cast}`;
            castNum++;
        } else {
            urlString += `&cast${castNum}=${cast}`;
            castNum++;
        }
    });

    // add rating parameters (if needed)
    if(ratingLow != -1) urlString += `&rating_low=${ratingLow}`;
    if(ratingHigh != -1) urlString += `&rating_high=${ratingHigh}`;
    
    // add runtime parameters (if needed)
    if(runtimeLow != -1) urlString += `&runtime_low=${runtimeLow}`;
    if(runtimeHigh != -1) urlString += `&runtime_high=${runtimeHigh}`;

    console.log("recommend url: " + urlString);
    
    // run fetch
    var res = await fetch(urlString, {
        method: 'GET',
    });
    return res.json();
}

export {
    getQuizQuestion,
    recommendFetch,
    titleFetch,
    castFetch
}