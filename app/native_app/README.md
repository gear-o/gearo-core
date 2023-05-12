# GEAR-O
## Introduction
Gear-o is a MMORPG (a game which can accept massive players) running on a console with characters design.
Also, you can play to earn money (cryptocurrency actually) which can be convert in your device (for most of countries).
this is an electron app

## How to launch
```{.sh}
npm run start
```

## How to play
* arrows : move
* space : shoot
* b : shield (limited time)
* v : fast shot (limited time)

## TODO
### Game Engine
- [x] update size of frame and font size on resizing window
- [x] design button on menu
- [x] add settings page
- [x] add join free button
- [x] on reconnection join the game
- [x] on reopen app join precedent game by writing persistent data in json file
- [x] wait for tx sent before showing the user on the map
- [ ] make game in teams
- [ ] make game free-for-all
- [ ] plug artifact use with the server
- [ ] quit the game with 'q'

### Game design
- [x] avoid pop up window
- [x] designing buttons
- [x] designing text
- [x] add metamask and wallet connect logo on QR code page
- [x] add game name on main window
- [x] key possibilities on game window
- [x] screen maintenace
- [x] send version of server on version pop up window
- [x] implement a score at the end of the game or when a player die
- [x] disactivate not usable buttons
- [x] turn main window on wait mode when waiting for the game
- [x] turn main window on wait mode when waiting for qrCode scan
- [x] create electron windows to run the game
- [x] print key usage on game screen
- [x] add an electron logo
- [x] add animation on menu
- [x] screen version of the cli on the main page
- [x] on walletconnect page show gameType

#### useless
- [ ] delete logo
- [ ] send timeout for server maintenance on maintenance pop up window
- [ ] screen socket not connected
- [ ] screen timeout hold fire & time is up
- [ ] margin on tx window

### Crypto
- [x] send transactions to the server
- [x] experimental: on user play valid transaction to the node
- [x] screen wallet error
- [x] send data on sending transaction
- [x] create a invoice menu retrieving all invoices of the game and download invoices
- [ ] send hash to the server to double verify payement
- [x] on transaction rejection send rejection to main window
- [ ] on transaction rejection send rejection to server
- [x] on transaction rejection return to main menu

### Bug
- [x] frame not match perctly with game border
- [x] need to click 3 time on button to join game after that 2 click handle
- [ ] need to click 3 time on all button, onHover not working (on macos electron-build app not facing the issue)
- [x] receiving socket event number of time we join a room => resolve by listening socket in constructor instead of join ipcRenderer event
- [ ] MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 (did-finish-load and 5 more) listeners added to [EventEmitter]. Use emitter.setMaxListeners() to increase limit
- [x] on close window error => Uncaught Exception:
TypeError: Cannot read properties of undefined (reading 'connected')
at BrowserWindow.onClose (/Users/kenyhenry/projets-git/07_javascript_project/gear-o/gear-o-cli/build/newgame.js:104:25) => due to wallet connector must be const
at BrowserWindow.emit (node:events:527:28)
- [x] socket-manager parse error while receiving nbOfUsers event => resolve by avoid socket.onAny and use socket.on instead
- [x] resize screen not working
- [ ] persistency not working on electron-build app
- [x] macos sign app to avoid security trick