const config = require('./config.json')
const mysql = require('mysql');
const e = require('express');

const imdb_url = "https://www.imdb.com";
const runtime_max = 10000;
const runtime_min = 0;
const rating_max = 10;
const rating_min = 0;

// score weighting of each category for recommendation
const genre_score = 1; // 3x this point is max score because each title has max 3 genres
const cast_score = 1; // this point is applied for each matching cast
const year_score = 2; // given for titles made within 5 years of input titles
const oscar_score = 3; // given once if title was nominated or won a similar oscar

const search_title_temp = "search_title_temp"; // name of temporary stored search query
const search_cast_temp = "search_cast_temp"; // name of temporary stored cast query
const limit_default = 10; // default amount of search result to return

// TODO: fill in your connection details here
const connection = mysql.createConnection({
    host: config.rds_host,
    user: config.rds_user,
    password: config.rds_password,
    port: config.rds_port,
    database: config.rds_db
});
connection.connect();

// ********************************************
//            METHODS FOR ROUTES
// ********************************************

// function to return title as string to be used in WHERE clause
// query is the input query from client
function return_where_title(query) {
    var result = "";

    if(query.title1 != null) {
        result += `"${query.title1}"`;
    }
    if(query.title2 != null) {
        result += `, "${query.title2}"`;
    }
    if(query.title3 != null) {
        result += `, "${query.title3}"`;
    }
    if(query.title4 != null) {
        result += `, "${query.title4}"`;
    }
    if(query.title5 != null) {
        result += `, "${query.title5}"`;
    }

    return result;
}

// function to return cast as string to be used in WHERE clause
// query is the input query from client
function return_where_cast(query) {
    var result = "";

    if(query.cast1 != null) {
        result += `"${query.cast1}"`;
    }
    if(query.cast2 != null) {
        result += `, "${query.cast2}"`;
    }
    if(query.cast3 != null) {
        result += `, "${query.cast3}"`;
    }
    if(query.cast4 != null) {
        result += `, "${query.cast4}"`;
    }
    if(query.cast5 != null) {
        result += `, "${query.cast5}"`;
    }

    return result;
}

// function to return imdb url for title or cast using id
// return url or blank if error
function return_imdb_url(id) {
    var result = ""
    // check if there is id
    if (id != null && id.length > 0) {
        // check if title or cast
        if(id[0] == 't') {
            result += imdb_url + "/title/" + id
        } else if(id[0] == 'n') {
            result += imdb_url + "/name/" + id
        }
    }
    
    return result;
}

// function to add imdb url to array of titles
function add_imdb_url(json_array) {
    if(json_array == null) return; // do nothing if no input

    // add url to each title
    json_array.forEach(row => row.URL = row.TITLE_ID != null ? return_imdb_url(row.TITLE_ID) : return_imdb_url(row.cast_id));
}

// function to drop temporary table if it exists
// doesn't return anything
function drop_temp_table(table_name) {
    if(table_name != null) {
        connection.query(`DROP TEMPORARY TABLE IF EXISTS ${table_name}`,
        function(error, results, fields){});
    }
}

// ********************************************
//            MOVIES OSCARS ROUTES
// ********************************************

