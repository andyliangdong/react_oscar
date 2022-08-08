import React from 'react';
import MenuBar from '../components/MenuBar';
import HomeCards from '../components/HomeCards';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';

class Home extends React.Component {

  render() {
    return (
      <>
      <div>
        <MenuBar />
        <HeroSection />
        <HomeCards />
        <Footer />
      </div>
      </>
    )
  }
}

export default Home;

