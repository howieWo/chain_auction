import React from 'react'
import {
    web3, AppContract, getContract, saveJsonToIPFS,
    readJsonFromIpfs, ipfsPrefix
} from '../Utils'
import { Modal, List, Avatar, message, Drawer, Progress, Badge } from 'antd'

const confirm = Modal.confirm;

class SponsoredFundingInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fundingInfoList: [],
        };
        this.init()
    }
    init = async () => {
        const [account] = await web3.eth.getAccounts();
        if (account === undefined) {
            Modal.error({
                title: '错误',
                content: '检测到您还未登录MateMask，请先登录，登录后请刷新当前页面'
            })
            return;
        }
        const userServiceAddr = await AppContract.methods.userService().call()
        const userService = await getContract("UserService", userServiceAddr)
        const isCheck = await userService.methods.checkUser(account).call({
            from: account
        })

        if (!isCheck) {
            Modal.info({
                okText: '好的，马上去',
                title: '提示',
                content: (
                    <div>
                        <p>请先点击【个人信息】按钮，完善您的个人信息</p>
                    </div>
                ),
            });
        } else {
            // 获取所有的当前用户的订单信息
            const userAddr = await userService.methods.UserListMapping(account).call()
            console.log(userAddr)
            const user = await getContract("User", userAddr)
            const fundingList = await user.methods.getFundingList().call()

            console.log(fundingList)
            // 此处应该是从后往前开始遍历
            const hide = message.loading('数据获取中！请稍后！', 0)
            const fundingInfoList = await Promise.all(
                fundingList.map(async (v, i) => {
                    console.log(v)
                    const FundingGoods = await getContract("FundingGoods", v)
                    let fundingAllInfo = {}
                    // 获取存储在区块链上的基本信息
                    const fundingInfoChain = await FundingGoods.methods.getFudingInfo().call()
                    console.log(fundingInfoChain)
                    // fundingAllInfo.
                    fundingAllInfo.fundingPrice = web3.utils.fromWei(fundingInfoChain[0])
                    fundingAllInfo.target = web3.utils.fromWei(fundingInfoChain[1])
                    fundingAllInfo.validDay = fundingInfoChain[2]
                    fundingAllInfo.fundingState = fundingInfoChain[3]
                    fundingAllInfo.manTimeCount = fundingInfoChain[4] // 表示当前支持的人数
                    fundingAllInfo.fundingEndTimeStamp = fundingInfoChain[5]
                    fundingAllInfo.progress = fundingAllInfo.manTimeCount * fundingAllInfo.fundingPrice / fundingAllInfo.target
                    // 获取存储在ipfs上的基本信息
                    // const fundingInfoAddr = await FundingGoods.methods.fundingInfo().call()
                    // const fundingInfo = await getContract("FundingInfo", fundingInfoAddr)
                    // const fundingInfoHash = await fundingInfo.methods.getFundingInfo().call()
                    // console.log(fundingInfoHash[0])
                    // console.log(fundingInfoHash[1])
                    // const fundingInfoHash1 = fundingInfoHash[0]
                    // const fundingInfoHash2 = fundingInfoHash[1]
                    // const fundingIpfs = await readJsonFromIpfs(fundingInfoHash1, fundingInfoHash2)
                    // 项目名称，项目简介，项目图片，项目单价，项目目标，完成率，还剩剩余时间
                    // console.log(fundingIpfs)

                    // 判断当前的状态是众筹中还是

                    // 获取到Goods的信息
                    const goodsAddr = await FundingGoods.methods.getGoods().call()
                    const Goods = await getContract("Goods", goodsAddr)

                    const goodsInfoHash = await Goods.methods.getGoodsInfo().call()

                    console.log(goodsInfoHash[0])
                    console.log(goodsInfoHash[1])
                    const goodsInfoHash1 = goodsInfoHash[0]
                    const goodsInfoHash2 = goodsInfoHash[1]
                    const goodsIpfs = await readJsonFromIpfs(goodsInfoHash1, goodsInfoHash2)
                    console.log(goodsIpfs)
                    const goodsIpfsV = JSON.parse(goodsIpfs)
                    console.log(goodsIpfsV)
                    fundingAllInfo.goodsName = goodsIpfsV.goodsName
                    fundingAllInfo.goodsSynopsis = goodsIpfsV.goodsSynopsis
                    fundingAllInfo.indexImgs = goodsIpfsV.goodsImgs[0]
                    // fundingAllInfo.timeDiff = this.timeDiffValue(fundingAllInfo.fundingEndTimeStamp)
                    // 商品名，商品简介，商品图片，项目单价，项目目标，完成率，还剩剩余时间
                    // 这个fundingAllInfo.fundingState应该在合约中设置为string
                    console.log(fundingAllInfo.fundingEndTimeStamp)
                    // 根据状态来修改一些东西
                    // if(fundingAllInfo.fundingState === '0') {

                    // } else if (fundingAllInfo.fundingState === '01')
                    if (this.timeDiff(fundingAllInfo.fundingEndTimeStamp) < 0) {
                        fundingAllInfo.timeDiff = "过期"
                        fundingAllInfo.fundingState = '13'
                        const content = `您发起的项目【${fundingAllInfo.goodsName}】众筹失败，您的众筹项目已从主页移除，请您确认修改众筹状态，点击确定后，支持金将会回退到各个支持者账户`
                        confirm({
                            title: '提示',
                            content: content,
                            okText: "马上修改",
                            cancelText: "稍后再提醒",
                            onOk: async () => {
                                // console.log('OK');
                                // 在此处修改链上的数据
                                await FundingGoods.methods.fundingFail().send({
                                    from: account,
                                    gas: '5000000',
                                    value: 0
                                })
                                message.success("修改成功")
                                this.props.history.push("/SponsoredFundingInfo")
                            },
                            onCancel() {
                                console.log('Cancel');
                            },
                        });
                    } else {
                        fundingAllInfo.timeDiff = this.timeDiffValue(fundingAllInfo.fundingEndTimeStamp)
                    }

                    // 遍历当前所有项目所有的订单信息，如果所有的状态都是14的话就表示当前
                    // 订单可以结束了
                    let flag = true
                    const OrderList = await FundingGoods.methods.getOrderList().call()
                    OrderList.map(async (v, i) => {
                        const order = await getContract("Order", v)
                        const orderHashList = await order.methods.getOrder().call()
                        console.log(orderHashList[0])
                        console.log(orderHashList[1])
                        const orderHash1 = orderHashList[0]
                        const orderHash2 = orderHashList[1]
                        const orderInfo = await readJsonFromIpfs(orderHash1, orderHash2)
                        console.log(orderInfo)
                        if (orderInfo.orderState !== '14') {
                            flag = false
                        }
                    })
                    // 提示用户结束当前众筹项目了
                    if (flag && fundingAllInfo.fundingState === '12') {
                        const content = `您发起的项目【${fundingAllInfo.goodsName}】众筹已经完成，您的所有支持者已经全部确认收货，请您确认修改众筹状态为完成`
                        confirm({
                            title: '提示',
                            content: content,
                            okText: "马上修改",
                            cancelText: "稍后再提醒",
                            onOk: async () => {
                                // console.log('OK');
                                // 在此处修改链上的数据
                                await FundingGoods.methods.updateFundingStateFinish().send({
                                    from: account,
                                    gas: '5000000',
                                    value: 0
                                })
                                message.success("修改成功")
                                this.props.history.push("/SponsoredFundingInfo")
                            },
                            onCancel() {
                                console.log('Cancel');
                            },
                        });
                    }

                    if (fundingAllInfo.fundingState === '0') {
                        fundingAllInfo.fundingState = [<Badge count={"众筹进行"} />]
                    } else if (fundingAllInfo.fundingState === '1') {
                        const content = `您发起的项目【${fundingAllInfo.goodsName}】众筹成功，您的众筹项目已从主页移除，请您确认修改众筹状态，点击确定后，您发起本项目所筹得的所有资金将会全部到账，请注意查收`
                        // 在此处提醒卖家
                        confirm({
                            title: '提示',
                            content: content,
                            okText: "马上修改",
                            cancelText: "稍后再提醒",
                            onOk: async () => {
                                // console.log('OK');
                                // 在此处修改链上的数据
                                await FundingGoods.methods.updataFundingStateOnline().send({
                                    from: account,
                                    gas: '5000000'
                                })
                                message.success("修改成功")
                                this.props.history.push("/SponsoredFundingInfo")
                            },
                            onCancel() {
                                console.log('Cancel');
                            },
                        });
                        fundingAllInfo.fundingState = [<Badge count={"众筹成功"} />]
                    } else if (fundingAllInfo.fundingState === '12') {
                        fundingAllInfo.fundingState = [<Badge count={"待发货中"} />]
                    } else if (fundingAllInfo.fundingState === '13') {
                        fundingAllInfo.fundingState = [<Badge count={"众筹失败"} />]
                    } else if (fundingAllInfo.fundingState === '14') {
                        // 要改成众筹完成这个状态就是在发货那里面改的-
                        fundingAllInfo.fundingState = [<Badge count={"众筹完成"} />]
                    }
                    return fundingAllInfo
                })

            )
            console.log(fundingInfoList)
            this.setState({
                fundingInfoList: fundingInfoList,
            })
            hide()
        }
    }

    timeDiff = (endTimeStamp) => {
        let runTime = (Number(endTimeStamp) - Date.now()) / 1000
        return runTime
    }

    // 这个一会要优化，放入到Utils中
    timeDiffValue = (endTimeStamp) => {
        let runTime = (Number(endTimeStamp) - Date.now()) / 1000
        // 求两个时间戳之间相差多少时间
        var year = Math.floor(runTime / 86400 / 365);
        runTime = runTime % (86400 * 365);
        var month = Math.floor(runTime / 86400 / 30);
        runTime = runTime % (86400 * 30);
        var day = Math.floor(runTime / 86400);
        runTime = runTime % 86400;
        var hour = Math.floor(runTime / 3600);
        runTime = runTime % 3600;
        var minute = Math.floor(runTime / 60);
        runTime = runTime % 60;
        var second = parseInt(runTime);
        if (day != 0) {
            return day + "天"
        }
        if (day == 0) {
            return hour + '时'
        } else if (hour == 0) {
            return minute + '分'
        } else if (minute == 0) {
            return second + '秒'
        } else {
            return day + '天'
        }
    }

    render() {
        return (
            <div>
                <List
                    itemLayout="horizontal"
                    bordered={true}
                    header="发起的众筹"
                    dataSource={this.state.fundingInfoList}
                    size="default"
                    description="没有数据"
                    renderItem={item => (
                        <List.Item actions={item.fundingState}>
                            <List.Item.Meta
                                avatar={<Avatar src={ipfsPrefix + item.indexImgs} />}
                                title={item.goodsName}
                                description={item.goodsSynopsis}
                            />
                            {/* 项目单价，项目目标，完成率，还剩剩余时间 */}
                            <div style={{ color: "#C00000" }}>众筹单价：{item.fundingPrice}Ether&nbsp;&nbsp;&nbsp;&nbsp;</div>
                            <div style={{ color: "#C00000" }}>项目目标：{item.target}Ether&nbsp;&nbsp;&nbsp;&nbsp;</div>
                            <div style={{ color: "#C00000" }}>完成率：<Progress type="circle" status="active" percent={item.progress * 100} width={45} />&nbsp;&nbsp;&nbsp;&nbsp;</div>
                            <div style={{ color: "#C00000" }}>剩余时间：{item.timeDiff}&nbsp;&nbsp;</div>
                        </List.Item>
                    )}
                />

            </div>
        );
    }
}

export default SponsoredFundingInfo;