// function to grab data of single title using the title_id
async function title(req, res) {
    // check if there is id
    if (req.query.id != null && req.query.id.length > 0) {
        var id = req.query.id;
        connection.query(`WITH genre_temp AS (
            SELECT mg.TITLE_ID AS TITLE_ID, GROUP_CONCAT(g.genre) AS GENRES
            FROM movies_genres mg JOIN genres g ON mg.GENRE_ID = g.genre_id
            WHERE mg.TITLE_ID = "${id}"
            GROUP BY mg.TITLE_ID
        ),
        oscar_temp AS (
            SELECT o.TITLE_ID AS TITLE_ID,
                GROUP_CONCAT(
                    DISTINCT CONCAT(o.ceremony_year, " ",
                    cn.NormalizedCategory, " ", o.winner)
                ) AS OSCARS
            FROM oscar o JOIN cat_normal cn ON o.category = cn.OriginalCategory
            WHERE o.TITLE_ID = "${id}"
            GROUP BY o.TITLE_ID
        )
        SELECT DISTINCT m.TITLE_ID AS TITLE_ID, m.TITLE AS TITLE,
            m.START_YEAR AS START_YEAR, m.runtime AS runtime, r.averageRating AS rating,
            r.numVotes AS numVotes, "${return_imdb_url(id)}" AS URL, gt.GENRES AS GENRES,
            ot.OSCARS AS OSCARS, mpu.POSTER_URL AS IMAGE
        FROM movies m LEFT JOIN ratings r ON m.TITLE_ID = r.tconst
            LEFT JOIN genre_temp gt ON m.TITLE_ID = gt.TITLE_ID
            LEFT JOIN oscar_temp ot ON m.TITLE_ID = ot.TITLE_ID
            LEFT JOIN MOVIES_AND_POSTER_URL mpu ON m.TITLE_ID = mpu.TITLE_ID
        WHERE m.TITLE_ID = "${id}";`,
        function (error, results, fields) {
            if (error) {
                console.log(error);
                res.json({ error: error });
            } else {
                console.log(results);
                res.json({ results: results });
            }
        });
    } else {
        res.json({ results: [] });
    }
}

// function to grab data of all cast in title via title_id
async function title_casts(req, res) {
    // check if there is id
    if (req.query.id != null && req.query.id.length > 0) {
        var id = req.query.id;
        connection.query(`SELECT cd.cast_id AS cast_id, cd.name AS name,
            c.cast_category AS job
        FROM cast_details cd JOIN cast c ON cd.cast_id = c.cast_id
        WHERE c.title_id="${id}";`,
        function (error, results, fields) {
            if (error) {
                console.log(error);
                res.json({ error: error });
            } else {
                console.log(results);
                res.json({ results: results });
            }
        });
    } else {
        res.json({ results: [] });
    }
}

// function to grab data of single cast using the cast_id
async function cast(req, res) {
    // check if there is id
    if (req.query.id != null && req.query.id.length > 0) {
        var id = req.query.id;
        connection.query(`SELECT cast_id, name, birth_year,
            "${return_imdb_url(id)}" AS URL
        FROM cast_details
        WHERE cast_id="${id}";`,
        function (error, results, fields) {
            if (error) {
                console.log(error);
                res.json({ error: error });
            } else {
                console.log(results);
                res.json({ results: results });
            }
        });
    } else {
        res.json({ results: [] });
    }
}

async function cast_titles(req, res) {
    // check if there is id
    if (req.query.id != null && req.query.id.length > 0) {
        var id = req.query.id;
        connection.query(`SELECT m.TITLE_ID AS TITLE_ID, m.TITLE AS TITLE,
            m.START_YEAR AS START_YEAR, c.cast_category AS JOB
        FROM movies m JOIN cast c ON m.TITLE_ID = c.title_id
        WHERE c.cast_id = "${id}";`,
        function (error, results, fields) {
            if (error) {
                console.log(error);
                res.json({ error: error });
            } else {
                console.log(results);
                res.json({ results: results });
            }
        });
    } else {
        res.json({ results: [] });
    }
}

// function to grab recommended titles based on client inputs
/**
 * CALLING URL: http://127.0.0.1:8080/recommend
 * 
 * INPUT PARAMETERS (need at least one title or one cast):
 *  1. title1, title2, title3, title4, title5: the five parameters for input of title_id
 *  2. cast1, cast2, cast3, cast4, cast5: the five parameters for input of cast_id
 *  3. rating_low & rating_high: low and high end range of title rating. The search is inclusive of both ends
 *  4. runtime_low & runtime_high: low and high end range of title runtime in minutes. The search is inclusive of both ends
 */
