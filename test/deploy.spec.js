const path = require('path')
const assert = require('assert')
const ganache = require('ganache-cli')
const BigNumber = require('bignumber.js')
// const getContract = require("../src/Utils.js")
const Web3 = require('web3')
// const ipfs = require('ipfs-api')
const web3 = new Web3(ganache.provider())


const AppJson = require(path.resolve(__dirname, '../src/compile/App.json'))
const FundingServiceSJson = require(path.resolve(__dirname, '../src/compile/FundingService.json'))
const FundingGoodsJson = require(path.resolve(__dirname, '../src/compile/FundingGoods.json'))
const GoodsJson = require(path.resolve(__dirname, '../src/compile/Goods.json'))
const UserJson = require(path.resolve(__dirname, '../src/compile/User.json'))
const UserServiceJson = require(path.resolve(__dirname, '../src/compile/UserService.json'))
const OrderJson = require(path.resolve(__dirname, '../src/compile/Order.json'))
const FundingInfoJson = require(path.resolve(__dirname, '../src/compile/FundingInfo.json'))
const FundingCommentJson = require(path.resolve(__dirname, '../src/compile/FundingComment.json'))

let accounts
let AppApi
let FundingServiceAPI
let FundingGoodsAPI
let UserServiceAPI
let GoodsAPI
let UserAPI
let OrderAPI
let FundingInfoAPI
let FundingCommentAPI

AppApi = AppJson.abi
FundingServiceAPI = FundingServiceSJson.abi
FundingGoodsAPI = FundingGoodsJson.abi
GoodsAPI = GoodsJson.abi
UserAPI = UserJson.abi
UserServiceAPI = UserServiceJson.abi
OrderAPI = OrderJson.abi
FundingInfoAPI = FundingInfoJson.abi
FundingCommentAPI = FundingCommentJson.abi
AppCode = AppJson.bytecode
let App

const hash1Val = web3.utils.asciiToHex("11111111111111111111111")
const hash2Val = web3.utils.asciiToHex("11111111111111111111111")

const hash1Val2 = web3.utils.asciiToHex("12312312312312312312312")
const hash2Val2 = web3.utils.asciiToHex("12312312312312312312312")

const fundingPrice = web3.utils.toWei('0.05')
const onlinePrice = web3.utils.toWei('0.08')
const target = web3.utils.toWei('0.1')
const target2 = web3.utils.toWei('0.2')
const vaildDay = 3
const fundingStartDate = '2019-4-2'

describe('合约测试', () => {

    before(async()=> {
        // 获取到ganache提供的是个虚拟账号
        accounts = await web3.eth.getAccounts()
        console.log(accounts)
        App = await new web3.eth.Contract(AppApi)
            .deploy({
                data: '0x' + AppCode
            })
            .send({
                from: accounts[9],
                gas: '5000000'
            })
    })

    

})