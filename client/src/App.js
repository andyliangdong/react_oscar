import React from 'react';
import './App.css';
import 'antd/dist/antd.css';
import "bootstrap/dist/css/bootstrap.min.css";
import 'mdb-react-ui-kit/dist/css/mdb.min.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Recommend from './pages/Recommend';
import SearchTitle from './pages/SearchTitle';
import SearchCast from './pages/SearchCast';


function App() {
  return (
    <>
      <Router>
        <Routes>
        <Route exact path="/" element={<Home />}/>
        <Route exact path='/quiz' element={<Quiz />}/>
        <Route exact path='/recommend' element={<Recommend />}/>
        <Route exact path='/searchTitle' element={<SearchTitle />}/>
        <Route exact path='/searchCast' element={<SearchCast />}/>
        </Routes>
      </Router>
    </>
  );
}

export default App;