async function recommend(req, res) {
    // step 1: set input parameters

    // rating
    rating_low = rating_min;
    rating_high = rating_max;
    if(req.query.rating_low != null && !isNaN(req.query.rating_low)) {
        rating_low = req.query.rating_low;
    }
    if(req.query.rating_high != null && !isNaN(req.query.rating_high)) {
        rating_high = req.query.rating_high;
    }
    
    // runtime
    runtime_low = runtime_min;
    runtime_high = runtime_max;
    if(req.query.runtime_low != null && !isNaN(req.query.runtime_low)) {
        runtime_low = req.query.runtime_low;
    }
    if(req.query.runtime_high != null && !isNaN(req.query.runtime_high)) {
        runtime_high = req.query.runtime_high;
    }

    // list of titles as string
    var title_query = return_where_title(req.query);
    // list of cast as string
    var cast_query = return_where_cast(req.query);
    // check to make sure client has input
    if(title_query.length <= 0 && cast_query.length <= 0) {
        res.json({results: []});
        return;
    }
    var title_exists = false;
    var cast_exists = false;

    // step 2: create main query
    // start the query
    var query_string = `WITH `;
    
    // include CTE if client has title inputs
    if(title_query.length > 0) {
        query_string += `temp_title AS (
            SELECT DISTINCT TITLE_ID, START_YEAR
            FROM movies
            WHERE TITLE_ID IN (${title_query})
        ),
        `;
        
        title_exists = true; // track there are title inputs
    }

    // include CTS if client has cast inputs
    if(cast_query.length > 0 || title_exists) {
        query_string += `temp_cast AS (
            ${title_exists ? `(
                SELECT DISTINCT cast_id
                FROM cast
                WHERE title_id IN (${title_query})
            )
            ` : ""}
            ${title_exists && cast_query.length > 0 ? `UNION
            ` : ""}
            ${cast_query.length > 0 ? `(
                SELECT DISTINCT cast_id
                FROM cast_details
                WHERE cast_id IN (${cast_query})
            )` : ""}
        ),
        `;

        cast_exists = true; // track there are cast inputs
    }

    // check to ensure at least title or cast has inputs
    if(!title_exists && !cast_exists) {
        res.json({ results: [] });
        return; // return blank results due to no inputs
    }
    
    query_string += `raw_scores AS (
        `;

    // include evaluation of genre if title inputs exist
    if(title_exists) {
        query_string += `(
            WITH input_genres AS (
                SELECT DISTINCT mg.GENRE_ID AS GENRE_ID
                FROM temp_title tt JOIN movies_genres mg
                    ON tt.TITLE_ID = mg.TITLE_ID
            )
            SELECT TITLE_ID, ${genre_score} AS SCORE
            FROM movies_genres
            WHERE GENRE_ID IN (SELECT GENRE_ID FROM input_genres)
        )
        UNION ALL
        `;
    }

    // include evaluation of cast if cast inputs exist
    if(cast_exists) {
        query_string += `(
            SELECT TITLE_ID, ${cast_score} AS SCORE
            FROM cast
            WHERE cast_id IN (SELECT cast_id FROM temp_cast)
        )
        UNION ALL
        `;
    }

    // include evaluation of year if title inputs exist
    if(title_exists) {
        query_string += `(
            WITH year AS (
                SELECT MIN(start_year) AS min_year,
                    MAX(start_year) AS max_year
                FROM temp_title
            )
            SELECT m.TITLE_ID AS TITLE_ID, ${year_score} AS SCORE
            FROM movies m, year
            WHERE m.start_year >= year.min_year - 5
                AND m.start_year <= year.max_year + 5
        )
        UNION ALL
        `;
    }

    // include oscars statements based on which inputs exist
    query_string += `(
            WITH oscars_search AS (
                SELECT o.TITLE_ID AS TITLE_ID, o.name AS CAST_ID,
                    cn.NormalizedCategory AS NormalizedCategory
                FROM oscar o JOIN cat_normal cn ON o.category = cn.OriginalCategory
            ),
            oscars_categories AS (
                ${title_exists ? `(
                    SELECT os.NormalizedCategory
                    FROM oscars_search os JOIN temp_title tt ON os.TITLE_ID = tt.TITLE_ID
                )
                ` : ""}
                ${title_exists && cast_exists ? `UNION
                ` : ""}
                ${cast_exists ? `(
                    SELECT os.NormalizedCategory
                    FROM oscars_search os JOIN temp_cast tc ON os.CAST_ID = tc.cast_id
                )` : ""}
            )
            SELECT DISTINCT os.TITLE_ID AS TITLE_ID, ${oscar_score} AS SCORE
            FROM oscars_search os JOIN oscars_categories oc
                ON os.NormalizedCategory = oc.NormalizedCategory
        )
    `;
    
    query_string += `)
    `;

    // include title filter if needed
    query_string += `SELECT rs.TITLE_ID AS TITLE_ID,
        m.TITLE as TITLE,
        SUM(rs.SCORE) AS SCORE,
        r.averageRating AS RATING,
        m.runtime AS RUNTIME,
        m.START_YEAR AS START_YEAR
    FROM raw_scores rs JOIN ratings r ON rs.TITLE_ID = r.tconst
        JOIN movies m ON rs.TITLE_ID = m.TITLE_ID
    WHERE ${title_exists ? `rs.TITLE_ID NOT IN (SELECT TITLE_ID FROM temp_title)
        AND ` : ""}
        r.averageRating >= ${rating_low}
        AND r.averageRating <= ${rating_high}
        AND m.runtime >= ${runtime_low}
        AND m.runtime <= ${runtime_high}
    GROUP BY rs.TITLE_ID
    ORDER BY SUM(rs.SCORE) DESC, r.averageRating DESC
    LIMIT 10;`;

    // log query for debugging
    console.log("Recommendation Query:");
    console.log(query_string);

    // line break
    console.log("-------------------------------------------------------------------------");

    // step 3: run query
    connection.query(query_string,
        function(error, results, fields) {
            if (error) {
                console.log(error);
                res.json({ error: error });
            } else {
                console.log(results);
                res.json({ results: results });
            }
        }
    );
}

