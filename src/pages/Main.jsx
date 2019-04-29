import React from 'react'
import { Link } from 'react-router-dom'
import { Empty, Carousel, Statistic, Icon, Card, Progress, message } from 'antd'
import {
    web3, AppContract, getContract, saveJsonToIPFS,
    readJsonFromIpfs, ipfsPrefix, saveImageToIpfs
} from '../Utils'
import moment, { min } from 'moment'
import '../App.css'
class Main extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            fundingGoodsAddrList: [],
            GoodsInfo: {},
            FundingInfo: {},
            showInfo: [],
            fundingManTimeCount: 0,
            fundingSum: 0, // 总支持的资金
            fundingCount: 0, // 总支持的项目个数
            fundingComingEnd: [],
            fundingNewOnline: [],
            fundingInfo: [], // 所有数据
            fundingInfoMap: [],
        }
        this.init()
    }

    componentWillMount = async () => {

    }
    init = async () => {
        const hide = message.loading('加载中...');

        // 检测状态是0，而且没有过期的

        // 加载数据，显示出框
        // console.log(JSON.stringify(this.state.GoodsInfo))
        // 从FundingService中取出所有的FundingGoods
        const fundingServiceAddr = await AppContract.methods.fundingService().call()

        const fundingService = await getContract("FundingService", fundingServiceAddr)
        // for()
        const fundingCount = await fundingService.methods.getFungindGoodsCount().call()
        if (fundingCount > 0) {

            const list = await fundingService.methods.getFundingList().call()
            this.setState({
                fundingGoodsAddrList: list
            })
            list.map(async (FundingGoodsAddr, i) => {
                let tempData = {}
                // 需要获取到rotimgs，indeximgs,count, fundingprice，fundingstate，fundingtarget
                // 日期_validDay，fundingName，剩余时间，

                // 支持总人数 // 支持总价格 // 支持总商品

                // 通过地址获取到fundingGoods
                console.log(FundingGoodsAddr)
                const fundingGoods = await getContract("FundingGoods", FundingGoodsAddr)
                const fundingPriceInfo = await fundingGoods.methods.getFudingInfo().call()
                tempData.hash = FundingGoodsAddr
                tempData.fundingPrice = web3.utils.fromWei(fundingPriceInfo[0])
                tempData.target = web3.utils.fromWei(fundingPriceInfo[1])
                tempData.validDay = fundingPriceInfo[2]
                tempData.fundingState = fundingPriceInfo[3]
                tempData.manTimeCount = fundingPriceInfo[4] // 表示当前支持的人数
                // tempData.fundingStartDate = fundingPriceInfo[5]
                tempData.fundingEndTimeStamp = fundingPriceInfo[5]
                tempData.progress = tempData.manTimeCount * tempData.fundingPrice / tempData.target
                this.state.fundingManTimeCount += Number(tempData.manTimeCount) // 总支持的人数
                this.state.fundingCount = fundingCount // 项目总个数
                this.state.fundingSum += Number(tempData.manTimeCount) * Number(tempData.fundingPrice)
                tempData.fundingSum = Number(tempData.manTimeCount) * Number(tempData.fundingPrice)
                // console.log(fundingGoods)
                const timeDiff = this.timeDiff(tempData.fundingEndTimeStamp)
                if (tempData.fundingState == 0 && timeDiff >= 0) {
                    const GoodsAddr = await fundingGoods.methods.getGoods().call()
                    const FundingInfoAddr = await fundingGoods.methods.fundingInfo().call()
                    const Goods = await getContract("Goods", GoodsAddr)
                    const FundingInfo = await getContract("FundingInfo", FundingInfoAddr)
                    const GoodsHash = await Goods.methods.getGoodsInfo().call()
                    const FungingInfoHash = await FundingInfo.methods.getFundingInfo().call()
                    console.log(FungingInfoHash)
                    console.log(GoodsHash)
                    let GoodsJson
                    let FundingJson
                    if (FungingInfoHash.length == 2 && GoodsHash.length === 2) {
                        GoodsJson = await readJsonFromIpfs(GoodsHash[0], GoodsHash[1])
                        FundingJson = await readJsonFromIpfs(FungingInfoHash[0], FungingInfoHash[1])
                        // let GoodsInfo = {}
                        // let FundingInfo = {}

                        const GoodsInfoV = JSON.parse(GoodsJson)
                        const FundingInfoV = JSON.parse(FundingJson)
                        console.log(FundingInfoV)

                        tempData.goodsName = GoodsInfoV.goodsName
                        tempData.indexImgs = GoodsInfoV.indexImgs
                        tempData.rotationImgs = GoodsInfoV.rotationImgs
                        tempData.teamName = FundingInfoV.teamIntroduce
                        
                        // const mine = moment(tempData.fundingStartDate, "MM/DD/YYYY").fromNow()
                        // console.log(mine)
                        // console.log(Date.now())
                        // const endTime = moment().add(10, "days").format("YYYY-MM-DD HH:mm:ss")
                        // var date = moment(endTime).format()
                        // const timestamp = moment(date).format("x")
                        // console.log(timestamp)
                        const timeDiff = this.timeDiffValue(tempData.fundingEndTimeStamp)
                        // 这个就是即将要完成的了。
                        tempData.timeDiff = timeDiff
                        if (timeDiff.charAt(timeDiff.length - 1) != "天") {
                            if (this.state.fundingComingEnd.length < 8) {
                                this.state.fundingComingEnd.push(tempData)
                                this.setState({
                                    fundingComingEnd: this.state.fundingComingEnd
                                })
                            }
                        }
                        let tempFundingInfo = {}
                        tempFundingInfo.GoodsInfoV = GoodsInfoV
                        tempFundingInfo.FundingInfoV = FundingInfoV
                        tempFundingInfo.tempData = tempData
                        this.state.fundingInfo.push(tempFundingInfo)
                        console.log("项目总个数" + this.state.fundingCount)
                        // console.log(GoodsInfoV.indexImgs)
                        // 从showInfo中从后往前取八个就是最新添加的数据
                        this.state.showInfo.push(tempData)
                        // let tem = {}
                        // tem.hash = 
                        this.setState({
                            GoodsInfo: GoodsInfoV,
                            FundingInfo: FundingInfoV,
                            showInfo: this.state.showInfo,
                            fundingInfo: this.state.fundingInfo
                        })
                    }
                }
            })
            // var len
            // if(this.state.fundingCount < 8) {
            //     len = this.state.fundingCount
            // } else {
            //     len = 8
            // }
            // for(let i = 0;i<len;i++) {
            //     this.state.fundingNewOnline[i] = this.state.showInfo[this.state.showInfo.length-i-1]
            //     this.setState({
            //         fundingNewOnline: this.state.fundingNewOnline
            //     })
            // }

        } else {
            console.log("为空")
        }
        hide()
    }

    timeDiff = (endTimeStamp) => {
        return (Number(endTimeStamp) - Date.now()) / 1000
    }

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
        const gridStyle = {
            width: '25%',
            textAlign: 'center',
            height: "490px"
        };
        let fundingNewOnline = []
        var len
        if (this.state.fundingCount < 8) {
            len = this.state.fundingCount
        } else {
            len = 8
        }
        for (let i = 0; i < len; i++) {
            fundingNewOnline[i] = this.state.showInfo[this.state.showInfo.length - i - 1]
        }

        return (<div style={{ paddingTop: "50px" }}>
            {/* <Empty description="暂无数据" /> */}
            <div>
                {
                    this.state.showInfo.length === 0
                        ? <div style={{ paddingTop: "110px", height: "410px", width: "100%", backgroundColor: "#ddd" }}><Empty description="暂时没有数据" /></div>
                        : undefined
                }
                <Carousel autoplay>
                    {
                        // 这里可以找出支持人数最多的项目
                        this.state.showInfo.map((v, i) => {
                            // 如果小于五张，有几张显示几张
                            if (i < 5) {
                                return <div key={i}>
                                    <img style={{ height: "410px", width: "100%" }} src={`${ipfsPrefix}${v.rotationImgs[0]}`} />
                                </div>

                            }
                        })
                    }
                </Carousel>

                <div style={{ height: "120px", backgroundColor: "#fff", marginBottom: "30px", padding: "25px", boxShadow: "4px 4px 15px #ddd" }}>
                    {/* <Statistic  title="累计支持金额" value={112893} /> */}
                    <div style={{ height: "70px", width: "90%", marginLeft: "30px", display: "flex" }}>
                        <div style={{ flexGrow: "4", display: "flex", justifyContent: "center" }}>
                            <div>
                                <span style={{ fontSize: "30px", color: "#000", fontWeight: "400" }}>{this.state.fundingSum} ETH</span>
                                <br />
                                <Icon style={{ color: "#2FAC6A" }} type="pay-circle" />
                                <span style={{ color: "ddd" }}>累计支持的总金额</span>
                            </div>
                        </div>
                        <div style={{ flexGrow: "4", display: "flex", justifyContent: "center" }}>
                            <div>
                                <span style={{ fontSize: "30px", color: "#000", fontWeight: "400" }}>{this.state.fundingManTimeCount} 人</span>
                                <br />
                                <Icon style={{ color: "#2FAC6A" }} type="user" />
                                <span style={{ color: "ddd" }}>累计支持的总人数</span>
                            </div>
                        </div>
                        <div style={{ flexGrow: "4", display: "flex", justifyContent: "center" }}>
                            <div>
                                <span style={{ fontSize: "30px", color: "#000", fontWeight: "400" }}>{this.state.fundingCount}项</span>
                                <br />
                                <Icon style={{ color: "#2FAC6A" }} type="shopping" />
                                <span style={{ color: "ddd" }}>累计众筹的总商品数量</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div >

                    <Card
                        title="最新上线"
                        extra={<Link to={{ pathname: "/FundingNewOnline", state: { sendData: this.state.fundingInfo } }} style={{ fontSize: "16px" }}>更多<Icon type="caret-right" theme="filled" /></Link>}
                        style={{ width: "100%" }}
                        bordered={false}
                        headStyle={{
                            backgroundColor: "#F0F2F5", fontSize: "28px",
                            fontFamily: "Mircosoft YaHei", fontWeight: "bold",
                        }}
                        bodyStyle={{ backgroundColor: "#F0F2F5" }}
                    >
                        {
                            fundingNewOnline.length === 0
                                ? <div style={{ paddingTop: "110px", height: "410px", width: "100%" }}><Empty description="暂时没有数据" /></div>
                                : undefined
                        }
                        {

                            // // 如果商品信息大于八个的话
                            fundingNewOnline.map((v, i) => {
                                let sendData = {}
                                // console.log(v)
                                if (v !== undefined) {
                                    let fno = v
                                    sendData = this.state.fundingInfo.filter(v => v.tempData.hash === fno.hash)[0]
                                    // if(this.state.fundingInfo !== undefined){
                                    //     console.log(this.state.fundingInfo)
                                    //     const sd = this.state.fundingInfo.map((vv,i) => {
                                    //         console.log(vv.tempData.hash)
                                    //         // // console.log(fno)
                                    //         if(fno.hash === vv.tempData.hash) {
                                    //             console.log("这里是相等的")
                                    //             return vv
                                    //         }
                                    //     })
                                    //     console.log(sd)
                                    // }
                                }

                                console.log(sendData)
                                // 如果小于五张，有几张显示几张
                                if (v != undefined) {

                                    return <Link to={{ pathname: "/FundingDetail", state: { sendData: sendData } }} key={i}><Card.Grid style={gridStyle} >
                                        <div style={{ width: "100%", background: "#fff" }} key={i}>
                                            <img style={{ width: "100%", height: "240px" }} src={ipfsPrefix + v.indexImgs[0]}></img>
                                            {/* {v.goodsName}{v.goodsName} */}
                                            {/* <div>{v.goodsName}</div> */}
                                            <br /><br />
                                            <div>
                                                <span style={{ fontSize: "22px", fontWeight: "bold" }}>{v.goodsName}</span>
                                            </div>
                                            <div style={{ float: "left" }}>
                                                <span style={{ fontSize: "16px", fontWeight: "bold", color: "#666", paddingLeft: "20px" }}>{v.teamName}</span>
                                                {/* <span style={{flexGrow: 6}}>kjadksadlkjsklasjdlkajdlksjlk</span> */}
                                            </div>
                                            <br /><br />
                                            <div>
                                                <span style={{ paddingRight: "75%", fontSize: "18px", color: "#2FAC6A" }}>{v.fundingSum}ETH</span>
                                            </div>
                                            <Progress style={{ width: "90%" }} percent={(v.progress * 100)} status="active" />
                                            <br /><br />
                                            <div>
                                                <span style={{ paddingRight: "40%", fontSize: "16px", color: "#666" }}>{v.manTimeCount}人支持</span>
                                                <span style={{ fontSize: "16px", color: "#666" }}>离结束: {v.timeDiff}</span>
                                            </div>
                                            <br />
                                        </div>
                                    </Card.Grid></Link>
                                }
                            })
                        }
                    </Card>

                </div>
                <div>
                    {/* 如果已经只剩下几小时，那么就是即将完成的项目 */}

                    <Card
                        title="即将结束"
                        extra={<Link to={{ pathname: "/FundingComingEnd", state: { sendData: this.state.fundingInfo } }} style={{ fontSize: "16px" }}>更多<Icon type="caret-right" theme="filled" /></Link>}
                        style={{ width: "100%" }}
                        bordered={false}
                        headStyle={{
                            backgroundColor: "#F0F2F5", fontSize: "28px",
                            fontFamily: "Mircosoft YaHei", fontWeight: "bold",
                        }}
                        bodyStyle={{ backgroundColor: "#F0F2F5" }}
                    >
                        {
                            this.state.fundingComingEnd.length === 0
                                ? <div style={{ paddingTop: "90px", height: "350px", width: "100%" }}><Empty description="暂时没有数据" /></div>
                                : undefined
                        }
                        {
                            // 如果商品信息大于八个的话
                            this.state.fundingComingEnd.map((v, i) => {

                                let sendData = {}
                                console.log(v)
                                if (v !== undefined) {
                                    let fno = v
                                    sendData = this.state.fundingInfo.filter(v => v.tempData.hash === fno.hash)[0]
                                }
                                console.log(sendData)
                                // 如果小于五张，有几张显示几张
                                if (v != undefined) {
                                    return <Link to={{ pathname: "/FundingDetail", state: { sendData: sendData } }} key={i}><Card.Grid style={gridStyle} key={i}>
                                        <div style={{ width: "100%", background: "#fff" }} key={i}>
                                            <img style={{ width: "100%", height: "240px" }} src={ipfsPrefix + v.indexImgs[0]}></img>
                                            {/* {v.goodsName}{v.goodsName} */}
                                            {/* <div>{v.goodsName}</div> */}
                                            <br /><br />
                                            <div>
                                                <span style={{ fontSize: "22px", fontWeight: "bold" }}>{v.goodsName}</span>
                                            </div>
                                            <div style={{ float: "left" }}>
                                                <span style={{ fontSize: "16px", fontWeight: "bold", color: "#666", paddingLeft: "20px" }}>{v.teamName}</span>
                                                {/* <span style={{flexGrow: 6}}>kjadksadlkjsklasjdlkajdlksjlk</span> */}
                                            </div>
                                            <br /><br />
                                            <div>
                                                <span style={{ paddingRight: "75%", fontSize: "18px", color: "#2FAC6A" }}>{v.fundingSum}ETH</span>
                                            </div>
                                            {
                                                console.log(v.progress * 100)
                                            }
                                            <Progress strokeColor={{
                                                from: '#108ee9',
                                                to: '#87d068',
                                            }} style={{ width: "90%" }} percent={(v.progress * 100)} status="active" />
                                            <br /><br />
                                            <div>
                                                <span style={{ paddingRight: "40%", fontSize: "16px", color: "#666" }}>{v.manTimeCount}人支持</span>
                                                <span style={{ fontSize: "16px", color: "#666" }}>离结束: {v.timeDiff}</span>
                                            </div>
                                            <br />
                                        </div>
                                    </Card.Grid>
                                    </Link>
                                }
                            })
                        }
                    </Card>
                </div>
            </div>
        </div>)
    }
}

export default Main