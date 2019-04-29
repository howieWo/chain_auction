import React from 'react'
import { Link } from 'react-router-dom'
import { Player } from 'video-react';
import {
    message, Progress, Carousel, Tabs, Radio, Modal, Icon, Button,
    Drawer, Row, Col, Badge, Popover, InputNumber, Divider, Input, Checkbox
} from 'antd'
import moment from 'moment'
import {
    web3, AppContract, getContract, saveJsonToIPFS,
    readJsonFromIpfs, ipfsPrefix, getPayGas
} from '../Utils'
import FundingGoodsJson from '../compile/FundingGoods.json'
import "../App.css"
import "../../node_modules/video-react/dist/video-react.css"

const FundingGoodsCode = FundingGoodsJson.bytecode
const RadioButton = Radio.Button;
const confirm = Modal.confirm;
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
class FundingDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            GoodsInfo: {},
            FundingInfo: {},
            tempData: {},
            role: 0, // 0表示普通用户，1表示发起者，2表示网站所有者
            fundingGoods: undefined, // 存放fundingGoods的实例
            account: '',
            goodsType: '',
            goodsNum: 1,
            visible: false,
            user: undefined,
            isCheck: false,
            ShippingAddress: '',
            realName: '',
            phoneNumber: '',
            zipCode: '',
            buyerMess: '',
            billType: '需要',
            indexImgs: '',
            isOrder: 'false',
            userAddr: '',
            fundingGoodsAddr: '',
        };
        this.init()
    }
    init = async () => {

        if (this.props.location.state.sendData !== undefined) {
            const hide = message.loading('数据获取中！请稍后！', 0)
            // // 执行fundingService的相关函数获取到fundingGoodsAddr
            // console.log(fundingService) 
            console.log(this.props.location.state.sendData.FundingInfoV)
            console.log(this.props.location.state.sendData.GoodsInfoV)
            // 对象在放入到state中的时候一定要先对其设置值。
            this.state.GoodsInfo = this.props.location.state.sendData.GoodsInfoV
            this.state.FundingInfo = this.props.location.state.sendData.FundingInfoV
            this.state.tempData = this.props.location.state.sendData.tempData

            // 获取当前众筹商品的所有者
            // 获取fundingService的地址
            const fundingGoodsAddr = this.props.location.state.sendData.tempData.hash
            console.log(fundingGoodsAddr)
            // // 通过地址获取到相关的实例
            const fundingGoods = await getContract("FundingGoods", fundingGoodsAddr)
            console.log(fundingGoods)
            const owner = await fundingGoods.methods.owner().call()
            console.log(owner)

            const [account] = await web3.eth.getAccounts();
            if (owner === account) {
                console.log("这是发起者")
                this.state.role = 1
            }
            const sponsor = await fundingGoods.methods.Sponsor().call()
            if (sponsor === account) {
                console.log("这是网站所有者")
                this.state.role = 2
            }
            // 这里可以改一下后台
            const buyerList = await fundingGoods.methods.getAllBuyers().call()
            console.log(buyerList)
            buyerList.map((v, i) => {
                console.log(account)
                if (v === account) {
                    console.log("当前账号已经支持过当前产品了")
                    this.state.role = 3
                }
            })


            // 获取当前用户的一些信息了
            const userServiceAddr = await AppContract.methods.userService().call()
            const userService = await getContract("UserService", userServiceAddr)

            const a = await userService.methods.getAllUser().call({
                from: account
            })
            console.log(a)
            // 检测是否填写了个人信息，如果没有填写，那么提示填写
            const isCheck = await userService.methods.checkUser(account).call({
                from: account
            })

            if (isCheck) {
                // 获取到当前登录者对应的User实例
                // 这里获取到ipfs，然后从ipfs上获取数据
                // 如果想在合约中取到msg.sender的值，那么必须要声明from
                const UserAddr = await userService.methods.getUserByCurrent().call({
                    from: account
                })

                const user = await getContract("User", UserAddr)
                const userInfoArr = await user.methods.getUserInfo().call()
                const userInfo = await readJsonFromIpfs(userInfoArr[0], userInfoArr[1])
                console.log(userInfo)
                // 填写了个人信息的是true
                // 如果还没有填写，让其填写
                // if(!isCheck) {
                //     Modal.info({
                //         okText: '好的，马上去',
                //         title: '提示',
                //         content: (
                //         <div>
                //             <p>请先点击【个人信息】按钮，完善您的个人信息</p>
                //         </div>
                //         ),
                //         // onOk() {},
                //     });
                // }
                this.setState({
                    GoodsInfo: this.state.GoodsInfo,
                    FundingInfo: this.state.FundingInfo,
                    tempData: this.state.tempData,
                    fundingGoodsAddr: fundingGoodsAddr,
                    role: this.state.role,
                    fundingGoods: fundingGoods,
                    account: account,
                    isCheck: isCheck,
                    user: user,
                    ShippingAddress: userInfo.ShippingAddress,
                    realName: userInfo.realName,
                    phoneNumber: userInfo.phoneNumber,
                    zipCode: userInfo.zipcode,
                    userAddr: UserAddr,
                    goodsType: this.state.GoodsInfo.goodsType
                })
            } else {

                // Modal.info({
                //     okText: '好的，马上去',
                //     title: '提示',
                //     content: (
                //         <div>
                //             <p>请先点击【个人信息】按钮，完善您的个人信息</p>
                //         </div>
                //     ),
                //     // onOk() {},
                // });
                this.state.role = 4
                this.setState({
                    role: this.state.role
                })
            }
            hide()
        } else {
            message.error("未获取到数据，跳转到主页重新获取！")
            this.props.history.push("/")
        }
    }

    state = {
        clicked: false,
        hovered: false,
    };

    hide = () => {
        this.setState({
            clicked: false,
            hovered: false,
        });
    }

    handleHoverChange = (visible) => {
        this.setState({
            hovered: visible,
            clicked: false,
        });
    }

    radioChange = (e) => {
        this.setState({
            goodsType: e.target.value
        })
    }

    numChange = (e) => {
        console.log(e)
        this.setState({
            goodsNum: e
        })
    }

    buyerMessChange = (e) => {
        this.setState({
            buyerMess: e.target.value
        })
        console.log(e.target.value)
    }

    // 是否需要发票
    billRadioChange = (e) => {
        // console.log(e.target.value)
        this.setState({
            billType: e.target.value
        })
    }

    buyButtonChange = () => {
        // 把该取的数据取出来，然后请求合约存储， 调用buy方法
        // alert("asd")
        // 取出当前用户的用户信息，然后保存到自己的发起列表中，
        // 触发购买逻辑，然后保存订单
        // 获取到数量，然后获取到类型
        // 取出数量和类型

        // 这里没有登录弹出这个路况
        if (this.state.role === undefined) {
            confirm({
                title: '声明与政策',
                content: '欢迎您来到链筹！我们依据最新法律法规要求，制定并更新了《隐私政策》、《链筹用户协议》以及《链筹使用协议》。您需阅读并同意相关政策条款方可进行登录。',
                okText: "同意并继续",
                cancelText: "不同意",
                onOk() {
                    console.log('OK');
                },
                onCancel() {
                    console.log('Cancel');
                },
            });
        } else {

            if (!this.state.isCheck) {
                Modal.info({
                    okText: '好的，马上去',
                    title: '提示',
                    content: (
                        <div>
                            <p>请先点击【个人信息】按钮，完善您的个人信息</p>
                        </div>
                    ),
                    // onOk() {},
                });
            } else {
                // 改变隐藏使抽屉弹出
                this.setState({
                    visible: true
                })
            }
        }

        // const fundingPrice = this.state.tempData.fundingPrice
        // const goodsNum = this.state.goodsNum
        // const goodsType = this.state.goodsType
        // this.state.fundingGoods.methods.buy().send({
        //     from: this.state.account,
        //     gas: "5000000",
        //     value: fundingPrice * this.state.goodsNum
        // })



    }

    buyRadioChage = (e) => {
        console.log(e.target.checked)
        if (e.target.checked) {
            this.setState({
                isOrder: true
            })
        } else {
            this.setState({
                isOrder: false
            })
        }
    }

    onClose = () => {
        this.setState({
            visible: false
        })
    }

    createHash = (hashLength) => {
        // 默认长度 24
        return Array.from(Array(Number(hashLength) || 24), () => Math.floor(Math.random() * 36).toString(36)).join('');
    }

    goOrderChange = async () => {
        // 取出相应的数据，然后准备上链
        // 买家的地址，姓名，电话，邮编，
        // 买家是否需要发票，买家留言
        // 购买数量，总价，商品类型
        // 买家的hash值，
        // 订单生成时间
        // 订单的id
        // 订单当前的状态


        // 这个订单不仅包含了物品的信息
        // orderId: '', // 通过时间获取一个不会重复的hash
        // orderType: '' // 订单的类型，是众筹单还是上线单，还是拍卖单
        // orderState: '' // 状态 ，00 表示未生效状态，11 表示已生效状态,待商家发货 12 表示商家已经发货 13 表示买家取消订单，14表示商品下架，eth退到所有用户账户
        // orderDate: '', // 订单生成的时间

        // buyerName: '', // 收货人真实姓名
        // buyerHashAddr: '', // 收货人的hash地址
        // buyerAddress: '', // 收货人地址
        // buyerPhoneNumber: '', // 收货人手机号
        // buyerZipCode: '' ,// 收货人邮编
        // buyerIsBill: '', // 收货人是否需要发票
        // buyerMess: ''， // 收货人的留言信息

        // goodsName: '', // 商品名称
        // goodsHashAddr: '', // 商品hash值
        // goodsType: '', // 商品类型
        // goodsPrice: '', // 是众筹价还是上限价
        // goodsCount: '', // 数量
        // goodsSum: '', // 总价

        // sellerName: '', // 发货人真实姓名
        // sellerHashAddr: '', // 发货人hash地址
        // sellerAddress: '', // 发货人真实地址
        // sellerPhoneNumber: '', // 发货人手机号
        // sellerZipCode: '', // 发货人邮编

        // logisticsCompanie: '', // 物流公司
        // logisticsOrderId: '', // 物流单号

        let orderInfo = {}
        // 订单的一些状态
        orderInfo.orderId = this.createHash(36)
        orderInfo.orderType = '0' // 订单的类型，是众筹单还是上线单，还是拍卖单
        orderInfo.orderDate = moment().format("YYYY-MM-DD HH:mm:ss")
        orderInfo.orderState = "00"

        orderInfo.buyerName = this.state.realName // 收货人真实姓名
        orderInfo.buyerHashAddr = this.state.userAddr // 收货人的hash地址
        orderInfo.buyerAddress = this.state.ShippingAddress // 收货人地址
        orderInfo.buyerPhoneNumber = this.state.phoneNumber // 收货人手机号
        orderInfo.buyerZipCode = this.state.zipCode // 收货人邮编
        orderInfo.buyerIsBill = this.state.billType // 收货人是否需要发票
        orderInfo.buyerMess = this.state.buyerMess // 收货人的留言信息

        orderInfo.goodsName = this.state.tempData.goodsName // 商品名称
        orderInfo.goodsHashAddr = this.state.tempData.hash // 商品hash值
        orderInfo.goodsType = this.state.goodsType // 商品类型
        orderInfo.goodsPrice = this.state.tempData.fundingPrice // 是众筹价还是上限价
        orderInfo.goodsCount = this.state.goodsNum // 数量
        orderInfo.goodsSum = this.state.tempData.fundingPrice * this.state.goodsNum // 总价
        orderInfo.goodsSynopsis = this.state.GoodsInfo.goodsSynopsis

        orderInfo.fundingGoodsAddr = this.state.fundingGoodsAddr
        orderInfo.indexImg = this.state.tempData.indexImgs[0]

        orderInfo.sellerName = '' // 发货人真实姓名
        orderInfo.sellerHashAddr = '' // 发货人hash地址
        orderInfo.sellerAddress = '' // 发货人真实地址
        orderInfo.sellerPhoneNumber = '' // 发货人手机号
        orderInfo.sellerZipCode = '' // 发货人邮编

        orderInfo.logisticsCompanie = '' // 物流公司
        orderInfo.logisticsOrderId = '' // 物流单号

        confirm({
            title: '支付前提示',
            content: '您确定要支持本产品吗，一旦支持后不可取消订单',
            okText: "确定",
            cancelText: "取消",
            onOk: async () => {
                // 先将数据存储到IPFS上，然后调用FundingGoods的buy方法，进行支付
                // 最后将hash 的hash值存储起来

                const orderIpfsHash = await saveJsonToIPFS(orderInfo)
                const hide = message.loading('生成订单中，请稍后！');
                console.log("存储的hash为" + orderIpfsHash)
                const hash1 = orderIpfsHash.slice(0, 23)
                const hash2 = orderIpfsHash.slice(23)
                const hash1Val = web3.utils.asciiToHex(hash1)
                const hash2Val = web3.utils.asciiToHex(hash2)
                console.log(this.state.tempData.fundingPrice * this.state.goodsNum)
                const value = (this.state.tempData.fundingPrice * this.state.goodsNum).toString()

                await this.state.fundingGoods.methods.createOrder(hash1Val, hash2Val).send({
                    from: this.state.account,
                    gas: '5000000'
                })

                await this.state.fundingGoods.methods.buy().send({
                    from: this.state.account,
                    gas: '5000000',
                    value: web3.utils.toWei(value)
                })

                const newOrder = await this.state.fundingGoods.methods.newOrder().call()
                console.log(newOrder)
                await this.state.user.methods.setOrderList(newOrder).send({
                    from: this.state.account,
                    gas: '5000000'
                })

                hide()
                message.success("支持成功!", 4)
                // this.forceUpdate()
                this.props.history.push("/FundingDetail")
                // await fundingGoods.methods.buy().send({
                //     from: accounts[3],
                //     value: fundingPrice,
                //     gas: '5000000'
                // })
            },
            onCancel() {
                console.log('Cancel');
            },
        });


        console.log(JSON.stringify(orderInfo))

    }

    render() {
        console.log(this.state.tempData)
        // 鼠标放上显示的东西
        const hoverContent = (
            <div>
                <div>
                    <span style={{ fontSize: "14px", fontWeight: "bold" }}>满99包邮</span>
                    <br /><br />
                    本商品满99元可包邮，不足99元收取运费10元<br /><br />
                </div>

                <div>
                    <span style={{ fontSize: "14px", fontWeight: "bold" }}>链筹三方</span> <br />
                    <br />本商品为链筹精选精品，第三方品牌方为实际销售方<br />
                    <br />链筹精心挑选，严格把关，为您精选品质上乘的精品商品。<br /><br />
                </div>

                <div>
                    <span style={{ fontSize: "14px", fontWeight: "bold" }}> 由{this.state.FundingInfo.teamIntroduce}发货并提供售后</span>
                    <br /><br />
                </div>

                <div>
                    <span style={{ fontSize: "14px", fontWeight: "bold" }}>7天无理由</span>
                    <br /><br />
                    本商品支持7天无理由退换货<br /><br />
                </div>
                <div>
                    <span style={{ fontSize: "14px", fontWeight: "bold" }}>平台运费说明</span>
                    <br /><br />
                    由链筹平台发货的链筹商品,单笔满150元免运费,不满150元收取10元运费;
                    <br /><br />
                    有品平台三方商品,单笔订单满99元免运费,不满99元收取10元运费;
                    <br /><br />
                    特殊商品需要单独收取运费,具体以实际结算金额为准;
                    <br /><br />
                    优惠券不能抵扣运费。
                    <br /><br />
                </div>
                <div>
                    <span style={{ fontSize: "14px", fontWeight: "bold" }}>退换货运费声明</span>
                    <br /><br /> 非质量问题退换货,运费不予返还;
                    <br /><br /> 因质量问题退换货,运费予以返还,多件产品只退部分产品时,运费按比例返还;
                    <br /><br /> 电视为大件商品,无质量问题退货产生的运费由购买者承担,从退款中直接扣除。
                </div>
            </div>
        );

        const strokeColor = JSON.stringify({
            from: '#108ee9',
            to: '#87d068',
        })
        return (
            <div style={{ marginTop: "55px" }}>
                {/* goodsImgs goodsDecImgs */}
                <Row style={{ backgroundColor: "#fff", padding: "40px" }}>
                    <Col style={{ padding: "20px" }} span={12}>
                        <Carousel autoplay style={{ height: "560px", width: "440px" }}>
                            {
                                this.state.GoodsInfo.goodsImgs.map((v, i) => {
                                    return <div key={i}><img style={{ height: "560px", width: "100%" }} src={`${ipfsPrefix}${v}`} /></div>
                                })
                            }
                        </Carousel>
                    </Col>
                    <Col style={{ padding: "20px" }} span={12}>
                        <div>
                            <span style={{ fontSize: "24px", fontWeight: "500" }}>
                                {this.state.GoodsInfo.goodsName} <Badge style={{ marginLeft: "5px" }} count="筹款中" />
                            </span>
                        </div>
                        <div>
                            <span style={{ color: "#C00000", fontSize: "12px" }}>
                                {this.state.GoodsInfo.goodsSynopsis}
                            </span>
                        </div>
                        {/* 售价卡片的位置 */}
                        <div style={{
                            width: "100%", height: "185px",
                            marginTop: "26px", padding: "20px", backgroundColor: "#F9F9F9"
                        }}>
                            <div>
                                <span>售价</span>
                                <span style={{ fontSize: "40px", marginLeft: "40px", color: "#C00000" }}>{this.state.tempData.fundingPrice}</span>
                                <span style={{ color: "#C00000" }}>Ether</span>
                            </div>
                            <div style={{ marginTop: "24px" }}>
                                <span>
                                    服务
                                    <Popover
                                        style={{ width: 500 }}
                                        content={hoverContent}
                                        title="服务注意事项"
                                        trigger="hover"
                                        visible={this.state.hovered}
                                        onVisibleChange={this.handleHoverChange}
                                    >
                                        <Icon style={{ color: "#c00000", marginLeft: "5px" }} type="info-circle" />
                                    </Popover>
                                </span>
                                <span style={{ marginLeft: "15px", fontSize: "18px" }}>
                                    <Icon style={{ color: "#c00000" }} type="check-circle" />
                                    满0.1Ether包邮
                                </span>
                                <span style={{ marginLeft: "15px", fontSize: "18px" }}>
                                    <Icon style={{ color: "#c00000" }} type="check-circle" />
                                    链筹三方
                                </span>
                                <span style={{ marginLeft: "15px", fontSize: "18px" }}>
                                    <Icon style={{ color: "#c00000" }} type="check-circle" />
                                    七天无理由
                                </span>
                                <br />
                                <span style={{ marginLeft: "15px", fontSize: "18px", marginLeft: "60px" }}>
                                    <Icon style={{ color: "#c00000" }} type="check-circle" />
                                    由{this.state.FundingInfo.teamIntroduce}发货并提供售后
                                </span>
                            </div>
                        </div>
                        <div style={{ paddingTop: "20px" }}>
                            {/* 物流信息 */}
                            物流
                            <span style={{ marginLeft: "20px" }}>
                                预计众筹成功后{this.state.FundingInfo.estimatedShipment}天内发货
                            </span>
                        </div>
                        <div style={{ paddingTop: "20px" }}>
                            <span style={{ fontSize: "26px", color: "#c00000" }}>
                                {this.state.tempData.manTimeCount}
                            </span>
                            <span style={{ color: "#000", paddingLeft: "8px" }}>人支持</span>
                            <div style={{ float: "right" }}>
                                <span style={{ color: "#000", paddingRight: "10px" }}>达成</span>
                                <span style={{ fontSize: "26px", color: "#c00000" }}>
                                    {this.state.tempData.progress * 100}%
                                </span>
                            </div>
                        </div>
                        <div>

                            <Progress
                                strokeColor={strokeColor}
                                percent={this.state.tempData.progress * 100}
                                status="active"
                                type="line"
                            />


                        </div>
                        <div style={{ paddingTop: "8px" }}>
                            <span style={{ color: "#c00000" }}>
                                {this.state.tempData.fundingSum}
                            </span>
                            <span style={{ color: "#000", paddingLeft: "8px" }}>已筹</span>
                            <div style={{ float: "right" }}>
                                <span style={{ color: "#000", paddingRight: "10px" }}>剩余时间</span>
                                <span style={{ color: "#c00000" }}>
                                    {this.state.tempData.timeDiff}
                                </span>
                            </div>
                        </div>
                        <div style={{ marginTop: "20px" }}>
                            <div>
                                <span>型号</span>
                                <RadioGroup onChange={this.radioChange} style={{ marginLeft: "30px" }} size="large">
                                    {
                                        this.state.GoodsInfo.goodsType.map((v, i) => {
                                            return <RadioButton key={i} value={v}>{v}</RadioButton>
                                        })
                                    }
                                </RadioGroup>
                            </div>
                        </div>
                        <div style={{ paddingTop: "14px" }}>
                            数量
                            <InputNumber
                                min={1}
                                max={3}
                                defaultValue={1}
                                size="large"
                                style={{ marginLeft: "30px" }}
                                onChange={this.numChange}
                            />
                        </div>
                        {
                            console.log("当前的权限" + this.state.role)
                        }
                        {
                            this.state.role === 0 || this.state.role === 4
                                ? <div className="buyButton" onClick={this.buyButtonChange}>立即支持</div>
                                : this.state.role === 3
                                    ? <div className="buyButtonDis">您已支持过该项目</div>
                                    : <div className="buyButtonDis">不可支持自己的项目</div>
                        }

                    </Col>

                </Row>
                <Row>
                    <Col span={19}>
                        <Tabs defaultActiveKey="1" size="large" style={{ backgroundColor: "#E7E7E7", marginTop: "30px" }}>
                            <TabPane tab="产品详情" key="1" style={{ paddingLeft: "14px" }}>
                                <div style={{ width: "99%" }} >
                                    <Player ref="player" videoId="video-1" autoPlay>
                                        <source src={ipfsPrefix + this.state.GoodsInfo.goodsDecVideo} />
                                    </Player>
                                </div>
                                {
                                    this.state.GoodsInfo.goodsDecImgs.map((v, i) => {
                                        return <img key={i} src={ipfsPrefix + v} />
                                    })
                                }
                            </TabPane>
                            <TabPane tab="常见问题" key="2" style={{ paddingLeft: "14px" }}>
                                {
                                    this.state.FundingInfo.frequentlyQuestions.map((v, i) => {
                                        return <img key={i} src={ipfsPrefix + v} />
                                    })
                                }
                            </TabPane>
                            <TabPane tab="项目进展" key="3" style={{ paddingLeft: "14px" }}>
                                {
                                    this.state.FundingInfo.projectScheduleImgs.map((v, i) => {
                                        return <img key={i} src={ipfsPrefix + v} />
                                    })
                                }
                            </TabPane>
                            <TabPane tab="产品报告" key="4" style={{ paddingLeft: "14px" }}>
                                {
                                    this.state.FundingInfo.examiningReport.map((v, i) => {
                                        return <img key={i} src={ipfsPrefix + v} />
                                    })
                                }
                            </TabPane>
                            <TabPane tab="团队介绍" key="5" style={{ paddingLeft: "14px" }}>
                                {
                                    this.state.FundingInfo.teamImgs.map((v, i) => {
                                        return <img key={i} src={ipfsPrefix + v} />
                                    })
                                }
                            </TabPane>
                        </Tabs>
                    </Col>
                    <Col span={5}>

                    </Col>
                </Row>
                <Drawer
                    width={700}
                    placement="right"
                    closable={true}
                    onClose={this.onClose}
                    visible={this.state.visible}
                >
                    <Row>
                        <Col span={24}>
                            <span style={{ fontSize: "26px" }}>
                                收货地址
                            </span>
                            <div style={{
                                width: "250px", height: "200px", border: "1px solid #2FAC6A",
                                marginTop: "24px", padding: "30px"
                            }}>
                                <span style={{ fontSize: "20px" }}>
                                    {this.state.realName}
                                </span>
                                <br />
                                {/* <div style={{}}></div> */}
                                <div style={{ marginTop: "15px" }}>
                                    <span>
                                        {
                                            this.state.phoneNumber.substr(0, 3) + '****' + this.state.phoneNumber.substr(7)
                                        }
                                    </span >
                                    <br />
                                    <span style={{ color: "#999999" }}>
                                        {this.state.ShippingAddress}
                                    </span>
                                    <br />
                                    <span style={{ color: "#999999" }}>
                                        {this.state.zipCode}
                                    </span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} style={{ marginTop: "40px" }}>
                            <div style={{ width: "100%" }}>
                                <span style={{ fontSize: "24px" }}>支付方式</span>
                                <span style={{ display: "inline-block", marginLeft: "30px" }}>以太币在线支付</span>
                            </div>
                        </Col>
                    </Row>
                    <Divider />
                    <Row>
                        <Col span={24}>
                            <div style={{ width: "100%" }}>
                                <span style={{ fontSize: "24px" }}>配送方式</span>
                                <span style={{ display: "inline-block", marginLeft: "30px" }}>快递配送</span>
                            </div>
                        </Col>
                    </Row>
                    <Divider />
                    <Row>
                        <Col span={24}>
                            <div style={{ width: "100%" }}>
                                <span style={{ fontSize: "24px" }}>是否需要发票</span>
                                {/* <span style={{display: "inline-block", marginLeft: "30px"}}>
                                    
                                </span> */}
                                <RadioGroup onChange={this.billRadioChange} defaultValue="需要" style={{ marginLeft: "30px" }} size="large">
                                    <RadioButton value="需要">需要</RadioButton>
                                    <RadioButton value="不需要">不需要</RadioButton>
                                </RadioGroup>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} style={{ marginTop: "20px" }}>
                            <div style={{ width: "100%" }}>
                                <span style={{ fontSize: "24px" }}>买家留言</span>
                                {/* <span style={{display: "inline-block", marginLeft: "30px"}}>快递配送</span> */}
                                <Input.TextArea style={{ marginTop: "10px" }} rows={4} onChange={this.buyerMessChange}></Input.TextArea>
                            </div>
                        </Col>
                    </Row>
                    <Divider />
                    <Row>
                        <Col span={24} style={{ marginTop: "20px" }}>
                            <div style={{ width: "100%" }}>
                                <span style={{ fontSize: "24px" }}>商品信息</span>
                                <span style={{ display: "inline-block", marginLeft: "30px" }}>（邮费 0.00Ether）</span>
                            </div>
                        </Col>
                    </Row>
                    <Divider />
                    <Row>
                        <Col span={24} >
                            <div style={{ width: "100%" }}>
                                <Row>
                                    <Col span={4}>
                                        <img style={{ width: "60px", height: "60px" }} src={ipfsPrefix + this.state.tempData.indexImgs[0]} />
                                    </Col>
                                    <Col span={4}>
                                        <span style={{ fontSize: "18px" }}>
                                            {this.state.tempData.goodsName}
                                        </span>

                                        <br />
                                        <Icon style={{ color: "#c00000" }} type="check-circle" />
                                        七天无理由退货
                                    </Col>
                                    <Col span={8}>
                                        {/* {parseInt(this.state.goodsNum)} */}
                                        <InputNumber
                                            min={1}
                                            max={3}
                                            defaultValue={parseInt(this.state.goodsNum)}
                                            size="large"
                                            style={{ marginLeft: "30px" }}
                                            onChange={this.numChange}
                                        />
                                    </Col>
                                    <Col span={5}>
                                        <span style={{ fontSize: "20px", lineHeight: "60px" }}>
                                            {this.state.tempData.fundingPrice}Ether × {this.state.goodsNum}
                                        </span>
                                    </Col>
                                    <Col span={3}>
                                        <span style={{ fontSize: "20px", lineHeight: "60px" }}>
                                            {this.state.tempData.fundingPrice * this.state.goodsNum}Ether
                                        </span>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>
                    <Divider />
                    <Row style={{ marginTop: "20px" }}>
                        <Col span={24}>
                            <div style={{ float: "right", fontSize: "16px" }}>
                                商品总价：
                                <span style={{ color: "#C63821" }}>
                                    {this.state.tempData.fundingPrice * this.state.goodsNum}Ether
                                </span>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <div style={{ float: "right", fontSize: "16px" }}>
                                运费 ：
                                <span style={{ color: "#C63821" }}>
                                    0Ether
                                </span>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <div style={{ float: "right", fontSize: "16px" }}>
                                优惠：
                                <span style={{ color: "#C63821" }}>
                                    0Ether
                                </span>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <div style={{ float: "right", fontSize: "23px", marginTop: "20px" }}>
                                合计：
                                <span style={{ color: "#C63821" }}>
                                    {this.state.tempData.fundingPrice * this.state.goodsNum}Ether
                                </span>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <div style={{ userSelect: "none", float: "right", fontSize: "16px", marginTop: "20px" }}>
                                <Checkbox onChange={this.buyRadioChage}>您购买即视为同意
                                <a href="https://www.baidu.com" style={{ color: "#2FAC6A" }}>《链筹支持者协议》</a></Checkbox >
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <div style={{ float: "right", fontSize: "16px", marginTop: "10px" }}>
                                {this.state.isOrder === true
                                    ? this.state.role === 0
                                        ? <div className="goOrderButton" onClick={this.goOrderChange}>去下单</div>
                                        : <div className="goOrderButtonDis">去下单</div>
                                    : <div className="goOrderButtonDis">去下单</div>
                                }
                            </div>
                        </Col>
                    </Row>
                </Drawer>
            </div>
        );
    }
}

export default FundingDetail;