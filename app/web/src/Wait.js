import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import './GearO.css';

export default function Wait({socket}){
    const location = useLocation();
    const navigate = useNavigate();
    const [connected, setConnected] = useState(location.state.connected)
    const [confirmed, setConfirmed] = useState(location.state.confirmed)
    const [enter, setEnter] = useState(false)
    const [id, setId] = useState("");

    socket.on('nbOfUsr', (connected, confirmed) => {
        setConnected(connected);
        setConfirmed(confirmed);
        console.log(' connected: ', connected, ' confirmed: ', confirmed);
    });
    socket.on('confirmed', () => {
        // setEnter(true)
    });
    socket.on('enterGame', () => {
        setEnter(true)
    });
    socket.on('gameId', (id) => {
        setId(id);
    });
    useEffect(() =>{
        if(location.state.connected || location.state.confirmed){
            setConnected(location.state.connected);
            setConfirmed(location.state.confirmed);
            console.log(' connected: ', connected, ' confirmed: ', confirmed);
        }
        if(enter){
            navigate("/Game", { replace: true, state:{game:location.state.game, id:id}});
        }
    }, [location.state.connected, location.state.confirmed, location.state.game, enter, connected, confirmed, navigate, id]);

    const quitGame = () => {
        socket.emit('quitGame', location.state.game);
        navigate("/", { replace: true });
    }

    return (
        <div>
            {!confirmed && (
                <button onClick={quitGame} style={{ border:"none",  width:"40px", height:"40px",  top:"18px", left:"18px", position:"absolute" }}>quit</button>
            )}
            <div style={{display: "block", top: "50%", left:"50%", position: "absolute", transform: "translate(-50%, -50%)"}}>
                <div>
                    <p> connected = {connected}, confirmed = {confirmed}</p>
                </div>
            </div>
        </div>
    );
}