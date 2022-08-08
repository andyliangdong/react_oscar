import React from 'react';
import {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';

function MovieDetail({title_id, title, imgurl, genre}) {
  return (
    <li className='cards__item'>
         <Link className='cards__item__link' to={title}>
           <figure className='cards__item__pic-wrap' data-category={genre}>
             <img
               className='cards__item__img'
               alt='movie_poster'
               src={imgurl}
             />
           </figure>
           <div className='cards__item__info'>
             <h5 className='cards__item__text'>{title}</h5>
           </div>
         </Link>
      </li>
  );
}

function CardItem(props) {

  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`http://127.0.0.1:8080/title?id=${props.movie_id}`)
    .then((response) => response.json())
    .then( (data) => setData(data['results'][0]));
  }, [props.movie_id]);

  if (data) {
    return (<MovieDetail 
      title_id={data.TITLE_ID} 
      title={data.TITLE} 
      imgurl={data.IMAGE}
      genre={data.GENRES}/>
    );
  } else {
    return <p>Loading movie `${props.movie_id}` </p>;
  }
  
}

export default CardItem;