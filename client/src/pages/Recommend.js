import React from 'react';
import MenuBar from '../components/MenuBar';
import { recommendFetch, titleFetch, castFetch } from '../fetcher';

const ratingLowStart = 5;
const ratingHighStart = 10;
const runtimeLowStart = 20;
const runtimeHighStart = 200;

class Recommend extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
          inputTitles: [],
          inputCasts: [],
          ratingLow: ratingLowStart,
          ratingHigh: ratingHighStart,
          runtimeLow: runtimeLowStart,
          runtimeHigh: runtimeHighStart,
          outputTitles: []
        }

        this.getStoredTitles = this.getStoredTitles.bind(this);
        this.getStoredCasts = this.getStoredCasts.bind(this);
        this.reset = this.reset.bind(this);
        this.submitRecommend = this.submitRecommend.bind(this);
        this.getTitleId = this.getTitleId.bind(this);
        this.getCastId = this.getCastId.bind(this);
    }

    /**
     * Function to get stored title_id and information on those titles from user searches
     */
    getStoredTitles() {
      // for testing only
      localStorage.setItem("title1", "tt1375666");
      localStorage.setItem("title2", "tt1825683");
      localStorage.setItem("cast1", "nm0634240");



      var titles = [];

      // get titles from localStorage and information
      var storageTitles = [localStorage.getItem("title1"),
        localStorage.getItem("title2"),
        localStorage.getItem("title3"),
        localStorage.getItem("title4"),
        localStorage.getItem("title5")
      ];
      storageTitles.forEach(function(id) {
        if(id) {
          titleFetch(id).then(res => {
            titles.push(res.results[0]);
          });
        }
      });

      // update state
      this.setState({inputTitles: titles});
    }

    /**
     * Function to get stored cast_id and information on those casts from user searches
     */
    getStoredCasts() {
      var casts = [];

      // get casts from localStorage and information
      var storageCasts = [localStorage.getItem("cast1"),
        localStorage.getItem("cast2"),
        localStorage.getItem("cast3"),
        localStorage.getItem("cast4"),
        localStorage.getItem("cast5")
      ];
      storageCasts.forEach(function(id) {
        if(id) {
          castFetch(id).then(res => {
            casts.push(res.results[0]);
          });
        }
      });

      // update state
      this.setState({inputCasts: casts});
    }

    /**
     * Function to reset state and localStorage
     */
    reset() {
      // reset state
      this.setState({
        inputTitles: [],
        inputCasts: [],
        ratingLow: ratingLowStart,
        ratingHigh: ratingHighStart,
        runtimeLow: runtimeLowStart,
        runtimeHigh: runtimeHighStart,
        outputTitles: []
      });

      // reset localStorage
      localStorage.removeItem("title1");
      localStorage.removeItem("title2");
      localStorage.removeItem("title3");
      localStorage.removeItem("title4");
      localStorage.removeItem("title5");
      localStorage.removeItem("cast1");
      localStorage.removeItem("cast2");
      localStorage.removeItem("cast3");
      localStorage.removeItem("cast4");
      localStorage.removeItem("cast5");
      localStorage.setItem("nextTitle", "title1");
      localStorage.setItem("nextCast", "cast1");
    }

    /**
     * Function to pull title_id from array of JSON objects with more than just title_id information
     * @returns array of title_id; returns empty if error
     */
    getTitleId() {
      var result = [];

      this.state.inputTitles.forEach(function(title) {
        if(title.TITLE_ID.length > 0) {
          result.push(title.TITLE_ID);
        }
      });

      console.log("getTitleId: " + result);

      return result;
    }

    /**
     * Function to pull cast_id from array of JSON objects with more than just cast_id information
     * @returns array of cast_id; returns empty if error
     */
    getCastId() {
      var result = [];

      this.state.inputCasts.forEach(function(cast) {
        if(cast.cast_id.length > 0) {
          result.push(cast.cast_id);
        }
      });

      console.log("getCastId: " + result);

      return result;
    }

    /**
     * Function to query back end for recommendations and update outputTitles
     */
    submitRecommend() {
      recommendFetch(this.getTitleId(),
        this.getCastId(),
        this.state.ratingLow,
        this.state.ratingHigh,
        this.state.runtimeLow,
        this.state.runtimeHigh
      ).then(res => {
        this.setState({outputTitles: res.results});
      });

      document.getElementById("json").textContent = JSON.stringify(this.state.outputTitles, null, 4);
    }

    componentDidMount() {
      this.getStoredTitles();
      this.getStoredCasts();
    }

    render() {

        return (
          <div>
            <MenuBar />
            <button onClick={this.submitRecommend}>Recommend</button>
            <button onClick={() => document.getElementById("json").textContent = this.getTitleId()}>Update</button>
            <pre id="json"></pre>
          </div>
        )
    }
}

export default Recommend

