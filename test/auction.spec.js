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

    it("测试合约是否部署成功", async()=> {
        console.log(App.options.address)
        assert.ok(App.options.address)
    })

    // 判断是不是部署者
    it("判断是不是部署者", async() => {
        const isSponsor = await App.methods.isSponsor().call({
            from: accounts[9]
        })
        // console.log(isSponsor)
        assert.ok(isSponsor)
    })

    // 获取FundingService实例

    it("获取FundingService实例并测试相关方法", async ()=> {
        const fundingServiceAddr = await App.methods.fundingService().call({
            from: accounts[9]
        })

        // const hash = new Promise(async(resolve, reject)  => {
        //     const buffer = Buffer.from("这是测试数据")
        //     const res = await ipfs.add(buffer)
        //     console.log(res)
        //     resolve(res[0].hash)
        // })

        // console.log(hash)

        // const hash1 = hash.slice(0,23)
        // const hash2 = hash.slice(23)
        
        // console.log(hash1Val + "--" + hash2Val)
        const fundingService = await new web3.eth.Contract(FundingServiceAPI, fundingServiceAddr)
        await fundingService.methods.createFundingGoods( hash1Val, hash2Val, fundingPrice, onlinePrice, target, vaildDay, fundingStartDate ).send({
            from: accounts[9],
            gas: '5000000'
        })

        const fundingGoodsAddr = await fundingService.methods.getFundingGoodsById(0).call({
            from: accounts[9]
        })

        // console.log(await fundingService.methods.getAllFundingGoods())

        // const dsfs = await fundingService.methods.getAllFundingGoods().call({
        //     from: accounts[9]
        // })

        // console.log(dsfs)

        console.log("fundingGoodsAddr ：" + fundingGoodsAddr)
        const fundingGoods = await new web3.eth.Contract(FundingGoodsAPI, fundingGoodsAddr)
        
        // console.log(fundingGoods)

        await fundingGoods.methods.updataFundingInfo(hash1Val, hash2Val).send({
            from: accounts[9],
            gas: '5000000'
        })

        await fundingGoods.methods.updataFundingComment(hash1Val, hash2Val).send({
            from: accounts[9],
            gas: '5000000'
        })

        // await fundingGoods.methods.updataFundingComment(hash1Val, hash2Val).send({
        //     from: accounts[9],
        //     gas: '5000000'
        // })
        
        const GoodsAddr = await fundingGoods.methods.getGoods().call({
            from: accounts[9]
        })

        const Goods = await new web3.eth.Contract(GoodsAPI, GoodsAddr)     
        const GoodsInfo = await Goods.methods.getGoodsInfo().call({
            from: accounts[9]
        })

        //console.log(GoodsInfo)
        // console.log(fundingGoods)
        assert.ok(fundingGoods)
    })

    // 获取UserService实例

    it("获取UserService实例并且检查用户", async ()=> {
        const userServiceAddr = await App.methods.userService().call({
            from: accounts[9]
        })

        const userService = await new web3.eth.Contract(UserServiceAPI, userServiceAddr);
        const isChe = await userService.methods.checkUser(accounts[9]).call({
            from: accounts[9]
        })
        
        //console.log(isChe)
        assert.ok(!isChe)

        await userService.methods.createUser(hash1Val, hash2Val).send({
            from: accounts[9],
            gas: "5000000"
        })

        const a = await userService.methods.getAllUser().call({
            from: accounts[9]
        })

        //console.log(a)

        const UserAddr = await userService.methods.getUserByAddress(accounts[9]).call({
            from: accounts[9]
        })

        const user = await new web3.eth.Contract(UserAPI, UserAddr);
        const info1 = await user.methods.getUserInfo().call({
            from: accounts[9]
        })

       // console.log(info1)

        await user.methods.updataUser(hash1Val2, hash2Val2).send({
            from: accounts[9],
            gas: '5000000'
        })
        
        const info2 = await user.methods.getUserInfo().call({
            from: accounts[9]
        })
 
        //console.log(info2)

    })

    // 测试购买逻辑
    it('测试购买逻辑', async () => {

        // 获取App的实例
        // 获取fundingServiceAddr实例
        const fundingServiceAddr = await App.methods.fundingService().call({
            from: accounts[0]
        })

        const fundingService = await new web3.eth.Contract(FundingServiceAPI, fundingServiceAddr)
        
        // 获取fundingGoods实例

        await fundingService.methods.createFundingGoods( hash1Val, hash2Val, fundingPrice, onlinePrice, target, vaildDay, fundingStartDate).send({
            from: accounts[0],
            gas: '6000000'
        })

        const fundingGoodsAddr = await fundingService.methods.getFundingGoodsById(1).call({
            from: accounts[0]
        })
        const fundingGoods = await new web3.eth.Contract(FundingGoodsAPI, fundingGoodsAddr)

        await fundingGoods.methods.updataFundingInfo(hash1Val, hash2Val).send({
            from: accounts[0],
            gas: '5000000'
        })

        await fundingGoods.methods.updataFundingComment(hash1Val, hash2Val).send({
            from: accounts[9],
            gas: '5000000'
        })

        // await fundingGoods.methods.updataFundingComment(hash1Val, hash2Val).send({
        //     from: accounts[0],
        //     gas: '5000000'
        // })

        // 从这里创建订单并且购买物品
        // 购买者开始的金额
        const BuyeroldBlance1 = new BigNumber(await web3.eth.getBalance(accounts[1]))
        console.log("第一个购买者余额:" + BuyeroldBlance1)

        let selloldBlance1 = new BigNumber(await web3.eth.getBalance(accounts[0]))
        console.log("发起者金额：" + selloldBlance1)

        await fundingGoods.methods.createOrder(hash1Val, hash2Val).send({
            from: accounts[1],
            gas: '5000000'
        })

        await fundingGoods.methods.buy().send({
            from: accounts[1],
            value: fundingPrice,
            gas: '5000000'
        })

        // 获取到购买者相应的信息
        const buyerInfo = await fundingGoods.methods.buyers(accounts[1]).call({
            from: accounts[1]
        })

        console.log("当前众筹者的花费：" + buyerInfo)

        const orderAddr = await fundingGoods.methods.orders(accounts[1]).call({
            from: accounts[1]
        })

        console.log("订单hash1: " + orderAddr);

        const orderV =  await new web3.eth.Contract(OrderAPI, orderAddr)
       
        console.log("订单IPFShash1:" + await orderV.methods.order(1).call({from: accounts[1]}))

        const BuyernewBlance1 = new BigNumber(await web3.eth.getBalance(accounts[1]))
        console.log("第一个购买者余额:" + BuyernewBlance1)

        sellnewBlance1 = new BigNumber(await web3.eth.getBalance(accounts[0]))
        console.log("发起者金额：" + sellnewBlance1)

        console.log("--------------------------------------")
        // 再次购买
        const BuyeroldBlance2 = new BigNumber(await web3.eth.getBalance(accounts[2]))
        console.log("第二个购买者余额:" + BuyeroldBlance2)

        selloldBlance1 = new BigNumber(await web3.eth.getBalance(accounts[0]))
        console.log("发起者金额：" + selloldBlance1)

        await fundingGoods.methods.createOrder(hash1Val, hash2Val).send({
            from: accounts[2],
            gas: '6500000'
        })

        await fundingGoods.methods.buy().send({
            from: accounts[2],
            value: fundingPrice,
            gas: '5000000'
        })

        const orderAddr2 = await fundingGoods.methods.orders(accounts[2]).call({
            from: accounts[2]
        })

        console.log("订单hash2: " + orderAddr2);

        const BuyernewBlance2 = new BigNumber(await web3.eth.getBalance(accounts[2]))
        console.log("第二个购买者余额:" + BuyernewBlance2)

        sellnewBlance1 = new BigNumber(await web3.eth.getBalance(accounts[0]))
        console.log("发起者金额：" + sellnewBlance1)

        // 查看当前商品的状态

        const fundingState = await fundingGoods.methods.getFundingState().call({
            from: accounts[2]
        })

        // 确认已经进入待确认状态
        console.log("当前商品的状态：" + fundingState)

        console.log("--------------------------------------")
        // 再次购买
        const BuyeroldBlance3 = new BigNumber(await web3.eth.getBalance(accounts[3]))
        console.log("第三个购买者余额:" + BuyeroldBlance3)

        selloldBlance1 = new BigNumber(await web3.eth.getBalance(accounts[0]))
        console.log("发起者金额：" + selloldBlance1)

        await fundingGoods.methods.createOrder(hash1Val, hash2Val).send({
            from: accounts[3],
            gas: '6500000'
        })

        await fundingGoods.methods.buy().send({
            from: accounts[3],
            value: fundingPrice,
            gas: '5000000'
        })

        const orderAddr3 = await fundingGoods.methods.orders(accounts[3]).call({
            from: accounts[3]
        })

        console.log("订单hash3: " + orderAddr3);

        const BuyernewBlance3 = new BigNumber(await web3.eth.getBalance(accounts[3]))
        console.log("第三个购买者余额:" + BuyernewBlance3)

        sellnewBlance1 = new BigNumber(await web3.eth.getBalance(accounts[0]))
        console.log("发起者金额：" + sellnewBlance1)


        const owner = await fundingGoods.methods.owner().call({
            from: accounts[0]
        })

        console.log("众筹所有者:" + owner)

        // 设置上架状态，只有发起者可以改变当前的状态
        await fundingGoods.methods.updataFundingStateOnline().send({
            from: accounts[0],
            gas: '5000000'
        })

        // 查看众筹状态和发起者余额

        const fundingState1 = await fundingGoods.methods.getFundingState().call({
            from: accounts[2]
        })

        // 确认已经进入待确认状态
        console.log("当前商品的状态：" + fundingState1)

        sellnewBlance1 = new BigNumber(await web3.eth.getBalance(accounts[0]))
        console.log("发起者金额：" + sellnewBlance1)


        // 再来一个购买者，然后看看各项信息

        console.log("--------------------------------------")
        // 再次购买
        const BuyeroldBlance4 = new BigNumber(await web3.eth.getBalance(accounts[4]))
        console.log("第四个购买者余额:" + BuyeroldBlance4)

        selloldBlance1 = new BigNumber(await web3.eth.getBalance(accounts[0]))
        console.log("发起者金额：" + selloldBlance1)

        spoldBlance1 = new BigNumber(await web3.eth.getBalance(accounts[9]))
        console.log("网站所有者金额：" + spoldBlance1)

        await fundingGoods.methods.createOrder(hash1Val, hash2Val).send({
            from: accounts[4],
            gas: '6500000'
        })

        await fundingGoods.methods.buy().send({
            from: accounts[4],
            value: onlinePrice,
            gas: '5000000'
        })

        const orderAddr4 = await fundingGoods.methods.orders(accounts[4]).call({
            from: accounts[4]
        })

        console.log("订单hash4: " + orderAddr4);

        const BuyernewBlance4 = new BigNumber(await web3.eth.getBalance(accounts[4]))
        console.log("第三个购买者余额:" + BuyernewBlance4)

        sellnewBlance1 = new BigNumber(await web3.eth.getBalance(accounts[0]))
        console.log("发起者金额：" + sellnewBlance1)
        
        spnewBlance1 = new BigNumber(await web3.eth.getBalance(accounts[9]))
        console.log("网站所有者金额：" + spnewBlance1)
        // 获取到当前的owner

        const fundingState2 = await fundingGoods.methods.getFundingState().call({
            from: accounts[2]
        })

        // 确认已经进入待确认状态
        console.log("当前商品的状态：" + fundingState2)

        // 获取一下所有众筹这的地址

        const fundinger = await fundingGoods.methods.getAllBuyers().call({
            from: accounts[0]
        })

        console.log(fundinger)

        // 获取到orders

        // const Goods = await new web3.eth.Contract(GoodsAPI, GoodsAddr)     
        // const GoodsInfo = await Goods.methods.getGoodsInfo().call({
        //     from: accounts[9],
        // })

        // console.log(GoodsInfo)

        // 这里应该先请求IPFS，然后返回hash，切分
        // 调用购买逻辑
        // await fundingGoods.methods.buy( hash1Val, hash2Val ).send({
        //     from: accounts[9],
        //     gas: '5000000'
        // })

        // const state = await fundingGoods.methods.getFundingState().from({
        //     from: accounts[9]
        // })

        // console.log("当前的状态 ：" +  state)

        // 获取

        // 购买

        // 获取订单信息

        // 待上线

        // 确认上线

        // 测试分成逻辑
    })
    
    // 四个购买测试全部拿出来
    // 查看上线状态也要拿出来
    // 确认上线
    // 分成逻辑
    

    // -------

    // 众筹失败逻辑
    it('众筹失败逻辑', async() => {
        // 使用账户0创建一个新的众筹
        const fundingServiceAddr = await App.methods.fundingService().call({
            from: accounts[0],
            gas: '500000'
        })

        // console.log(fundingServiceAddr)

        const fundingService = await new web3.eth.Contract(FundingServiceAPI, fundingServiceAddr);

        await fundingService.methods.createFundingGoods(hash1Val, hash2Val, fundingPrice, onlinePrice, target2, vaildDay, fundingStartDate).send({
            from: accounts[0],
            gas: '5000000'
        })

        const fundingGoodsAddr = await fundingService.methods.getFundingGoodsById(2).call({
            from: accounts[0]
        })

        // console.log(fundingGoodsAddr)

        const fundingGoods = await new web3.eth.Contract(FundingGoodsAPI, fundingGoodsAddr);
        
        await fundingGoods.methods.updataFundingInfo(hash1Val, hash2Val).send({
            from: accounts[0],
            gas: '5000000'
        })

        await fundingGoods.methods.updataFundingComment(hash1Val, hash2Val).send({
            from: accounts[9],
            gas: '5000000'
        })

        // await fundingGoods.methods.updataFundingComment(hash1Val, hash2Val).send({
        //     from: accounts[9],
        //     gas: '5000000'
        // })

        // console.log(fundingGoods)

        console.log("--------------------")
        const ownerOldBal = await web3.eth.getBalance(accounts[0])
        console.log("项目发起者余额：" + ownerOldBal)

        const buyer1oldBal = await web3.eth.getBalance(accounts[1])
        console.log("购买者1的账户余额：" + buyer1oldBal)
        await fundingGoods.methods.createOrder(hash1Val, hash2Val).send({
            from: accounts[1],
            gas: '5000000'
        })

        await fundingGoods.methods.buy().send({
            from: accounts[1],
            value: fundingPrice,
            gas: '5000000'
        })

        const buyer1newBal = await web3.eth.getBalance(accounts[1])
        console.log("购买者1的账户余额：" + buyer1newBal)

        console.log("--------------------")

        const buyer2oldBal = await web3.eth.getBalance(accounts[2])
        console.log("购买者2的账户余额：" + buyer2oldBal)
        await fundingGoods.methods.createOrder(hash1Val, hash2Val).send({
            from: accounts[2],
            gas: '5000000'
        })

        await fundingGoods.methods.buy().send({
            from: accounts[2],
            value: fundingPrice,
            gas: '5000000'
        })

        const buyer2newBal = await web3.eth.getBalance(accounts[2])
        console.log("购买者2的账户余额：" + buyer2newBal)


        console.log("--------------------")

        const buyer3oldBal = await web3.eth.getBalance(accounts[3])
        console.log("购买者3的账户余额：" + buyer3oldBal)
        await fundingGoods.methods.createOrder(hash1Val, hash2Val).send({
            from: accounts[3],
            gas: '5000000'
        })

        await fundingGoods.methods.buy().send({
            from: accounts[3],
            value: fundingPrice,
            gas: '5000000'
        })

        const buyer3newBal = await web3.eth.getBalance(accounts[3])
        console.log("购买者3的账户余额：" + buyer3newBal)

        console.log("--------------------")

        // 当前用户的状态
        const state = await fundingGoods.methods.fundingState().call({
            from: accounts[0]
        })

        console.log("当前众筹的状态：" + state)

        // 调用众筹失败的逻辑
        await fundingGoods.methods.fundingFail().send({
            from: accounts[9],
            gas: '5000000'
        })

        const state2 = await fundingGoods.methods.fundingState().call({from: accounts[0]})
        console.log("当前的众筹状态: " + state2)

        // 查看各个账号的钱的情况

        const buyer1newBal2 = await web3.eth.getBalance(accounts[1]);
        console.log("众筹失败后账户1的余额：" + buyer1newBal2)

        const buyer2newBal2 = await web3.eth.getBalance(accounts[2]);
        console.log("众筹失败后账户2的余额：" + buyer2newBal2)

        const buyer3newBal3 = await web3.eth.getBalance(accounts[3]);
        console.log("众筹失败后账户3的余额：" + buyer3newBal3)

       
        // 单价 0.05 和目标是0.2的众筹

        // 使用三个账号购买
        // 创建订单
        

        // await fundingGoods.methods.createOrder(hash1Val, hash2Val).send({
        //     from: accounts[1],
        //     gas: '5000000'
        // })

        // await fundingGoods.methods.buy().send({
        //     from: accounts[1],
        //     value: fundingPrice,
        //     gas: '5000000'
        // })

        // await fundingGoods.methods.buy().send({
        //     from: accounts[1],
        //     value: fundingPrice,
        //     gas: '5000'
        // })




        // 调用众筹失败的逻辑        


    })

    // 商品下架逻辑
    it('商品下架逻辑', async() => {
        // 修改商品对应的ipfs地址，把状态改成下线即可φ(>ω<*) 
        // 然后找出代发货的订单
        const fundingServiceAddr = await App.methods.fundingService().call({
            from: accounts[0]
        })

        const fundingService = await new web3.eth.Contract(FundingServiceAPI, fundingServiceAddr)
        
        const fundingGoodsAddr = await fundingService.methods.getFundingGoodsById(1).call({from: accounts[0]})
        console.log(fundingGoodsAddr)
        const fundingGoods = await new web3.eth.Contract(FundingGoodsAPI, fundingGoodsAddr)
        
        // 获取当前众筹商品的状态


        const state = await fundingGoods.methods.fundingState().call({from: accounts[0]})
        console.log("当前众筹商品的状态：" + state) 

        // 修改状态为

        await fundingGoods.methods.updataFundingStateUndercarriage().send({
            from: accounts[0],
            gas: '500000'
        })

        // 再查看一下当前商品的状态
        const newState = await fundingGoods.methods.fundingState().call({from: accounts[0]})
        console.log("下架后众筹商品的状态：" + newState)

    })

    // -------

    // 用户获取两类数据

    // 自己参与的众筹
    // 自己发起的众筹
    // 这时候在前端进行处理数据
    // 获取自己的参与的众筹信息
    it("获取到自己的众筹信息和参与信息的IPFS的HASH", async ()=> {
        const userServiceAddr = await App.methods.userService().call({
            from: accounts[9]
        })
        // console.log(userServiceAddr)
        const userService = await new web3.eth.Contract(UserServiceAPI, userServiceAddr)
        // console.log(userService)
        const userAddr = await userService.methods.getUserByCurrent().call({
            from: accounts[9]
        })
        // console.log(user)
        const userV = await new web3.eth.Contract(UserAPI, userAddr);
        const userHash1 = await userV.methods.user(0).call({from: accounts[9]})
        console.log(userHash1)
    })
    
    // ------------ 

    // 获取商品信息
    it("获取商品信息的IPFS的Hash", async() => {
        const fundingServiceAddr = await App.methods.fundingService().call({
            from: accounts[1]
        })
        console.log(fundingServiceAddr)
        const fundingService = await new web3.eth.Contract(FundingServiceAPI, fundingServiceAddr)
        const fundingGoodsAddr = await fundingService.methods.getFundingGoodsById(0).call({
            from: accounts[0]
        }) 
        console.log(fundingGoodsAddr)
        const fundingGoods = await new web3.eth.Contract(FundingGoodsAPI, fundingGoodsAddr)
        // console.log(fundingGoods)
        const goodsAddr = await fundingGoods.methods.newGoods().call({
            from: accounts[1]
        })
        // console.log(goodsAddr)
        const goodsV = await new web3.eth.Contract(GoodsAPI, goodsAddr)
        // console.log(goodsV)
        const goodsHash1 = await goodsV.methods.goods(0).call({
            from: accounts[0]
        })
        // console.log(goodsHash1)

    })

    // 某一众筹下的评论信息，获取众筹下的
    it("某一众筹下的评论信息", async ()=> {
        const fundingServiceAddr = await App.methods.fundingService().call({from: accounts[0]})
        const fundingService = await new web3.eth.Contract(FundingServiceAPI, fundingServiceAddr)
        const fundingGoodsAddr = await fundingService.methods.getFundingGoodsById(0).call({from: accounts[0]})
        const fundingGoods = await new web3.eth.Contract(FundingGoodsAPI, fundingGoodsAddr)
        const fundingInfoAddr = await fundingGoods.methods.fundingInfo().call({from: accounts[0]})
        console.log(fundingInfoAddr)
        const fundingInfoValue = await new web3.eth.Contract(FundingInfoAPI, fundingInfoAddr)
        const hash1 = await fundingInfoValue.methods.fundingInfo(0).call({from: accounts[0]})
        console.log(hash1)
    })

    // 众筹信息，不是商品信息（包含众筹进度什么的）
    it("众筹信息（进度，众筹价，上限价等等）", async () => {
        const fundingServiceAddr = await App.methods.fundingService().call({from: accounts[0]})
        const fundingService = await new web3.eth.Contract(FundingServiceAPI, fundingServiceAddr)
        const fundingGoodsAddr = await fundingService.methods.getFundingGoodsById(2).call({from: accounts[0]})
        const fundingGoods = await new web3.eth.Contract(FundingGoodsAPI, fundingGoodsAddr)
        
        const target = await fundingGoods.methods.target().call({from: accounts[0]})
        console.log("众筹目标为：" + target)

        const fundingPrice = await fundingGoods.methods.fundingPrice().call({from: accounts[0]})
        console.log("现众筹价为：" + fundingPrice)

        const onlinePrice = await fundingGoods.methods.onlinePrice().call({from: accounts[0]})
        console.log("现上线价为：" + onlinePrice)

        const fundingState = await fundingGoods.methods.fundingState().call({from: accounts[0]})
        console.log("现状态为：" + fundingState)

        const validDay = await fundingGoods.methods.validDay().call({from: accounts[0]})
        console.log("截止时间：" + validDay)

        const fundingStartDate = await fundingGoods.methods.fundingStartDate().call({from: accounts[0]})
        console.log("起始时间：" + fundingStartDate)

        const count = await fundingGoods.methods.count().call({from: accounts[0]})
        console.log("支持人数：" + count)

        console.log("众筹进度：" + count*fundingPrice / target)

    })

    // 最新的回复信息
    it("获取到最新的消息", async()=> {
        const fundingServiceAddr = await App.methods.fundingService().call({from: accounts[0]})
        const fundingService = await new web3.eth.Contract(FundingServiceAPI, fundingServiceAddr)
        const fundingGoodsAddr = await fundingService.methods.getFundingGoodsById(0).call({from: accounts[0]})
        const fundingGoods = await new web3.eth.Contract(FundingGoodsAPI, fundingGoodsAddr)
        
        const fundingCommentAddr = await fundingGoods.methods.fundingComment().call({from: accounts[0]})
        const fundingComment = await new web3.eth.Contract(FundingCommentAPI, fundingCommentAddr)
        // console.log(fundingComment)
        const hash1 = await fundingComment.methods.fundingComments(0).call({from: accounts[0]})

        console.log("评论为Hash：" + hash1)
        // const hash1 = await fundingComment.methods.fundingComments(0).call({from:accounts[9]})
        // console.log(hash1)
    })

    // 获取所有上架商品

    // 加入购物车（与用户绑定）

})