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
  var chosen = 0;
  const normalPoints = [100, 200, 400, 800, 1000];
  const answer = useRef(false);
  const count = useRef(0);
  const savedCount = useRef(0);
  const gameshow = async (cat, qn) => {
    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/cat${cat}.txt`);
      const data = await response.text();
      const line = data.split('\n')[qn-1];
      chosen = qn - 1;
      setQuestion(line);
      startQuestion(true);
      setTimeout(function() {
        showcaseQuestion(true);
        const intervalId = setInterval(function() {
          setTime(prevTime => prevTime - 1);
          count.current++;
          if (answer.current) {
            setQuestion(data.split('\n')[qn+4]);
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
      answer.current = true;
    } else if (event.code === "ArrowUp") {
      setPlayers(prevplayers => prevplayers + 1);
    } else if (event.code === "ArrowDown") {
      setPlayers(prevplayers => prevplayers - 1);
    } else if (event.code === "Tab") {
      event.preventDefault();
      setVisibility(visible => !visible);
    } else if (event.code === "Equal") {
      setPoints(pointlist => pointlist[answerer] += normalPoints[chosen]);
    }
  }
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  });
  useEffect(() => {
    if (paused) {
      savedCount.current = count.current;
    } else {
      if (savedCount.current !== 0) {
        count.current = savedCount.current;
        setTime(60 - count.current);
      }
      for (let i=0; i<document.getElementsByClassName("player").length; i++) {
        document.getElementsByClassName("player")[i].style.display = "block";
      }
      setAnswerer(null);
    }
  }, [paused, count]);
  function letanswer(player) {
    setPaused(prevPaused => !prevPaused);
    for (let i=0; i<document.getElementsByClassName("player").length; i++) {
      if (i !== player) {
        document.getElementsByClassName("player")[i].style.display = "none";
      }
    }
    setAnswerer(player);
  }
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
        <div className="player" onClick={() => letanswer(i)}>
          <h2 contentEditable="true">Player {i+1}</h2>
          <p className="point" key={i}>{points[i]}</p>
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
        cells.push(
          <td>
            <button onClick={() => gameshow(column + 1, row + 1)}>{normalPoints[row]}</button>
          </td>
        );
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
            <th>CATEGORY 1</th>
            <th>CATEGORY 2</th>
            <th>CATEGORY 3</th>
            <th>CATEGORY 4</th>
            <th>CATEGORY 5</th>
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
    </>
  );
}