// function to grab data of titles based on search criteria from client
/**
 * CALLING URL: http://127.0.0.1:8080/search/title
 *  
 * INPUT PARAMETERS (all parameters are optional, more parameters will narrow down results):
 *  1. name: you can add an identifying name, which will allow you to save multiple searches as temporary tables. Parameter is optional because there is default name. Only use numbers & letters
 *  2. order: select how to sort the search results. default sort is popularity. (list of acceptable inputs: title, genre, year, rating, runtime, popular)
 *  3. order2: select whether to sort ascending (input ASC) or descending (no input needed, leave as default)
 *  4. limit: select how many rows of results to return; will return less if there aren't enough results
 *  5. skip: select how many rows to skip from the top based on the selected sorting method
 *  6. keyword: enter only one keyword for searching the TITLE
 *  7. genre: enter only one genre
 *  8. oscar_ncat: enter one of either 1) year of oscar ceremoney, or 2) a normalized oscar category from the cat_normal table
 *  9. year_low & year_high: low and high end range of title release year. The search is inclusive of both ends. Adding either of these two parameters will remove all titles without a release year.
 * 10. rating_low & rating_high: low and high end range of title rating. The search is inclusive of both ends. Adding either of these two parameters will remove all titles without a rating.
 * 11. runtime_low & runtime_high: low and high end range of title runtime in minutes. The search is inclusive of both ends. Adding either of these two parameters will remove all titles without a runtime.
 */
