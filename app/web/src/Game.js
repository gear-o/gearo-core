import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import TextareaAutosize from 'react-textarea-autosize';

export default function Game({socket}){
    const location = useLocation();
    const navigate = useNavigate();
    const [ended, setEnded] = useState(false);
    const [map, setMap] = useState("");
    const [game, setGame] = useState("");
    const [id, setId] = useState("");
    const [gameInfo, setGameInfo] = useState("");
    const [gameOverInfo, setGameOverInfo] = useState("");

    const handleKeyPress = (event) => {
        if(event.key === 'ArrowUp'){
            socket.emit('move', id, 'up', game);
        }
        if(event.key === 'ArrowDown'){
            socket.emit('move', id, 'down', game);
        }
        if(event.key === 'ArrowRight'){
            socket.emit('move', id, 'right', game);
        }
        if(event.key === 'ArrowLeft'){
            socket.emit('move', id, 'left', game);
        }
        if(event.key === ' '){
            socket.emit('shoot', id, game);
        }
    }

    socket.on('gameId', (id) => {
        setId(id);
    });
    socket.on('sendMap', (map) => {
        setMap(map)
    });
    socket.on('gameOver', (info) => {
      console.log('game over: ', info);
      setGameOverInfo(info);
      setEnded(true);
    });
    socket.on('whoIsU', (map) => {
        setMap(map);
    });
    socket.on('gameInfo', (info) => {
        setGameInfo(info+'\n');
    });

    useEffect(() =>{
        setGame(location.state.game);
        if(location.state.id){
            setId(location.state.id);
        }
        if(ended){
            navigate("/GameOverInfo", { replace: true, state:{gameOverInfo:gameOverInfo} });
        }
    }, [location.state.game, location.state.id, ended, navigate, gameOverInfo]);

    return (
        <div onKeyDown={handleKeyPress} style={{}}>
            {/* width:"148vh", fontSize: "1.9vh" */}
            <TextareaAutosize value={map} wrap="off" readOnly={true} style={{resize:"none", border:"solid", backgroundColor:"black", color:"#0FFF50", fontFamily: "arial",fontSize: "1.6vh", width:"79%", height:"84vh"}}></TextareaAutosize>
            <div>
            <textarea value={gameInfo} readOnly={true} style={{resize:"none", border:"solid", backgroundColor:"black", color:"#0FFF50", fontSize: "1.9vh", width: "148vh", height:"5vh", rows:'', columns:''}}></textarea>
            </div>
            <div>
            {/* <p id="arrow" style={{display: "inline-block", left: "0px", marginLeft: "20px"}}>arrow up = up  arrowdown = down arrow right = right  &nbsp;&nbsp;  arrow left = left</p> */}
            {/* <p id="shoot" style={{display: "inline-block", left: "0px", marginLeft: "20px"}}>space = shoot</p> */}
            </div>
        </div>
    );
}