import React from 'react';
import { useLocation, useNavigate } from "react-router-dom";

export default function WalletConnect({socket}){
    const navigate = useNavigate();
    const location = useLocation();
    const quitGame = () => {
        socket.emit('quitGame', location.state.game);
        navigate("/", { replace: true });
    }
    return (
        <div>
        <button onClick={quitGame} style={{ border:"none",  width:"40px", height:"40px",  top:"18px", left:"18px", position:"absolute" }}>quit</button>
        <div style={{top: "50%", left:"50%", position:"absolute", transform: "translate(-50%, -50%)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "25px"}}>
            <div style={{display: "block"}}>
                {/* <p>for this moment <br>only Etherum crypto is available,<br> we are working on supporting all cryptos <br>or build our own <br>enjoy !</p> */}
                <h2>How To:</h2>
                <div>
                    <a href="https://www.youtube.com/watch?v=H2vU2LA_KuA" target="_blank" rel="noreferrer">How to install</a>
                </div>
                <div>
                    <a href="https://www.youtube.com/watch?v=H2vU2LA_KuA" target="_blank" rel="noreferrer">How to buy crypto</a>
                </div>
                <div>
                    <a href="https://www.youtube.com/watch?v=H2vU2LA_KuA" target="_blank" rel="noreferrer">How to scan QR code</a>
                </div>
            </div>
            <div style={{display: "block", marginLeft:"200px"}}>
                {/* <img src="../images/MetaMask-full.jpeg" style={{height:"150px", width:"500px"}}></img> */}
                <img style={{width: '100%', height: '50%'}} alt="" src={location.state.url} />
            </div>
            <div style={{display: "block", fontSize: "20px"}}>
                <p style={{fontSize: "100px"}}></p>
                {/* <!-- <p>for this moment only Etherum crypto is available,<br> we are working on supporting all crypto <br>or build our own one enjoy !</p> --> */}
            </div>
        </div>
        </div>
    );
}