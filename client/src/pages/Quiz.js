import React, { useState } from 'react';
import MenuBar from '../components/MenuBar';
import { getQuizQuestion } from '../fetcher';
import { Card, Radio, Space, Button, Typography } from 'antd';

class Quiz extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      message: "",
      guess: "",
      quizArray: [],
      question: "",
      choices: [],
      correctAnswer: ""
    }
    this.updateQuizQuestion = this.updateQuizQuestion.bind(this)
    this.submitAnswer = this.submitAnswer.bind(this)
  }

  submitAnswer() {
    console.log(this.state.guess)
    if (this.state.guess === this.state.correctAnswer) {
      this.setState({ message: `That's correct! Click Next to go to the next question...` })
      console.log("That's correct")
    } else {
      this.setState({ message: `That's incorrect. The correct answer is ${this.state.correctAnswer}. Click next to go to the next question...` })
      console.log("That's incorrect")
    }
    console.log(this.state.correctAnswer)
  }
  
  updateQuizQuestion() {
    getQuizQuestion().then(res => {
      this.setState({ message: "Select an answer and click Submit, or click Next to go to the next question..."})
      this.setState({ quizArray: res.results })
      this.setState({ question: `Who won the Oscar for ${this.state.quizArray[0].category} in ${this.state.quizArray[0].year}?` })
      const answersArray = []
      for (let i = 0; i < this.state.quizArray.length; i++) {
        answersArray.push(`${this.state.quizArray[i].film}, ${this.state.quizArray[i].name}`);
        if (this.state.quizArray[i].winner === "TRUE") {
          this.setState({ correctAnswer: `${this.state.quizArray[i].film}, ${this.state.quizArray[i].name}` });
        }
      }
      this.setState({ choices: answersArray })
    })
  }

  componentDidMount() {
    getQuizQuestion().then(res => {
      this.setState({ message: "Select an answer and click Submit, or click Next to go to the next question..."})
      this.setState({ quizArray: res.results })
      this.setState({ question: `Who won the Oscar for ${this.state.quizArray[0].category} in ${this.state.quizArray[0].year}?` })
      const answersArray = []
      for (let i = 0; i < this.state.quizArray.length; i++) {
        answersArray.push(`${this.state.quizArray[i].film}, ${this.state.quizArray[i].name}`);
        if (this.state.quizArray[i].winner === "TRUE") {
          this.setState({ correctAnswer: `${this.state.quizArray[i].film}, ${this.state.quizArray[i].name}` });
        }
      }
      this.setState({ choices: answersArray })
    })
  }

  render() {

    return (
      <div>
        <MenuBar />
        <Space direction='vertical' align='center' size='large' style={{width: '100%', justifyContent: 'center', margin: '1%'}}>
          <Card title={<div>{this.state.question}</div>}
            bordered style={{
              width: 500,
              border: '2px solid black'
            }}>
              <Space direction="vertical">
                <Radio.Group onChange={ (e) => this.setState({ guess: e.target.value }) }>
                  <Space direction="vertical">
                    {this.state.choices.map((choice) => (
                      <Radio key={choice} value={choice}>{choice}</Radio>
                    ))}
                  </Space>
                </Radio.Group>
                <Typography>
                  {this.state.message}
                </Typography>
                <Space direction='horizontal' align='center' size='large'>
                  <Button onClick={this.submitAnswer}>
                    Submit
                  </Button>
                  <Button onClick={this.updateQuizQuestion}>
                    Next
                  </Button>
                </Space>
              </Space>
          </Card>
        </Space>
      </div>
    )
  }
}

export default Quiz

