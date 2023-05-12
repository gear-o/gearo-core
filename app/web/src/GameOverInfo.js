import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import './GearO.css';

export default function Wait({socket}){
    const location = useLocation();
    const navigate = useNavigate();
    const [gameOverInfo, setGameOverInfo] = useState("");
    const [quit, setQuit] = useState(false);

    useEffect(() =>{
        if(location.state.gameOverInfo){
            setGameOverInfo(location.state.gameOverInfo);
        }
        if(quit){
            navigate("/ ", { replace: true });
        }
    }, [location.state.gameOverInfo, navigate, quit]);

    const quitGame = () => {
        setQuit(true);
    }

    return (
        <div>
            <button onClick={quitGame} style={{ border:"none",  width:"40px", height:"40px",  top:"18px", left:"18px", position:"absolute" }}>quit</button>
            <div style={{display: "block", top: "50%", left:"50%", position: "absolute", transform: "translate(-50%, -50%)"}}>
                <div>
                    <textarea value={gameOverInfo} readOnly={true} style={{resize:"none", border:"none", backgroundColor:"black", verticalAlign:"middle", textAlign:"center", color:"#0FFF50", fontSize: "20px", width: "1000px", height:"300px", rows:'', columns:''}}></textarea>
                </div>
            </div>
        </div>
    );
}