const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

// Second step is to define path for Database
const databasePath = path.join(__dirname, "moviesData.db");

// Third Step is to call express.
const app = express();
app.use(express.json()); //Here we defined that app should use JSON String Data.

// Fourth Step is Initialization of Database.
let database = null;

const initializationDatabaseAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server is running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`Server Error ${error.message}`);
    process.exit(1);
  }
};

initializationDatabaseAndServer();

// Here we are Formatting Database to Response to showcase as per result.
const movieIdDBRes = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const databaseObjectToResponseObject = (dbObjectArgs) => {
  return {
    movieName: dbObjectArgs.movie_name,
  };
};

//API 1 - Here we are creating our first API.
app.get("/movies/", async (request, response) => {
  const queryToGetAllMovies = `
    SELECT movie_name
    FROM movie;`;
  const moviesTable = await database.all(queryToGetAllMovies);
  response.send(
    moviesTable.map((eachPlayer) => databaseObjectToResponseObject(eachPlayer))
  );
});

//API 2 Here we are creating a object in Movie Table.
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const queryToCreate = `
    INSERT INTO movie(director_id, movie_name, lead_actor)
    VALUES ('${directorId}', '${movieName}', '${leadActor}')`;
  await database.run(queryToCreate);
  response.send("Movie Successfully Added");
});

// API 3 Here We can get a particular movie object

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const queryToGetParticularMovie = `
    SELECT 
        *
    FROM 
        movie
    WHERE 
        movie_id = ${movieId};`;
  const getParticularMovie = await database.get(queryToGetParticularMovie);
  response.send(movieIdDBRes(getParticularMovie));
});

// API 4 Change in Movie SQLite Database particular ID
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const queryToUpdate = `
  UPDATE 
    movie
  SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  WHERE movie_id = ${movieId};`;
  await database.run(queryToUpdate);
  response.send("Movie Details Updated");
});

// API 5 DELETE OPERATION
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieIdQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId}`;
  const deleteParticular = await database.run(deleteMovieIdQuery);
  response.send("Movie Removed");
});

//API 6 Director table getting ALL
const directorDBtoRes = (eachItem) => {
  return {
    directorId: eachItem.director_id,
    directorName: eachItem.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const directorAllQuery = `
    SELECT *
    FROM director`;
  const gettingAllDirector = await database.all(directorAllQuery);
  response.send(
    gettingAllDirector.map((eachItem) => directorDBtoRes(eachItem))
  );
});

//API 7 /directors/:directorId/movies/

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const filterWithQuery = `
  SELECT movie_name
  FROM movie
  WHERE director_id = ${directorId}`;
  const gettingDataPerDirector = await database.all(filterWithQuery);
  response.send(
    gettingDataPerDirector.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

module.exports = app;