async function search_title(req, res) {
    // default parameters
    var name = search_title_temp; // default name for temporary table
    var order = "numVotes"; // default sort order is by popularity
    var order2 = "DESC"; // default sort is descending
    var limit = limit_default; // default number of results returned per query
    var skip = 0; // how many records to skip
    var keyword = ""; //default keyword search
    // below variables track if the respective parameters have been received from client
    var is_genre = false;
    var is_oscar = false;
    var is_year_low = false;
    var is_year_high = false;
    var is_rating_low = false;
    var is_rating_high = false;
    var is_runtime_low = false;
    var is_runtime_high = false;

    // check if each parameter is listed
    if(req.query.name != null) name += "_" + req.query.name;
    if(req.query.order != null) {
        switch(req.query.order) {
            case "title":
                order = "TITLE";
                break;
            case "genre":
                order = "GENRES";
                break;
            case "year":
                order = "START_YEAR";
                break;
            case "rating":
                order = "rating";
                break;
            case "runtime":
                order = "runtime";
                break;
            case "popular":
                order = "numVotes";
                break;
        }
    }
    if(req.query.order2 != null && req.query.order2 == "ASC") order2 = "ASC";
    if(req.query.limit != null && req.query.limit > 0) limit = req.query.limit;
    if(req.query.skip != null && req.query.skip > 1) skip = req.query.skip;
    if(req.query.keyword != null && req.query.keyword.length > 0) keyword = req.query.keyword;
    if(req.query.genre != null && req.query.genre.length > 0) is_genre = true;
    if(req.query.oscar_ncat != null && req.query.oscar_ncat.length > 0) is_oscar = true;
    if(req.query.year_low != null && req.query.year_low > 0) is_year_low = true;
    if(req.query.year_high != null && req.query.year_high > 0) is_year_high = true;
    if(req.query.rating_low != null && req.query.rating_low > 0) is_rating_low = true;
    if(req.query.rating_high != null && req.query.rating_high > 0) is_rating_high = true;
    if(req.query.runtime_low != null && req.query.runtime_low > 0) is_runtime_low = true;
    if(req.query.runtime_high != null && req.query.runtime_high > 0) is_runtime_high = true;

    // drop temp table if changing the query
    if(req.query.pull == null || req.query.pull != 1) {
        drop_temp_table(name);
    }

    // variable to store query
    var create_query_string = "";
    var search_query_string = "";

    // generate query based on client inputs
    if(req.query.pull != null && req.query.pull == 1) {
        // pull different part of search
        // requires the order by parameter:
        // same order parameter will result in different page of existing pull
        // different order parameter will re-sort the temporary table and then return result
        search_query_string = `SELECT *
        FROM ${name}
        ORDER BY ${order} ${order2}, TITLE, TITLE_ID
        LIMIT ${limit}
        OFFSET ${skip};`;
    } else if(!is_genre && keyword.length == 0 && !is_oscar && !is_year_low && !is_year_high
        && !is_rating_low && !is_rating_high && !is_runtime_low && !is_runtime_high) {
            // returns generic search
            create_query_string += `CREATE TEMPORARY TABLE ${name} AS (
                WITH genre_temp AS (
                    SELECT mg.TITLE_ID AS TITLE_ID, GROUP_CONCAT(g.genre) AS GENRES
                    FROM movies_genres mg JOIN genres g ON mg.GENRE_ID = g.genre_id
                    GROUP BY mg.TITLE_ID
                ),
                oscar_temp AS (
                    SELECT o.TITLE_ID AS TITLE_ID,
                        GROUP_CONCAT(
                            DISTINCT CONCAT(o.ceremony_year, " ",
                            cn.NormalizedCategory, " ", o.winner)
                        ) AS OSCARS
                    FROM oscar o JOIN cat_normal cn ON o.category = cn.OriginalCategory
                    WHERE o.TITLE_ID IS NOT NULL
                    GROUP BY o.TITLE_ID
                )
                SELECT DISTINCT m.TITLE_ID AS TITLE_ID, m.TITLE AS TITLE,
                    m.START_YEAR AS START_YEAR, m.runtime AS runtime, r.averageRating AS rating,
                    r.numVotes AS numVotes, gt.GENRES AS GENRES,
                    ot.OSCARS AS OSCARS, mpu.POSTER_URL AS IMAGE
                FROM movies m LEFT JOIN ratings r ON m.TITLE_ID = r.tconst
                    LEFT JOIN genre_temp gt ON m.TITLE_ID = gt.TITLE_ID
                    LEFT JOIN oscar_temp ot ON m.TITLE_ID = ot.TITLE_ID
                    LEFT JOIN MOVIES_AND_POSTER_URL mpu ON m.TITLE_ID = mpu.TITLE_ID
            );`;

            search_query_string = `SELECT *
            FROM ${name}
            ORDER BY ${order} ${order2}, TITLE, TITLE_ID
            LIMIT ${limit}
            OFFSET ${skip};`;
    } else { // store search in temporary table and return optionally specified rows
        create_query_string += `CREATE TEMPORARY TABLE ${name} AS (
            WITH genre_temp AS (
                SELECT mg.TITLE_ID AS TITLE_ID, GROUP_CONCAT(g.genre) AS GENRES
                FROM movies_genres mg JOIN genres g ON mg.GENRE_ID = g.genre_id
                GROUP BY mg.TITLE_ID
            ),
            oscar_temp AS (
                SELECT o.TITLE_ID AS TITLE_ID,
                    GROUP_CONCAT(
                        DISTINCT CONCAT(o.ceremony_year, " ",
                        cn.NormalizedCategory, " ", o.winner)
                    ) AS OSCARS
                FROM oscar o JOIN cat_normal cn ON o.category = cn.OriginalCategory
                WHERE o.TITLE_ID IS NOT NULL
                GROUP BY o.TITLE_ID
            )
            SELECT DISTINCT m.TITLE_ID AS TITLE_ID, m.TITLE AS TITLE,
                m.START_YEAR AS START_YEAR, m.runtime AS runtime, r.averageRating AS rating,
                r.numVotes AS numVotes, gt.GENRES AS GENRES,
                ot.OSCARS AS OSCARS, mpu.POSTER_URL AS IMAGE
            FROM movies m LEFT JOIN ratings r ON m.TITLE_ID = r.tconst
                LEFT JOIN genre_temp gt ON m.TITLE_ID = gt.TITLE_ID
                LEFT JOIN oscar_temp ot ON m.TITLE_ID = ot.TITLE_ID
                LEFT JOIN MOVIES_AND_POSTER_URL mpu ON m.TITLE_ID = mpu.TITLE_ID
            WHERE LOWER(m.TITLE) LIKE "${keyword.length > 0 ? "%" + String(keyword).toLowerCase() : ""}%"
                ${is_genre ? `AND LOWER(gt.GENRES) LIKE "%${String(req.query.genre).toLowerCase()}%"` : ""}
                ${is_oscar ? `AND LOWER(ot.OSCARS) LIKE "%${String(req.query.oscar_ncat).toLowerCase()}%"` : ""}
                ${is_year_low ? `AND m.START_YEAR >= ${req.query.year_low}` : ""}
                ${is_year_high ? `AND m.START_YEAR <= ${req.query.year_high}` : ""}
                ${is_rating_low ? `AND r.averageRating >= ${req.query.rating_low}` : ""}
                ${is_rating_high ? `AND r.averageRating <= ${req.query.rating_high}` : ""}
                ${is_runtime_low ? `AND m.runtime >= ${req.query.runtime_low}` : ""}
                ${is_runtime_high ? `AND m.runtime <= ${req.query.runtime_high}` : ""}
        );`;

        search_query_string = `SELECT *
        FROM ${name}
        ORDER BY ${order} ${order2}, TITLE, TITLE_ID
        LIMIT ${limit}
        OFFSET ${skip};`;
    }

    // log query for debugging
    console.log("Create Query:");
    console.log(create_query_string);

    console.log("Search Query:");
    console.log(search_query_string);

    // line break
    console.log("-------------------------------------------------------------------------");

    // run query
    if(create_query_string.length > 0) { // need to update search table
        connection.query(create_query_string,
        function (error, results, fields) {
            if (error) {
                console.log(error);
                res.json({ error: error });
            } else {
                connection.query(search_query_string,
                function(error, results, fields) {
                    if (error) {
                        console.log(error);
                        res.json({ error: error });
                    } else {
                        add_imdb_url(results);
                        res.json({ results: results});
                    }
                });
            }
        });
    } else if(search_query_string.length > 0) { // only need to pull results
        connection.query(search_query_string,
        function(error, results, fields) {
            if (error) {
                console.log(error);
                res.json({ error: error });
            } else {
                add_imdb_url(results);
                res.json({ results: results});
            }
        });
    } else { // return empty array
        res.json({ results: []});
    }
}

