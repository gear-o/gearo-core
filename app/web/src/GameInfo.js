import React, { Component } from 'react';

export default class GameInfo extends Component{
    render(){
        return (
            <body>
            <div>
                <button onclick="menu()" style={{border:'none', width:'40px', height:'40px', top:'18px', left:'18px', position:'absolute', background: 'url(../images/back.png)', backgroundSize:'cover'}}></button>
            </div>
            <div style={{display: 'block', top: '50%', left:'50%', position: 'absolute', transform: 'translate(-50%, -50%)'}}>
                <div id="infos" style={{border:'1px solidblack', color:'white', fontSize: '40px'}}></div>
            </div>
            </body>
        );
    }
}