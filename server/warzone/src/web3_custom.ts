import Web3 from 'web3';
const ethPrice = require('eth-price');
// Load environment variables
import dotenv from 'dotenv'
dotenv.config({path:__dirname+'/../gearo.env'})

export class Web3Custom{
    // crypto var
    // configure web3 with infura
    network = "mainnet";
    // network = "mumbai";
    web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/"+process.env.INFURA));
    // web3 = new Web3(new Web3.providers.HttpProvider("https://polygon-mumbai.infura.io/v3/"+process.env.INFURA));
    // connect to wallet infura
    signer = this.web3.eth.accounts.privateKeyToAccount(
        <string>process.env.SIGNER
      );
    from = <string>process.env.WALLET;
    fees = 5; // fees in percent

    constructor(){
        // add gear-o wallet to web3
        console.log(process.env.INFURA)
        console.log(process.env.SIGNER)
        console.log(process.env.WALLET)
        this.web3.eth.accounts.wallet.add(this.signer);
    }

    // get gas price
    async gas(from:string, to:string, amount:number){
        let ret = false;
        let ethInfo = await ethPrice('usd,eth');
        ethInfo = ethInfo[0].replace('USD: ','');
        amount = (this.fees/100)*amount;
        let ethAmount = (amount/Number(ethInfo)).toFixed(15).toString();
        let weiEth = this.web3.utils.toHex(this.web3.utils.toWei(ethAmount, 'ether'))
        this.web3.eth.estimateGas({
          from:from,
          to:to,
          value: weiEth,
        }).catch( (error) =>{
          console.log(error);
          return ret;
        }).then( (result) =>{
          console.log(result)
          ret = true;
          console.log(ret);
          return ret;
        });
    }

    // send transaction
    async sendTx(to:string, amount:number) {
      ethPrice('usd,eth').then((ethInfo:any)=>{
        ethInfo = ethInfo[0].replace('USD: ','')
        let ethAmount = (amount/Number(ethInfo)).toFixed(15).toString();
        let weiEth = this.web3.utils.toHex(this.web3.utils.toWei(ethAmount, 'ether'))
        this.web3.eth.getBalance(this.from).then((balance) =>{
          balance = this.web3.utils.fromWei(balance);
          this.web3.eth.getTransactionCount(this.signer.address).then((nonce) => {
            const tx = {
              from: this.from,
              to: to,
              value: this.web3.utils.toWei(amount.toString()),
              // gas: await gas(),
              nonce: nonce,
              maxPriorityFeePerGas: weiEth,
              chainId: 1,
              type: 0x2,
            }
            // sign tx
          this.web3.eth.accounts.signTransaction(tx, this.signer.privateKey).then((signedTx) => {
            console.log(signedTx.rawTransaction);
            // send tx
            console.log(balance);
            if(balance < ethAmount){
              return [signedTx.transactionHash, balance];
              // kill server not anougth fund
            }else{
              this.web3.eth.sendSignedTransaction(<string>signedTx?.rawTransaction).once("transactionHash", (txHash) => {
                console.log('Mining tx ...');
                console.log("https://", this.network, ".etherscan.io/tx/", txHash);
                return [txHash, "payed"];
                // console.log("receipt block number: ", receipt.blockNumber);
              });
            }
            })
          });
        });
      });
    }

    async getBalance() {
      this.web3.eth.getBalance(this.from).then((value) =>{
        console.log(value)
        return value;
      });
    }

    // TODO: refund if balance not good & normally never use
    async refund(from:string, amount:number) {
    }

    async getNonce(){
      this.web3.eth.getTransactionCount(this.signer.address).then((nonce) => {
        return nonce;
      });
    }
}