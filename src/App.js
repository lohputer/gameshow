import { useState, useEffect, useRef } from 'react';
import './App.css';

export default function App() {
  const [time, setTime] = useState(60);
  const [started, startQuestion] = useState(false);
  const [showcased, showcaseQuestion] = useState(false);
  const [question, setQuestion] = useState('');
  const [timesUp, setTimeOver] = useState(false);
  const [paused, setPaused] = useState(false);  
  const [players, setPlayers] = useState(1);
  const [visibility, setVisibility] = useState(true);
  const [answerer, setAnswerer] = useState(null);
  const [points, setPoints] = useState([0]);
  const chosen = useRef([0, 0]);
  const usedQuestions = useRef([[], [], [], [], []]);
  const normalPoints = [100, 200, 400, 800, 1000];
  const answer = useRef(false);
  const count = useRef(0);
  const savedCount = useRef(0);
  for (let i=0; i<5; i++) {
    for (let j=0; j<5; j++) {
      usedQuestions.current[i].push(false);
    }
  }
  const gameshow = async (cat, qn) => {
    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/cat${cat+1}.txt`);
      const data = await response.text();
      const line = data.split('\n')[qn];
      chosen.current = [cat, qn];
      setQuestion(line);
      startQuestion(true);
      document.getElementById("audio").play();
      setTimeout(function() {
        showcaseQuestion(true);
        const intervalId = setInterval(function() {
          setTime(prevTime => prevTime - 1);
          count.current++;
          if (answer.current) {
            setQuestion(data.split('\n')[qn+5]);
            clearInterval(intervalId); 
          }
          if (count.current >= 60) {
            setTimeOver(true);
          }
        }, 1000);
      }, 1000);
    } catch (error) {
      console.log('Does not work');
    }
  };
  const handleKeyDown = event => {
    if (event.code === "ShiftRight") {
      event.preventDefault();
      setPaused(prevPaused => !prevPaused);
    } else if (event.code === "ArrowRight") {
      document.getElementById("audio").pause();
      if (answer.current) {
        document.getElementsByClassName("screen")[0].style.animation = "down 0.5s 1 ease-in-out";
        setTimeout(()=>{
          showcaseQuestion(false);
          startQuestion(false);
          usedQuestions.current[chosen.current[0]][chosen.current[1]] = true;
          count.current = 0;
          savedCount.current = 0;
          setTime(60 - count.current);
          answer.current = false;
        }, 500);
      } else {
        answer.current = true;
      }
    } else if (event.code === "ArrowUp") {
      setPlayers(prevplayers => prevplayers + 1);
    } else if (event.code === "ArrowDown") {
      setPlayers(prevplayers => prevplayers - 1);
    } else if (event.code === "Tab") {
      event.preventDefault();
      setVisibility(visible => !visible);
    } else if (event.code === "Equal") {
      setPoints((pointList) => {
        const updatedPoints = [...pointList];
        updatedPoints[answerer] += normalPoints[chosen.current[1]];
        document.getElementsByClassName('option')[0].style.marginTop = "-10px";
        document.getElementsByClassName('option')[0].style.paddingBottom = "90px";
        document.getElementsByClassName('option')[0].style.backgroundColor = "#1cf211";
        document.getElementsByClassName('option')[1].style.marginTop = "40px";
        document.getElementsByClassName('option')[1].style.paddingBottom = "40px";
        document.getElementById('source').src = "./correct.wav";
        return updatedPoints;
      });
    } else if (event.code === "Minus") {
      setPoints((pointList) => {
        const updatedPoints = [...pointList];
        updatedPoints[answerer] -= normalPoints[chosen.current[1]]/2;
        document.getElementsByClassName('option')[1].style.marginTop = "-10px";
        document.getElementsByClassName('option')[1].style.paddingBottom = "90px";
        document.getElementsByClassName('option')[1].style.backgroundColor = "red";
        document.getElementsByClassName('option')[0].style.marginTop = "40px";
        document.getElementsByClassName('option')[0].style.paddingBottom = "40px";
        document.getElementById('source').src = "./wrong.wav";
        return updatedPoints;
      });
    }
  }
  function letanswer(player) {
    setPaused(prevPaused => !prevPaused);
    document.getElementById("audio").pause();
    for (let i=0; i<document.getElementsByClassName("player").length; i++) {
      if (i !== player) {
        document.getElementsByClassName("player")[i].style.display = "none";
      }
    }
    setAnswerer(player);
  }
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  });
  useEffect(() => {
    if (paused) {
      document.getElementById("audio").pause();
      savedCount.current = count.current;
    } else {
      if (savedCount.current !== 0) {
        count.current = savedCount.current;
        setTime(60 - count.current);
      }
      for (let i=0; i<document.getElementsByClassName("player").length; i++) {
        document.getElementsByClassName("player")[i].style.display = "block";
      }
      document.getElementById("audio").play();
      setAnswerer(null);
    }
  }, [paused, count]);
  function renderPlayers(ppl) {
    const divs = [];
    for (let i = points.length; i<ppl; i++) {
      setPoints(pointlist => pointlist[i] = 0);
    }
    for (let i=ppl; i<points.length; i++) {
      setPoints(pointlist => pointlist.pop());
    }
    for (let i = 0; i < ppl; i++) {
      divs.push(
        <div className="player">
          <h2 contentEditable="true">Player {i+1}</h2>
          <p className="point" onClick={() => letanswer(i)}>{points[i]}</p>
        </div>
      );
    }
    return divs;
  }
  const renderTable = () => {
    const rows = [];
    const numColumns = 5;
    const numRows = 5;
    for (let row = 0; row < numRows; row++) {
      const cells = [];
      for (let column = 0; column < numColumns; column++) {
        if (usedQuestions.current[column][row] !== true) {
          cells.push(
            <td>
              <button onClick={() => gameshow(column, row)}>{normalPoints[row]}</button>
            </td>
          );
        } else {
          cells.push(
            <td>
              <button className="complete">COMPLETED</button>
            </td>
          );
        }
      }
      rows.push(<tr>{cells}</tr>);
    }
    return rows;
  }
  return (
    <>
      <div className={started ? "start2 header" : "header"}>
        <div className="lights">
          <h1>THE</h1>
          <h1>GAME SHOW</h1>
          <p>Welcome! :D</p>
        </div>
      </div>
      <table border="1" className={started ? "start" : ""}>
        <thead>
          <tr>
            <th className={usedQuestions.current[0].filter(question => question === true).length === 5 ? "category" : ""}>{usedQuestions.current[0].filter(question => question === true).length === 5 ? "DONE" : "CATEGORY 1"}</th>
            <th className={usedQuestions.current[1].filter(question => question === true).length === 5 ? "category" : ""}>{usedQuestions.current[1].filter(question => question === true).length === 5 ? "DONE" : "CATEGORY 2"}</th>
            <th className={usedQuestions.current[2].filter(question => question === true).length === 5 ? "category" : ""}>{usedQuestions.current[2].filter(question => question === true).length === 5 ? "DONE" : "CATEGORY 3"}</th>
            <th className={usedQuestions.current[3].filter(question => question === true).length === 5 ? "category" : ""}>{usedQuestions.current[3].filter(question => question === true).length === 5 ? "DONE" : "CATEGORY 4"}</th>
            <th className={usedQuestions.current[4].filter(question => question === true).length === 5 ? "category" : ""}>{usedQuestions.current[4].filter(question => question === true).length === 5 ? "DONE" : "CATEGORY 5"}</th>
          </tr>
        </thead>
        <tbody>{renderTable()}</tbody>
      </table>
      {visibility ?
      <>
      <div className="players">
        {answerer != null ? <span className="option">✔️</span> : ''}
        {renderPlayers(players)}
        {answerer != null ? <span className="option">❌</span> : ''}
      </div>
      </>
      : ''}
      {showcased ?   
      <div className="screen">
        <div className="lights">
          <h1>{question}</h1>
          <h3>{ !answer.current ? (!timesUp ? (paused ? "🕑 Paused" : `🕑 ${time}`) : "Time's Up!") : ''}</h3>
        </div>
      </div> : ""}
      <audio id="audio"><source id="source" src="/ticking.wav"></source></audio>
    </>
  );
}