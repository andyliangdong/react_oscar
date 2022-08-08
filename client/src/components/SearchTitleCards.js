import React from 'react';
import CardItem from './CardItem';
import {useState, useEffect} from 'react';
import './Cards.css';

export default function SearchTitleCards() {
  // var movieCards = []
  const [searchTerm, setSearchTerm] = React.useState("");
  const handleChange = event => {
    setSearchTerm(event.target.value);
     console.log(`search term is ${event.target.value}`);
   };

  //  const handleSubmit = event => {
  //   setSearchTerm(event.target.value);
  //   console.log(`Submitted search term is ${searchTerm}`);
  // };

   const [data, setData] = useState([]);
    useEffect(() => {
      console.log(`RUN to call search endpoint on term: ${searchTerm}. Note that the endpoint is slow need to wait 30 secs.`);
      fetch(`http://127.0.0.1:8080/search/title?keyword=${searchTerm}&limit=5`)
      .then((response) =>  response.json())
      .then( (data) => {
        setData(data['results']); 
        console.log(`Search response received: ${JSON.stringify(data['results'])}`);
      });
    }, [searchTerm]);

    var movideCards = []
    if (data) {
      movideCards = data.map(
        item => (
          <CardItem movie_id = { item['TITLE_ID' ]} />
        )
      )
    }

    // if (data) {
    //   const arrayChunk = (arr, n) => {
    //     const array = arr.slice();
    //     const chunks = [];
    //     while (array.length) chunks.push(array.splice(0, n));
    //     return chunks;
    //   };

    //   movieCards = arrayChunk(data, 4).map((row, i) => (
    //     <div key={i} className= "row mx-auto">
    //       {row.map((e, i) => (<span key={i}> <CardItem movie_id = { e['TITLE_ID' ]} /></span>))}
    //     </div>
    //     ));
    // } else {
    //   <h2> Loading Movie from Database! </h2>
    // }

  
  return (
        <div className='cards'>
          <h1>Search Move Title</h1>
          <div>
              <label>Search Term: </label>
              <input type="text" name="keyword" placerholder="Enter keyword"
              onChange={handleChange} value={searchTerm}/>
            
          </div>


              <div className='cards__container'>
                  <div className='cards__wrapper'>
                      <ul className='cards__items'>
                      {movideCards}
                      </ul>
                  </div>
              </div>
        </div>
      );
}