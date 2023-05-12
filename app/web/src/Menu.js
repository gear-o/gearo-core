import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

export default function Menu ({socket}){
  const navigate = useNavigate();
  const [wc, setWc] = useState(false);
  const [url, setUrl] = useState("");
  const [game, setGame] = useState("");
  const [connectedSig, setConnectedSig] = useState(false);
  const [confirmedSig, setConfirmedSig] = useState(false);
  const [ended] = useState(false);
  const [connected, setConnected] = useState(0);
  const [confirmed, setConfirmed] = useState(0);
  const [promocode, setPromocode] = useState("");

  socket.on('connect', () => {
    console.log('connection id:', socket.id)
    setGame('');
  });
  socket.on('disconnect', () => {
    console.log('disconnect');
  })
  socket.on('gameRoom', (game) => {
    setGame(game);
  });
  socket.on('walletConnect', (uri) => {
    setUrl(uri)
    setWc(true)
  });
  socket.on('connected', (roomGame) => {
    setGame(roomGame);
    setConnectedSig(true);
    setUrl('')
  });
  socket.on('confirmed', () => {
    setConfirmedSig(true)
  });
  socket.on('nbOfUsr', (connected, confirmed) => {
    // console.log(' connected: ', connected, ' confirmed: ', confirmed);
    setConnected(connected);
    setConfirmed(confirmed);
  });
  socket.on('maintenance', () => {
    console.log("maintenance");
  });
  socket.on('maxUserReach', () => {
    console.log('max user reach')
  });
  socket.on('err', (err) => {
    console.log('error: ', err)
  });

  const joinFree = (e) => {
    socket.emit('join', "0", "null", promocode, '0', "", "o", 'version');
  };

  const join1 = (e) => {
    console.log(promocode)
    // socket.emit('join', "0", "null", promocode, '1', "", "o", 'version');
  };

  const join5 = (e) => {
    // socket.emit('join', "0", "null", promocode, '5', "", "", 'version');
  };
  const join10 = (e) => {
    // socket.emit('join', "0", "null", promocode, '10', "", "", 'version');
  };

  useEffect(() =>{
    if(wc && url){
      setWc(false);
      navigate("/WalletConnect", { replace: true, state:{url:url, game:game} });
    }
    if(connectedSig){
      if(connected !== 0 || confirmed !== 0){
        navigate("/Wait", { replace: true, state:{game:game, connected:connected, confirmed:confirmed} });
        console.log(' connected: ', connected, ' confirmed: ', confirmed);
      }else{
        navigate("/Wait", { replace: true, state:{game:game} });
        console.log('wait no user')
      }
    }
    if(confirmedSig){
      navigate("/Game", { replace: true });
    }
    if(ended){
      navigate("/", { replace: true });
    }
  }, [wc, url, connectedSig, confirmedSig, ended, navigate, game, connected, confirmed])

  return (
      <div>
        <div>
        <h1 className="Gearo-title">Gear-o</h1>
        </div>
        <p>/!\ This is an experimental version, we are working hard to improve your experience to earn crypto /!\</p>
        {/* <p style={{marginTop: "0px", marginBottom: "0px"}}>1. on enter in game your character blink</p>
        <p style={{marginTop: "0px", marginBottom: "0px"}}>2. during 10sec hold fire prevent shoot but you can move</p>
        <p style={{marginTop: "0px", marginBottom: "0px"}}>3. after this 10sec 'fire !!!' is occure now you can shoot</p>
        <p style={{marginTop: "0px", marginBottom: "0px"}}>4. shoot other character to win crypto enjoy :)</p> */}
        <div style={{display: "block", top: "50%", left:"50%", position:"absolute", transform: "translate(-50%, -50%)"}}>
          <div>
            <label form="promo">promo code:</label>
          </div>
          <div>
            <input type="text" name="promo" onChange={evt => setPromocode(evt.target.value)}></input>
          </div>
          <div style={{marginTop:"50px"}}>
          <button onClick={joinFree}>join free$ </button>
          <button onClick={join1}>join 1$ (legalizing)</button>
          <button onClick={join5}>join 5$ (legalizing)</button>
          <button onClick={join10}>join 10$ (legalizing)</button>
          </div>
          {/* <Link to="Settings">
            <button>Settings</button>
          </Link> */}
          </div>
      </div>
  );
}