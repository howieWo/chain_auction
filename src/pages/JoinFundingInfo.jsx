import React from 'react'
import {
    web3, AppContract, getContract, saveJsonToIPFS,
    readJsonFromIpfs, ipfsPrefix
} from '../Utils'
import '../App.css'
import { Modal, List, Avatar, message, Drawer, Icon, Steps, Badge, Row, Col } from 'antd'
const Step = Steps.Step;
const confirm = Modal.confirm;
class JoinFundingInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            orderInfoList: [],
            visible: false,
            logisticsCompanie: '',
            logisticsOrderId: '',
            sellerName: '',
            sellerAddress: '',
            phoneNumber: '',
            zipcode: '',
            orderInfo: '',
            order: undefined
        };
        this.init()
    }

    onShowClick = (orderInfo) => {
        const logisticsOrderId = orderInfo.logisticsOrderId
        const logisticsCompanie = orderInfo.logisticsCompanie
        const sellerName = orderInfo.sellerName
        const sellerAddress = orderInfo.sellerAddress
        const sellerPhoneNumber = orderInfo.sellerPhoneNumber
        const sellerZipCode = orderInfo.sellerZipCode
        const order = orderInfo.order
        console.log(logisticsOrderId, logisticsCompanie, sellerName, sellerAddress, sellerPhoneNumber, sellerZipCode)
        this.setState({
            logisticsOrderId: logisticsOrderId,
            logisticsCompanie: logisticsCompanie,
            sellerName: sellerName,
            sellerAddress: sellerAddress,
            phoneNumber: sellerPhoneNumber,
            zipcode: sellerZipCode,
            orderInfo: orderInfo, // 订单信息
            order: order,   // 订单实例
            visible: true,
        })
    }

    onClose = () => {
        this.setState({
            visible: false
        })
    }
    // 打开抽屉之后当前页面没有动过，所以state一直没有动
    confirmReceipt = async () => {
        confirm({
            title: '提示',
            content: "您是否要确认收货，一旦确认不可修改！",
            okText: "确认",
            cancelText: "稍后再确认",
            onOk: async () => {

                // 修改当前订单的状态为14
                console.log(this.state.order)
                const orderInfo = this.state.orderInfo
                console.log(orderInfo)
                if (orderInfo.orderState == '12') {
                    orderInfo.orderState = '14' // 完成状态
                    orderInfo.order = '毕设终于要做完了'

                    const orderIpfsHash = await saveJsonToIPFS(orderInfo)

                    const hash1 = orderIpfsHash.slice(0, 23)
                    const hash2 = orderIpfsHash.slice(23)
                    const hash1Val = web3.utils.asciiToHex(hash1)
                    const hash2Val = web3.utils.asciiToHex(hash2)

                    await this.state.order.methods.updataOrder(hash1Val, hash2Val).send({
                        from: this.state.account,
                        gas: '5000000'
                    })

                    message.info("确认收货完成")
                    this.props.history.push("/JoinFundingInfo")
                }

            },
            onCancel() {
                console.log('Cancel');
            },
        });

    }

    // init() {}
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
            const orderList = await user.methods.getOrderList().call()
            console.log(orderList)
            // 此处应该是从后往前开始遍历
            const hide = message.loading('数据获取中！请稍后！', 0)
            const orderInfoList = await Promise.all(
                // 把这个结果返回
                orderList.map(async (v, i) => {
                    const order = await getContract("Order", v)
                    // const orderHash1 = await order.methods.order(0).call()
                    // const orderHash2 = await order.methods.order(1).call()
                    // console.log(orderHash1)
                    // console.log(orderHash2)
                    // const orderInfo = await readJsonFromIpfs(orderHash1, orderHash2)
                    const orderHashList = await order.methods.getOrder().call()
                    console.log(orderHashList[0])
                    console.log(orderHashList[1])
                    const orderHash1 = orderHashList[0]
                    const orderHash2 = orderHashList[1]
                    const orderInfo = await readJsonFromIpfs(orderHash1, orderHash2)
                    orderInfo.order = order
                    const fundingGoodsAddr = orderInfo.fundingGoodsAddr
                    const FundingGoods = await getContract("FundingGoods", fundingGoodsAddr)

                    let fundingState = await FundingGoods.methods.getFundingState().call()
                    console.log(orderInfo.orderState)
                    // orderInfo.orderState = '12'
                    // 状态 ，00 表示未生效状态，11 表示已生效状态,待商家发货 12 表示商家已经发货 13 众筹失败，14表示商品下架，eth退到所有用户账户
                    if (fundingState === '0') {
                        orderInfo.orderState = [<Badge count={"众筹进行"} />]
                    } else if (fundingState === '1') {
                        orderInfo.orderState = [<Badge count={"众筹成功"} />]
                    } else if (fundingState === '12') {
                        if (orderInfo.orderState === '00') {
                            orderInfo.orderState = [<Badge count={"等待发货"} />]
                        } else {
                            orderInfo.orderState = [<Badge count={"已经发货"} />,
                            <span style={{ color: "#c00000", marginLeft: "5px" }} onClick={() => this.onShowClick(orderInfo)} type="info-circle" >查看物流</span>]
                        }
                    } else if (fundingState === '13') {
                        orderInfo.orderState = [<Badge count={"众筹失败，支持金额已经回退，请注意查收"} />]
                    } else if (fundingState === '14') {
                        if (orderInfo.orderState === '14') {
                            orderInfo.orderState = [<Badge count={"众筹完成"} />]
                        } else { // 这个else 应该不会走，以防万一，因为fundngstate等于14要晚于orderstate等于14
                            orderInfo.orderState = [<Badge count={"已经发货"} />,
                            <span style={{ color: "#c00000", marginLeft: "5px" }} onClick={() => this.onShowClick(orderInfo)} type="info-circle" >查看物流</span>]
                        }
                    }
                    return orderInfo
                })
            )

            console.log(orderInfoList)

            this.setState({
                orderInfoList: orderInfoList,
                account: account
            })
            hide()
        }

    }

    render() {
        const { orderInfoList } = this.state.orderInfoList
        return (
            <div>
                <List
                    itemLayout="horizontal"
                    bordered={true}
                    header="参与的众筹"
                    dataSource={this.state.orderInfoList}
                    size="default"
                    description="没有数据"
                    renderItem={item => (
                        <List.Item actions={item.orderState}>
                            <List.Item.Meta
                                avatar={<Avatar src={ipfsPrefix + item.indexImg} />}
                                title={item.goodsName}
                                description={item.goodsSynopsis}
                            />
                            <div style={{ color: "#C00000" }}>类型：{item.goodsType}&nbsp;&nbsp;&nbsp;&nbsp;</div>
                            <div style={{ color: "#C00000" }}>数量：{item.goodsCount}&nbsp;&nbsp;&nbsp;&nbsp;</div>
                            <div style={{ color: "#C00000" }}>单价：{item.goodsPrice}Ether&nbsp;&nbsp;&nbsp;&nbsp;</div>
                            <div style={{ color: "#C00000" }}>总价：{item.goodsSum}Ether&nbsp;&nbsp;</div>
                        </List.Item>
                    )}
                />
                <Drawer
                    title="物流信息"
                    width={480}
                    onClose={this.onClose}
                    visible={this.state.visible}
                >
                    <h1>物流公司：{this.state.logisticsCompanie}</h1>
                    <h2>物流单号：{this.state.logisticsOrderId}</h2>
                    <Row gutter={16}>
                        <Col span={12}>
                            商家姓名：{this.state.sellerName}
                        </Col>
                        <Col span={12}>
                            商家地址： {this.state.sellerAddress}
                        </Col>
                        <Col span={12}>
                            商家手机号： {this.state.phoneNumber}
                        </Col>
                        <Col span={12}>
                            商家邮编： {this.state.zipcode}
                        </Col>
                    </Row>
                    <br /><br />
                    <Steps direction="vertical" size="small" current={6}>
                        <Step title="1" description="10:48:43商品已经下单" />
                        <Step title="2" description="15:31:48包裹正在等待揽收" />
                        <Step title="3" description="17:21:12[杭州市]萧山闻堰的老方[18858268801]已揽收" />
                        <Step title="4" description="20:43:35【杭州市】快件已从萧山闻堰发出，准备发往济南中转部" />
                        <Step title="5" description="22:57:59[嘉兴市]快件已到达杭州中转部" />
                        <Step title="6" description="22:59:55【嘉兴市】快件已从杭州中转部发出，准备发往济南中转部" />
                    </Steps>

                    <div style={{ float: "right" }}>
                        <div className="buyButton" onClick={this.confirmReceipt}>确认收货</div>
                    </div>
                    <br /><br /><br /><br />
                </Drawer>
            </div>

        );
    }
}

export default JoinFundingInfo;