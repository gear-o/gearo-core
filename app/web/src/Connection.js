import io from 'socket.io-client';

class Connection{
    constructor(){
        socket.on('connect', () => {
            console.log('connection id:', socket.id)
        });
        socket.on('disconnect', () => {
          console.log('disconnect');
        })
        socket.on('walletConnect', (_uri) => { 
          console.log('walletConnect: ');
        });
        socket.on('sendMap', (map) => { 
          console.log('sendMap: ', map);
        });
        socket.on('gameOver', () => { 
          console.log('game over');
        });
        socket.on('nbOfUsr', (waiting, connected, confirmed) => { 
          console.log('waiting: ', waiting, ' connected: ', connected, ' confirmed: ', confirmed);
        });
        socket.on('version', (version) => { 
          console.log('version: ', version);
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
    }
}