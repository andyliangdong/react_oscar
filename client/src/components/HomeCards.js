import React from 'react';
import CardItem from './CardItem';
import {useState, useEffect} from 'react';
import './Cards.css';

function HomeCards() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`http://127.0.0.1:8080/getOscarWinningMovies`)
    .then((response) =>  response.json())
    .then( (data) => setData(data['results'].reverse()));
  }, []);

  var movieCards = [];
  if (data) {
    const arrayChunk = (arr, n) => {
      const array = arr.slice();
      const chunks = [];
      while (array.length) chunks.push(array.splice(0, n));
      return chunks;
    };

    movieCards = arrayChunk(data,15).map((row, i) => (
      <div key={i} className= "row mx-auto">
        {row.map((e, i) => (<span key={i}> <CardItem movie_id = { e['TITLE_ID' ]} /></span>))}
      </div>
      ));
  } else {
    <h2> Loading Movie from Database! </h2>
  }
  
  return (
    <div className='cards'>
      <h1>Oscar Award Movies</h1>
          <div className='cards__container'>
              <div className='cards__wrapper'>
                  <ul className='cards__items'>
                  {movieCards}
                  </ul>
              </div>
          </div>
    </div>
  );
}


export default HomeCards;