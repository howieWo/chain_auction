const path = require('path')
const Web3 = require('web3')
const HdWalletProvider = require('truffle-hdwallet-provider')
const fs = require('fs')

const CourseList = require(path.resolve(__dirname, '../src/compile/App.json'))
courseListApi = CourseList.abi
courseListCode = CourseList.bytecode

const provider = new HdWalletProvider(
    "camera skirt duck disease uphold entire reform radio matter prepare warm faith",
    "https://ropsten.infura.io/v3/14b7b38f2644488ab736ea593b52a7d8"
)

const web3 = new Web3(provider);// 这里可能会认为是一行了，所以价格分号

(async() => {
    console.log('自执行')
    const accounts = await new web3.eth.getAccounts()
    console.log('合约部署的账号:', accounts)
    console.log(courseListApi)
    console.log(courseListCode)
    const result = await new web3.eth.Contract(courseListApi)
                        .deploy({
                            data: '0x' + courseListCode
                        })
                        .send({
                            from: accounts[0],
                            gas: '6000000'
                        })
    // console.log(result.options.address)
    // 部署地址 0xB340841828D62F362aF43B0d244421A16549E8FC
    const contractAddress = result.options.address
    console.log('合约部署成功，合约地址为：' + contractAddress)
    console.log('合约查看地址', `https://ropsten.etherscan.io/address/${contractAddress}`)

    const addressFile = path.resolve(__dirname, '../src/address.js')

    fs.writeFileSync(addressFile, "export default " + JSON.stringify(contractAddress))
    console.log('地址写入成功', addressFile)

})()