// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

// gas should be arround 10.4227$
contract FreeForAll {

    address gameAddr;
    uint public gas;
    uint public pot;
    bool private gameClosed;
    uint public nb;
    uint public gameType;
    uint public gainValue;

    event Received(address, uint);

    constructor(address owner, uint value) {
        gameAddr = owner;
        gameType = value;
        nb = 0;
        gas = gasleft();
    }

    function enter() external payable{
        require(msg.value == gameType);
        require(!gameClosed);
        nb += 1;
        emit Received(msg.sender, msg.value);
    }

    function gain(address to) external payable {
        require(msg.sender == gameAddr);
        payable(to).transfer(gainValue);
        pot -= gainValue;
        nb --;
        if(nb == 0){
            payable(gameAddr).transfer(address(this).balance);
        }
    }

    function closeGame() public{
        gameClosed = true;
        pot = bal();
        pot -= gas;
        uint gameFee = pot - (pot / 15);
        pot -= gameFee;
        gainValue = pot / nb;
        payable(gameAddr).transfer(gameFee);
    }

    function openGame() public{
        gameClosed = false;
    }

    function bal() public view returns (uint){
        return address(this).balance;
    }
}