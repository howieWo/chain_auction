import React from 'react'
import {
    web3, AppContract, getContract, saveJsonToIPFS,
    readJsonFromIpfs, ipfsPrefix
} from '../Utils'

import '../App.css'

import { Collapse, Card, Modal, Input, Icon, message, List, Avatar, Drawer, Button } from 'antd';
const Panel = Collapse.Panel;
const confirm = Modal.confirm;
class ToBeShipped extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fundingInfoList: [],
            visible: false,
            detailInfo: {},
            logisticsCompanie: "",
            logisticsOrderId: "",
            order: undefined
        };
        this.init()
    }

    init = async () => {
        // 获取当前账户发起的所有的众筹项目

        // 然后获取所有的订单

        // 然后将所有待发货的订单遍历出来

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

                    // 获取所有的订单信息

                    const orderList = await FundingGoods.methods.getOrderList().call()
                    console.log(orderList)
                    // 获取买家信息，填写卖家信息（自动填写）显示出来
                    // 确认收货这一说，在物流信息抽屉加上一个确认收货按钮，
                    // 发起页面 检测如果全部收货完成 当前订单完成 ，并提示用户修改状态 

                    fundingAllInfo.fundingState = fundingInfoChain[3]
                    // 当前众筹是待发货状态 此处应该为12
                    if (fundingAllInfo.fundingState === "12") {
                        const fundingList = await Promise.all(
                            orderList.map(async (v, i) => {
                                const order = await getContract("Order", v)
                                const orderHashInfo = await order.methods.getOrder().call()
                                let orderObj
                                console.log(orderHashInfo[0])
                                console.log(orderHashInfo[1])
                                const orderHashInfo1 = orderHashInfo[0]
                                const orderHashInfo2 = orderHashInfo[1]
                                const orderIpfsInfo = await readJsonFromIpfs(orderHashInfo1, orderHashInfo2)
                                // 订单状态从众筹中转为发货
                                if (orderIpfsInfo.orderState === '00') {
                                    console.log(orderIpfsInfo)
                                    fundingAllInfo.goodsName = orderIpfsInfo.goodsName
                                    fundingAllInfo.order = order
                                    return orderIpfsInfo
                                }
                            })
                        )
                        fundingAllInfo.orderList = fundingList.filter(d => d)
                        console.log(fundingAllInfo)
                        return fundingAllInfo
                    } else {
                        console.log("elese")
                        fundingAllInfo.orderList = []
                        return fundingAllInfo
                    }
                })
            )
            console.log(fundingInfoList)
            const listV = fundingInfoList.filter(d => d.orderList.length !== 0)
            // console.log(d)
            // if(fundingInfoList.length === 1 && fundingInfoList[0].orderList.length === 0) {
            //     fundingInfoList[0].goodsName = "暂无要发货的商品"
            // }
            if (listV.length === 0) {
                listV[0] = {"goodsName": "暂无要发货的商品"}
            }
            this.setState({
                fundingInfoList: listV,
                user: this.state.user
            })
            hide()
        }
    }

    callback = (key) => {
        console.log(key)
    }

    seeDetail = (orderInfo) => {
        console.log(orderInfo)
        Modal.info({
            okText: '查看完毕',
            title: '用户详细信息',
            content: (
                <div>
                    <p>货物名称: {orderInfo.goodsName} </p>
                    <p>支持者真实姓名：{orderInfo.buyerName}</p>
                    <p>支持者收货地址：{orderInfo.buyerAddress}</p>
                    <p>支持者手机号：{orderInfo.buyerPhoneNumber}</p>
                    <p>支持者邮编：{orderInfo.buyerZipCode}</p>
                    <p>支持者是否需要发票：{orderInfo.buyerIsBill}</p>
                    <p>支持者货物类型：{orderInfo.goodsType[0]}</p>
                    <p>支持者留言：{orderInfo.buyerMess}</p>
                    <p>支持者购买数量： {orderInfo.goodsCount}</p>
                    <p>下单时间：{orderInfo.orderDate}</p>
                </div>

            ),
            onOk() { },
        });
    }

    createLogistics = async () => {
        if (this.state.logisticsCompanie === '') {
            message.error("请填入物流公司名称")
            return
        }
        if (this.state.logisticsOrderId === '') {
            message.error("请填入物流单号")
            return
        }

        confirm({
            title: '提示',
            content: "您是否要填写物流信息，填写后不可修改！",
            okText: "确认",
            cancelText: "稍后再填",
            onOk: async () => {

                const orderInfo = this.state.detailInfo
                console.log(orderInfo)

                orderInfo.logisticsCompanie = this.state.logisticsCompanie
                orderInfo.logisticsOrderId = this.state.logisticsOrderId

                // 取出当前用户的个人信息
                // 放入到发货信息上

                const [account] = await web3.eth.getAccounts()
                console.log(account)
                const userServiceAddr = await AppContract.methods.userService().call()
                const userService = await getContract("UserService", userServiceAddr)
                const userAddr = await userService.methods.getUserByAddress(account).call()

                const user = await getContract("User", userAddr)
                const userHashInfo = await user.methods.getUserInfo().call()
                const userHashInfo1 = userHashInfo[0]
                const userHashInfo2 = userHashInfo[1]
                const goodsIpfs = await readJsonFromIpfs(userHashInfo1, userHashInfo2)
                console.log(goodsIpfs)
                //         orderType: "0"
                // sellerAddress: ""
                // sellerName: ""
                // sellerPhoneNumber: ""
                // sellerZipCode: ""
                orderInfo.orderState = '12'
                orderInfo.sellerAddress = goodsIpfs.ShippingAddress
                orderInfo.sellerName = goodsIpfs.realName
                orderInfo.sellerPhoneNumber = goodsIpfs.phoneNumber
                orderInfo.sellerZipCode = goodsIpfs.zipcode


                const orderIpfsHash = await saveJsonToIPFS(orderInfo)

                const hash1 = orderIpfsHash.slice(0, 23)
                const hash2 = orderIpfsHash.slice(23)
                const hash1Val = web3.utils.asciiToHex(hash1)
                const hash2Val = web3.utils.asciiToHex(hash2)

                await this.state.order.methods.updataOrder(hash1Val, hash2Val).send({
                    from: account,
                    gas: '5000000'
                })

                message.info("填写物流信息成功")
                this.props.history.push("/SponsoredFundingInfo")

            },
            onCancel() {
                console.log('Cancel');
            },
        });


    }

    onComChange = (e) => {
        console.log(e.target.value)
        this.setState({
            logisticsCompanie: e.target.value
        })
    }

    onNoChange = (e) => {
        console.log(e.target.value)
        this.setState({
            logisticsOrderId: e.target.value
        })
    }

    // this.state.detailInfo 这个是当前事件触发相应的信息
    showDrawer = (detailInfo, order) => {
        this.setState({
            visible: true,
            detailInfo: detailInfo,
            order: order
        });
    };

    onClose = () => {
        this.setState({
            visible: false,
        });
    };

    render() {
        // 有多少项目，项目下有多少订单
        console.log(this.state.fundingInfoList)

        return (
            <div>
                <Card
                    size="default"
                    title="待发货订单"
                >
                    {/* {
                this.state.fundingInfoList.length === 0
            } */}
                    <Collapse defaultActiveKey={['1']} onChange={this.callback}
                        expandIcon={(isActive) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
                    >
                        {
                            this.state.fundingInfoList.map((v, i) => {
                                // console.log(v)
                                return <Panel header={v.goodsName} key={i}>
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={v.orderList}
                                        size="default"
                                        // bordered={true}
                                        description="没有数据"
                                        renderItem={item => (
                                            <List.Item actions={[<a onClick={() => this.showDrawer(item, v.order)}>查看详情</a>, <a onClick={() => this.showDrawer(item, v.order)}>填写物流信息</a>]}>
                                                <List.Item.Meta
                                                    avatar={<Avatar src={ipfsPrefix + item.indexImg} />}
                                                    title={item.buyerName}
                                                    description={item.buyerAddress}
                                                />
                                                {/* 项目单价，项目目标，完成率，还剩剩余时间 */}
                                                <div style={{ color: "#C00000" }}>邮编：{item.buyerZipCode}&nbsp;&nbsp;&nbsp;&nbsp;</div>
                                                <div style={{ color: "#C00000" }}>手机号：{item.buyerPhoneNumber}&nbsp;&nbsp;</div>
                                            </List.Item>
                                        )}
                                    />
                                    {/* {
                                    v.orderList.map((v, i) => {

                                    })
                                } */}
                                </Panel>
                            })
                        }
                        {/* <Panel header="This is panel header 1" key="1">
                        <p>{text}</p>
                    </Panel>
                    <Panel header="This is panel header 2" key="2">
                        <p>{text}</p>
                    </Panel> */}
                    </Collapse>
                </Card>

                <Drawer
                    title="详情信息"
                    width={520}
                    closable={false}
                    onClose={this.onClose}
                    visible={this.state.visible}
                >

                    <div style={{ fontSize: "16px" }}>
                        <p>货物名称：{this.state.detailInfo.goodsName} </p>
                        <p>货物类型：{this.state.detailInfo.goodsType}</p>
                        <p>购买数量： {this.state.detailInfo.goodsCount}</p>
                        <p>支持者真实姓名：{this.state.detailInfo.buyerName}</p>
                        <p>支持者收货地址：{this.state.detailInfo.buyerAddress}</p>
                        <p>支持者手机号：{this.state.detailInfo.buyerPhoneNumber}</p>
                        <p>支持者邮编：{this.state.detailInfo.buyerZipCode}</p>
                        <p>支持者是否需要发票：{this.state.detailInfo.buyerIsBill}</p>
                        <p>支持者留言：{this.state.detailInfo.buyerMess}</p>
                        <p>下单时间：{this.state.detailInfo.orderDate}</p>
                    </div>
                    <Card
                        title="填写物流信息"
                    >
                        <div>
                            <h2>
                                物流公司
                            </h2>
                            <Input type="text" placeholder="请填入物流公司名称" onChange={this.onComChange} />
                        </div>
                        <br />
                        <div>
                            <h2>
                                物流单号
                            </h2>
                            <Input type="text" placeholder="请填入物流单号" onChange={this.onNoChange} />
                        </div>
                        <div style={{ float: "right" }}>
                            <div className="buyButton" onClick={this.createLogistics}>填写信息</div>
                        </div>
                    </Card>
                </Drawer>
            </div>


        );
    }
}

export default ToBeShipped;