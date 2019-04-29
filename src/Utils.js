import Web3 from 'web3'
import address from './address'
import AppJson from './compile/App.json'
import UserServiceJson from './compile/UserService.json'
import UserJson from './compile/User.json'
import FundingServiceJson from './compile/FundingService.json'
import FundingGoodsJson from './compile/FundingGoods.json'
import GoodsJson from './compile/Goods.json'
import FundingInfoJson from './compile/FundingInfo.json'
import OrderJson from './compile/Order.json'

import ipfsApi from 'ipfs-api'
import { notification, message } from 'antd'

let ipfs = ipfsApi('ipfs.infura.io', '5001', { "protocol": "https" })
let ipfsPrefix = "https://ipfs.infura.io:5001/api/v0/cat?arg="
const AppAPI = AppJson.abi
const UserServiceAPI = UserServiceJson.abi
const UserAPI = UserJson.abi
const FundingServiceAPI = FundingServiceJson.abi
const FundingGoodsAPI = FundingGoodsJson.abi
const GoodsAPI = GoodsJson.abi
const FundingInfoAPI = FundingInfoJson.abi
const OrderAPI = OrderJson.abi

const AppCode = AppJson.bytecode
const UserServiceCode = UserServiceJson.bytecode
const UserCode = UserJson.bytecode
const FundingServiceCode = FundingServiceJson.bytecode
const FundingGoodsCode = FundingGoodsJson.bytecode
const GoodsCode = GoodsJson.bytecode
const FundingInfoCode = FundingInfoJson.bytecode

let web3
if (window.web3) {
    web3 = new Web3(window.web3.currentProvider)
    console.log(web3)
    // const web3 = new Web3(ganache.provider())
} else { // 没有安装matemask
    notification.error({
        message: '没有检测到以太坊插件',
        description: '请先安装或者mateMask插件!'
    })
}

// 因为选择的也是测试网络，所以能获取到测试网络上的数据
let AppContract = new web3.eth.Contract(AppAPI, address)

// 将相对不重要的数据存储的IPFS上
function saveJsonToIPFS(data) {

    return new Promise(async (resolve, reject) => {
        const buffer = Buffer.from(JSON.stringify(data))
        const res = await ipfs.add(buffer)
        console.log(res)
        resolve(res[0].hash)
    })
}

function readJsonFromIpfs(hash1, hash2) {
    return new Promise(async (resolve, reject) => {
        console.log("hash1" + hash1 + "hash2" + hash2)
        const hash = web3.utils.hexToAscii(hash1) + web3.utils.hexToAscii(hash2)
        console.log("读取的IPFS" + hash)
        const ret = await ipfs.cat(hash)
        const res = new TextDecoder('utf-8').decode(ret)
        resolve(JSON.parse(res))
    })
}

function saveImageToIpfs(file) {
    const hide = message.loading('上传中！请稍等', 0);
    return new Promise(function (resolve, reject) {
        // 浏览器文件对象
        let reader = new FileReader()
        // 把文件读取到FileReader中
        reader.readAsArrayBuffer(file)
        // 当文件加载完成后自动调用这个函数
        reader.onloadend = async () => {
            // 将reader转变成一个buffer
            const buffer = Buffer.from(reader.result)
            // add函数是一个promise对象，当里面的执行函数
            // 执行完毕时，如果有resolve(),这个函数的参数会被传出去传到外层的then中
            // 而且当前的promise执行完毕会传出一个新的promise对象
            const res = await ipfs.add(buffer)
            console.log(res)
            hide()
            // 将处理完的结果往上返回，返回一个新的promise对象
            resolve(res[0].hash)
            // ipfs.add(buffer).then(res=>{
            //     console.log(res)
            //     // 将处理完的结果往上返回
            //     resolve(res[0].hash)
            // })
        }
    })
}

let getContract = async (type, addr) => {
    if (type === 'FundingService') {
        return await new web3.eth.Contract(FundingServiceAPI, addr)
    } else if (type === 'UserService') {
        return await new web3.eth.Contract(UserServiceAPI, addr)
    } else if (type === 'User') {
        return await new web3.eth.Contract(UserAPI, addr)
    } else if (type === "FundingGoods") {
        return await new web3.eth.Contract(FundingGoodsAPI, addr)
    } else if (type === "Goods") {
        return await new web3.eth.Contract(GoodsAPI, addr)
    } else if (type === "FundingInfo") {
        return await new web3.eth.Contract(FundingInfoAPI, addr)
    } else if (type === "Order"){
        return await new web3.eth.Contract(OrderAPI, addr)
    }
}

let getPayGas = async (type, addr, value) => {
    console.log(value)
    if (type === 'FundingService') {
        // console.log(FundingServiceCode)
        // console.log(await web3.eth.estimateGas({
        //     from: addr,
        //     data: "0x" + FundingServiceCode,
        //     value: value
        // }))
        const res = await web3.eth.estimateGas({
            from: addr,
            data: "0x" + FundingServiceCode,
            value: value
        })
        return res
    } else if (type === 'UserService') {
        return await web3.eth.estimateGas({
            from: addr,
            data: "0x" + UserServiceCode,
            value: value
        })
    } else if (type === 'User') {
       
        return await web3.eth.estimateGas({
            from: addr,
            data: "0x" + UserCode,
            value: value
        })
    } else if (type === "FundingGoods") {
        return await web3.eth.estimateGas({
            from: addr,
            data: "0x" + FundingGoodsCode,
            value: value
        })
    } else if (type === "Goods") {
        return await web3.eth.estimateGas({
            from: addr,
            data: "0x" + GoodsCode,
            value: value
        })
    } else if (type === "FundingInfo") {
        return await web3.eth.estimateGas({
            from: addr,
            data: "0x" + FundingInfoCode,
            value: value
        })
    }
}

// 图片和视频等大文件存储到ipfs
export {
    AppContract, web3, ipfs, ipfsPrefix, saveJsonToIPFS, getContract,
    readJsonFromIpfs, saveImageToIpfs, getPayGas
}

