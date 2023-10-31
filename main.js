const {StargateClient, SigningStargateClient} = require("@cosmjs/stargate")
const { DirectSecp256k1HdWallet} = require("@cosmjs/proto-signing")
const { Tx } = require("cosmjs-types/cosmos/tx/v1beta1/tx")
require("cosmjs-types/cosmos/bank/v1beta1/tx")
const { readFile } = require("fs/promises")
const fs = require('fs')



const walletPath = './walletData.csv';  // 这里换成钱包文件目录
const rpc = "https://public-celestia-rpc.numia.xyz";  // 这里换成主网RPC

const prefix = 'celestia';  // 链名称
const transferCoinName = 'utia'  //转账的币种，tia这里显示就是utia
const gasamount = 30000  // 用作预留gas的数量



// 将CSV文件转换为Objects
const convertCSVToObjectSync = (filePath) => {
    const objects = [];
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const lines = fileData.trim().split('\n');
    const header = lines[0].split(',');
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const obj = {};
      for (let j = 0; j < header.length; j++) {
        const trimmedKey = header[j].replace(/\s/g, '');
        if (trimmedKey === 'taskTag') {
            obj[trimmedKey] = values[j].trim(); // 移除换行符和其他空白字符
        } else {
            obj[trimmedKey] = values[j];
        }
      }
      objects.push(obj);
    }
    return objects;
  };

const walletData = convertCSVToObjectSync(walletPath);
;(
    async () => {
        console.log('开始循环...')
        for (wt of walletData) {
            const client = await StargateClient.connect(rpc)
            console.log(await client.getChainId())
        // 从助记词获得钱包Signer
        const wtSigner = await DirectSecp256k1HdWallet.fromMnemonic(wt.Mnemonic, { prefix: prefix});
        const wtAddress = (await wtSigner.getAccounts())[0].address;
        const exchangeAddress = wt.ExchangeAddress;
        const memo = wt.Memo;
        console.log('从助记词恢复成功，钱包地址：', wtAddress, '，交易所充值地址:', exchangeAddress, ',memo:', memo);
        try {
        const allBalances = await client.getAllBalances(wtAddress);
        const transferCoinBalance = allBalances.filter(balance => balance.denom === transferCoinName)[0];
        console.log(transferCoinName,'余额查询成功,数量：', transferCoinBalance);
        const trasferAmount = Number(transferCoinBalance.amount) - gasamount;
        console.log('准备向交易所转账，转账数量：', trasferAmount, '，预留30000作为GAS');

        const signingClient = await SigningStargateClient.connectWithSigner(rpc, wtSigner);
        const result = await signingClient.sendTokens(
            wtAddress,  // 发送地址
            exchangeAddress, // 接收地址
            [{denom: transferCoinName, amount: trasferAmount.toString()}],  // 代币和数量
            {
                amount: [{ denom: transferCoinName, amount: gasamount.toString() }],
                gas: "200000",
            },
            memo  // 在这里添加你需要的 memo
        );

        // Output the result of the Tx
        console.log("Transfer result:", result);
        console.log("交易后账户余额:", await client.getAllBalances(wtAddress))

        } catch (error) {
            console.log('地址：', wtAddress, ', 转账失败，错误信息：', error)
                
        }

        }
    }
)()