// function to grab data of cast based on search criteria from client
/**
 * CALLING URL: http://127.0.0.1:8080/search/cast
 *  
 * INPUT PARAMETERS (all parameters are optional, more parameters will narrow down results):
 *  1. name: you can add an identifying name, which will allow you to save multiple searches as temporary tables. Parameter is optional because there is default name. Only use numbers & letters
 *  2. order: select how to sort the search results. default sort is popularity. (list of acceptable inputs: name, birth_year, rating, popularity)
 *  3. order2: select whether to sort ascending (input ASC) or descending (no input needed, leave as default)
 *  4. limit: select how many rows of results to return; will return less if there aren't enough results
 *  5. skip: select how many rows to skip from the top based on the selected sorting method
 *  6. cast_name: enter only one keyword for searching cast's name (either first or last name, whichever is more identifiable)
 *  7. title_keyword: enter only one keyword for searching the TITLE
 *  9. byear_low & byear_high: low and high end range of cast birth year. The search is inclusive of both ends. Adding either of these two parameters will remove all casts without a birth year.
 */
async function search_cast(req, res) {
    // default parameters
    var name = search_cast_temp; // default name for temporary table
    var order = "popularity"; // default sort order is by popularity
    var order2 = "DESC"; // default sort is descending
    var limit = limit_default; // default number of results returned per query
    var skip = 0; // how many records to skip
    var cast_name = ""; //name keyword search
    var title_keyword = ""; // keyword of title actor has been in
    // below variables track if the respective parameters have been received from client
    var is_byear_low = false;
    var is_byear_high = false;

    // check if each parameter is listed
    if(req.query.name != null) name += "_" + req.query.name;
    if(req.query.order != null) {
        switch(req.query.order) {
            case "name":
                order = "name";
                break;
            case "byear":
                order = "birth_year";
                break;
            case "rating":
                order = "rating"
                break;
            case "popularity":
                order = "popularity"
                break;
        }
    }
    if(req.query.order2 != null && req.query.order2 == "ASC") order2 = "ASC";
    if(req.query.limit != null && req.query.limit > 0) limit = req.query.limit;
    if(req.query.skip != null && req.query.skip > 1) skip = req.query.skip;
    if(req.query.cast_name != null && req.query.cast_name.length > 0) cast_name = req.query.cast_name;
    if(req.query.title_keyword != null && req.query.title_keyword.length > 0) title_keyword = req.query.title_keyword;
    if(req.query.byear_low != null && req.query.byear_low > 0) is_byear_low = true;
    if(req.query.byear_high != null && req.query.byear_high > 0) is_byear_high = true;

    // drop temp table if changing the query
    if(req.query.pull == null || req.query.pull != 1) {
        drop_temp_table(name);
    }

    // variable to store query
    var create_query_string = "";
    var search_query_string = "";

    // generate query based on client inputs
    if(req.query.pull != null && req.query.pull == 1) {
        // pull different part of search
        // requires the order by parameter:
        // same order parameter will result in different page of existing pull
        // different order parameter will re-sort the temporary table and then return result
        search_query_string = `SELECT *
        FROM ${name}
        ORDER BY ${order} ${order2}, name, cast_id
        LIMIT ${limit}
        OFFSET ${skip};`;
    } else { // store search in temporary table and return optionally specified rows
        create_query_string += `CREATE TEMPORARY TABLE ${name} AS (
            SELECT cd.cast_id AS cast_id,
                cd.name AS name,
                cd.birth_year AS birth_year,
                MAX(r.averageRating) AS rating,
                SUM(r.numVotes) AS popularity
            FROM cast_details cd JOIN cast c ON cd.cast_id = c.cast_id
                JOIN movies m ON m.TITLE_ID = c.title_id
                JOIN ratings r ON m.TITLE_ID = r.tconst
            ${cast_name.length > 0 || title_keyword.length > 0 || is_byear_low || is_byear_high ? 
                `WHERE LOWER(cd.name) LIKE "%${String(cast_name).toLowerCase()}%"
                ${title_keyword.length > 0 ? `AND LOWER(m.TITLE) LIKE "%${String(title_keyword).toLowerCase()}%"` : ""}
                ${is_byear_low ? `AND cd.birth_year >= ${req.query.byear_low}` : ""}
                ${is_byear_high ? `AND cd.birth_year <= ${req.query.byear_high}` : ""}`
                : ``
            }
            GROUP BY cd.cast_id, cd.name, cd.birth_year
        );`;

        search_query_string = `SELECT *
        FROM ${name}
        ORDER BY ${order} ${order2}, name, cast_id
        LIMIT ${limit}
        OFFSET ${skip};`;
    }

    // log query for debugging
    console.log("Create Query:");
    console.log(create_query_string);

    console.log("Search Query:");
    console.log(search_query_string);

    // line break
    console.log("-------------------------------------------------------------------------");

    // run query
    if(create_query_string.length > 0) { // need to update search table
        connection.query(create_query_string,
        function (error, results, fields) {
            if (error) {
                console.log(error);
                res.json({ error: error });
            } else {
                connection.query(search_query_string,
                function(error, results, fields) {
                    if (error) {
                        console.log(error);
                        res.json({ error: error });
                    } else {
                        add_imdb_url(results);
                        res.json({ results: results});
                    }
                });
            }
        });
    } else if(search_query_string.length > 0) { // only need to pull results
        connection.query(search_query_string,
        function(error, results, fields) {
            if (error) {
                console.log(error);
                res.json({ error: error });
            } else {
                add_imdb_url(results);
                res.json({ results: results});
            }
        });
    } else { // return empty array
        res.json({ results: []});
    }
}

