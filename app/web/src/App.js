// css
import './App.css';
import './GearO.css';

// pages
import Settings from './Settings'
import Game from './Game'
import GameInfo from './GameInfo'
import PopUp from './PopUp'
import Wait from './Wait'
import WalletConnect from './WalletConnect'
import GameOverInfo from './GameOverInfo'

// react
import React, { useEffect, useState, Suspense } from 'react';
import { Route, HashRouter, Routes } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';

// utils
import io from 'socket.io-client';

const Menu = React.lazy(() => import('./Menu'));

function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {

    const config = require('./gearo.json');
    let server = config.SERVER_ADDR
    if(!server){
      server = "http://localhost:300"
    }

    const newSocket = io(server, {transports : ['websocket'], origin: server, withCredentials: true});
    setSocket(newSocket);
    return () => {
      newSocket.close();
    }
  }, [setSocket]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
          // wait for socket ready before show Menu main window
          <Suspense fallback={<Spinner />}>
             <Menu socket={socket}/>
          </Suspense>}
        />
        <Route path="Settings" element={<Settings socket={socket}/>} />
        <Route path="Game" element={<Game socket={socket}/>} />
        <Route path="GameInfo" element={<GameInfo />} />
        <Route path="PopUp" element={<PopUp />} />
        <Route path="Wait" element={<Wait socket={socket}/>} />
        <Route path="WalletConnect" element={<WalletConnect socket={socket}/>} />
        <Route path="GameOverInfo" element={<GameOverInfo />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
