# WARZONE

## Introduction
Warzone is the server of gear-o cli, process all map construction and send it to clients.

## How to install
create env file gearo.env contain env var INFURA, SIGNER, WALLET
ex:
```{.sh}
INFURA=235970735207502307950237850970
SIGNER=1238504739859261504671056783650182376501286735612783568702658
WALLET=0x9874523964856926374650234
```
## How to launch
```{.sh}
npm run start
```

## TODO
- [ ] create domain name

### Game play
- [x] implement kill
- [x] wait for 10 user or launch parties after a 10 second of waiting if there is more than one player
- [x] implement a timer for waiting more users on a game
- [ ] paint character with the color of the team
- [ ] implement user join team
- [ ] connect bullet speed to the map
- [ ] implment use artifacts
- [ ] send artifacts to the server when kill
- [x] take money on join
- [x] give money on die
- [ ] send to server informations about stat of the user
- [ ] shrunk the map
- [ ] delete part of the wall to let characters & bullet appear the other side and shoot by the hole
- [ ] random color for the user on deathmatch game
- [x] sending new version is available if version of user < last version
- [x] factorize code move bullet
- [x] factorize code move characters
- [ ] implement kill item
- [ ] gameid with letters
- [ ] make teams be face to face
- [ ] make user come to the map at a random place

### Crypto
- [ ] run a web3 node
- [x] check transactions on the game account
- [x] send to client autorisation to join game
- [x] on people win or lose send transaction to user account
- [ ] make game wait for user to validate tx before apear on the map
- [ ] pay smart contract instead of paying direct crypto wallet

### Server
- [x] block new incoming connexion on server for maintenance
- [ ] count user & get location | push into environement var to print the var into a map of users all around the world
- [x] join parties by type free, 1$, 5$, 50$
- [ ] migrate parties one by one on the new server
- [x] create sentinel for game spy
- [x] make sentinel get users entry for each parties
- [ ] implement alert when games getting crack
- [x] send wait for user signal
- [ ] on user join the game, wait for users connected 10sec, then wait 10sec for user send transaction (confimed). if one user confirmed left push user into another game where all confimed (send reconduction message)
- [x] all gear-o client forbidden code may be absorbe by warzone
- [ ] use socket id as id instead of create uuid for each user
- [ ] delete socket for game interact with server and use observer design instead, seperate socket manager for game and for server, conflict + safety issue
- [ ] run a script to easy deploy server when tag occur
- [x] promocode generation and use
- [ ] retrieve all wallet address for each game in case of crash to refund
- [ ] protect sentinel signals with password and ip address

### Important
- [x] wait for tx sent before showing the user on the map
- [x] send crypto to user imediately after kill

### Bug
- [x] when user reach the top of the screen, he cannot move to the left
- [x] when game running for ~= 10 minutes or ~= 10 connect/disconnect clients, ghost users & artifacts appear on client side
- [ ] bullet restriction not working as well
- [x] on user pass through other users user disapear so make user get block by other users
- [x] block socket when server is down
- [x] quit game on waiting room not working, if quit waiting room many time when on game launched as much fantom users created
- [x] sometimes on game begin, user do not appear on the map. apear trigger on user move only
- [x] on paying parties when one user died the left one still in the game
- [x] on paying parties when the first user kill the second one, the second one resurected
- [ ] sometimes append 1 fantom user connexion
- [x] insufficient fund when sending tx from game to user => the gas price was to high
- [ ] weird : client @0x7f4d280c7220 45.142.192.11#4084 (paypal.com): query (cache) 'paypal.com/ANY/IN' denied
- [x] on player kill himself (suicide) last user block in the game
- [ ] on gameover return undefined info

### Test
- [ ] connect 2 users game not started yet
- [ ] connect and confirm 2 users game must started
- [ ] try to connect on game started may block user
- [ ] try connect on a party with max user connected should deny
- [ ] try to connect max user then all users connected quit the game excpet one, the game may not start
- [ ] loop create 100, 1000, 10000 users and try to move all user at th time check reaction
- [ ] test all method in game
