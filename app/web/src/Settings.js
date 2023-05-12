import React from 'react';

// export default class Settings extends Component{
export default function Settings ({socket}){
    // render(){
        console.log(socket)
        socket.on('connect', () => {
            console.log('connection id:', socket.id)
        });
        return (
            <div className="App">
              <header className="App-header">
              <h1 className="Gearo-title">Gear-ooooooooo</h1>
            </header>
            <div style={{display: "block", top: "50%", left:"50%", position:"absolute", transform: "translate(-50%, -50%)"}}>
            </div>
            </div>
        );
    }
// }