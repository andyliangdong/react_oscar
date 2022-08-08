import React from 'react';
import MenuBar from '../components/MenuBar';
import SearchTitleCards from '../components/SearchTitleCards';

class SearchTitle extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <>
      <div>
        <MenuBar />
        <SearchTitleCards />
      </div>
      </>
    )
  }
}

export default SearchTitle;