// Get answer options for random quiz question
/**
 * CALLING URL: http://127.0.0.1:8080/getOscarWinningMovies
 * 
 * RESPONSE PARAMETERS: TITLE_ID,ceremony_year,TITLE,NormalizedCategory,POSTER_URL
 */
async function quiz_win(req, res) {
    connection.query(`WITH randomYearCategory AS (SELECT DISTINCT oscar.ceremony_year, oscar.category, cat_normal.NormalizedCategory
                                                  FROM oscar JOIN cat_normal ON oscar.category = cat_normal.OriginalCategory
                                                  WHERE oscar.title_id IS NOT NULL
                                                  GROUP BY oscar.ceremony_year, oscar.category
                                                  HAVING COUNT(*) >= 4
                                                  ORDER BY RAND()
                                                  LIMIT 1)
                      SELECT o.ceremony_year as year, ryc.NormalizedCategory as category, m.TITLE as film, o.name as name, o.winner as winner
                      FROM randomYearCategory ryc JOIN oscar o ON ryc.ceremony_year = o.ceremony_year
                      AND ryc.category = o.category JOIN movies m ON o.title_id = m.title_id
                      GROUP BY o.ceremony_year, ryc.NormalizedCategory, m.TITLE;`, 
        function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
}

// FOR HOME PAGE (Part 1) -- To get the winning movies of each year
async function getOscarWinningMovies(req, res) {
    connection.query(`Select a.TITLE_ID,
    a.ceremony_year,
    b.TITLE,
    c.NormalizedCategory,
    d.POSTER_URL
from oscar a
      inner join movies b on a.TITLE_ID = b.TITLE_ID
      inner join cat_normal c on c.OriginalCategory = a.category
      left join MOVIES_AND_POSTER_URL d on a.TITLE_ID = d.TITLE_ID
where a.winner = 'TRUE'
and c.NormalizedCategory = 'Best Picture'
GROUP BY a.TITLE_ID, a.ceremony_year, b.TITLE, c.NormalizedCategory, d.POSTER_URL
ORDER BY ceremony_year ASC`, 
        function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
}


// FOR HOME PAGE (Part 2) -- To get the maximum winner in each category
async function getMaxWinner(req, res) {
    connection.query(`with count_by_winners as
    (Select a.name,
            b.NormalizedCategory,
            count(distinct ceremony_year) as win_count
     from oscar a,
          cat_normal b
     where a.category = b.OriginalCategory
       and a.winner = 'TRUE'
       and name not in ('Producer', 'Producers', 'Sound Director')
     GROUP BY 1, 2)
SELECT      a.name,
            a.NormalizedCategory,
            a.win_count
     from count_by_winners a
     where a.win_count >= 2
     GROUP BY 1, 2, 3
     ORDER BY 3 DESC;`, 
        function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
}

module.exports = {
    title,
    title_casts,
    cast,
    cast_titles,
    recommend,
    search_title,
    search_cast,
    quiz_win,
    getOscarWinningMovies,
    getMaxWinner
}