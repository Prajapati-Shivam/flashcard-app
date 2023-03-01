import React, { useState, useEffect, useRef } from "react";
import FlashCardList from "./FlashCardList";
import "./app.css";
import axios from "axios";

function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [categories, setCategories] = useState([])

  const categoryEl = useRef();
  const typeEl = useRef();
  const difficultyEl = useRef();
  const amountEl = useRef();

  useEffect(() => {
    axios
      .get('https://opentdb.com/api_category.php')
      .then(res => {
        setCategories(res.data.trivia_categories)
      })
    generateQuiz();
  },[])


  function decodeString(str) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = str;
    return textArea.value;
  }

  function generateQuiz() {
    axios
      .get('https://opentdb.com/api.php', {
        params: {
          amount: amountEl.current.value,
          category: categoryEl.current.value,
          difficulty: difficultyEl.current.value,
          type: typeEl.current.value
        }
      })
      .then(res => {
        setFlashcards(res.data.results.map((item, index) => {
          const answer = decodeString(item.correct_answer);
          const options = [
            ...item.incorrect_answers.map(a => decodeString(a)),
            answer
          ];
          return {
            id: `${index}-${Date.now()}`,
            question: decodeString(item.question),
            answer: answer,
            options: options.sort(() => Math.random() - 0.5)
          }
        }))
      })
      .catch(err => {
        console.error(err);
      })
  }

  

  function handleSubmit(e) {
    e.preventDefault();
    generateQuiz();
  }

  return (
    <>
      <form className="header" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" ref={categoryEl}>
            {categories.map(category => {
              return <option value={category.id} key={category.id}>{category.name}</option>
            })}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="difficulty">Difficulty</label>
          <select id="difficulty" ref={difficultyEl}>
            <option value="">Any difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="type">Select type</label>
          <select id="type" ref={typeEl}>
            <option value="">Any type</option>
            <option value="multiple">Multiple Choice</option>
            <option value="boolean">True / False</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="amount">Number of Questions</label>
          <input type="number" id="amount" min="1" defaultValue="10" ref={amountEl} />
        </div>
        <div className="form-group">
          <button className="btn">Generate</button>
        </div>
      </form>
      <div className="container">
        <FlashCardList flashcards={flashcards} />
      </div>
    </>
  );
}

export default App;
