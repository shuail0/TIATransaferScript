# TIATransaferScript



# 程序功能

程序会逐个查询钱包的TIA代币余额，并将所有余额转入到制定的地址(如交易所地址)。



# 库安装

在程序目录中打开终端，输入下面的命令安装用到的库：

``` bash
npm install
```



# 参数配置

1. 钱包配置，依照`walletData.csv`的格式，准备钱包文件，Mnemonic 填助记词，ExchangeAddress是交易所的充值地址 Memo也是交易所提供的，如果没有memo就留空，每一行一一对应。
2. 打开`main.js`文件，将代码中的`walletPath`和`rpc`进行修改(在第十行和第十一行），将walletPath改为实际的钱包路径，prc修改为Celestia主网RPC地址：

``` javascript
const walletPath = './walletData.csv';  // 这里换成钱包文件路径
const rpc = "https://rpc-celestia-testnet-mocha.keplr.app";  // 这里换成主网RPC
```



# 程序运行

终端进入程序目录中输入下面的命令运行：

``` javascript
node main.js
```

