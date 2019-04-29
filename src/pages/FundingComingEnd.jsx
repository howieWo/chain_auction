import React from 'react'
import {Link} from 'react-router-dom'
import { message ,Progress , Card, Empty, Pagination} from 'antd'
import { ipfsPrefix } from '../Utils'
class FundingComingEnd extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            showInfo: [],
            currentL: 1,
            pageInfo: [],
         };
         this.init()
    }

    timeDiff = (endTimeStamp) => {
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
        if(day != 0) {
            return day + "天"
        }
        if(day == 0) {
            return hour+'时'+minute+'分'+second+'秒'
        } else if(hour == 0){
            return minute+'分'+second+'秒'
        }  else if(minute == 0) {
            return second+'秒'
        } else {
            return day+'天'
        }
    }

    init = () => {
        if(this.props.location.state.sendData !== undefined) {
            this.props.location.state.sendData.map((v ,i) => {
                console.log(v)
                const timeDiff = this.timeDiff(v.tempData.fundingEndTimeStamp)
                console.log(timeDiff)
                if(timeDiff.charAt(timeDiff.length-1) !== "天") {
                    this.state.showInfo.push(v.tempData)
                }
                // 只获取到tempData就够了
            })
            // // console.log(ds)
            // // // let dsd = ds[1]
            // // // ds[1] = ds[0]
            // // // ds[0] = dsd
            // // const uid = ds.reverse()
            // // console.log(uid)
            // for(let i = 0;i<this.state.showInfo.length/2 ;i++) {
            //     let dsd = ds[this.state.showInfo.length-i-1]
            //     ds[this.state.showInfo.length-i-1] = ds[i]
            //     ds[i] = dsd
            // }
            this.onChange(1)
            this.setState({
                showInfo: this.state.showInfo
            })
            // console.log(this.state.showInfo)
            // 获取到所有的最新上线的数据，然后根据页面获取
        }else{
            message.error("未获取到数据，跳转到主页重新获取！")
            this.props.history.push("/")
        }
    }

    onChange = (page) => {
        let pageLen
        if(page === 1) {
            if(this.state.showInfo.length < 12) {
                pageLen = this.state.showInfo.length
            }else{
                pageLen = 12
            }
        }
        console.log(pageLen)
        this.state.pageInfo = [] // 先将其清空
        for(let i = 0;i<pageLen;i++) {
            this.state.pageInfo.push(this.state.showInfo[(page-1)+i])
        }
        this.setState({
            pageInfo: this.state.pageInfo
        })
    }

    render() {
        const gridStyle = {
            width: '25%',
            textAlign: 'center',
            height: "490px"
        };
        return (
            <div>
                {/* 如果已经只剩下几小时，那么就是即将完成的项目 */}
                <Card
                    title="最新上线"
                    style={{ width: "100%" }}
                    bordered={false}
                    headStyle={{backgroundColor: "#F0F2F5", fontSize: "28px", 
                                fontFamily: "Mircosoft YaHei", fontWeight: "bold",
                                marginTop: "20px"
                            }}
                    bodyStyle={{backgroundColor: "#F0F2F5"}}
                >
                    {
                        this.state.pageInfo.length === 0
                            ? <div style={{ paddingTop: "90px", height: "350px", width: "100%" }}><Empty description="暂时没有数据" /></div>
                            : undefined
                    }
                    {
                        // 如果商品信息大于八个的话
                        this.state.pageInfo.map((v, i) => {
                            let sendDataV = {}
                            console.log(v)
                            if(v!==undefined){
                                let fno = v
                                sendDataV = this.props.location.state.sendData.filter(val=>val.tempData.hash === fno.hash)
                            }
                            // 如果小于五张，有几张显示几张
                            if(v!=undefined) {
                                return  <Link to={{pathname: "/FundingDetail", state:{sendData: sendDataV}}} key={i}><Card.Grid style={gridStyle} key={i}>
                                    <div style={{width: "100%", background: "#fff"}} key={i}>
                                        <img style={{width: "100%", height: "240px"}} src={ipfsPrefix+v.indexImgs[0]}></img>
                                        {/* {v.goodsName}{v.goodsName} */}
                                        {/* <div>{v.goodsName}</div> */}
                                        <br/><br/>
                                        <div>
                                            <span style={{fontSize: "22px", fontWeight: "bold"}}>{v.goodsName}</span>
                                        </div>
                                        <div style={{float: "left"}}>
                                            <span style={{ fontSize: "16px", fontWeight: "bold", color: "#666",paddingLeft: "20px"}}>{v.teamName}</span>
                                            {/* <span style={{flexGrow: 6}}>kjadksadlkjsklasjdlkajdlksjlk</span> */}
                                        </div>
                                        <br/><br/>
                                        <div>
                                            <span style={{ paddingRight: "75%", fontSize: "18px", color: "#2FAC6A"}}>{v.fundingSum}ETH</span>
                                        </div>
                                        <Progress style={{width: "90%"}} percent={v.progress} status="active" />
                                        <br/><br/>
                                        <div>
                                            <span style={{ paddingRight: "40%", fontSize: "16px", color: "#666"}}>{v.manTimeCount}人支持</span>
                                            <span style={{ fontSize: "16px", color: "#666"}}>离结束: {v.timeDiff}</span>
                                        </div>
                                        <br/>
                                    </div>
                                </Card.Grid>
                                </Link>
                            }
                        })
                    }
                </Card>
                <Pagination 
                    style={{textAlign: "center"}} 
                    current={this.state.current} 
                    onChange={this.onChange}
                    showTotal={total => `共计 ${this.state.showInfo.length} 条数据`}
                    pageSize={12} total={this.state.showInfo.length} />
            </div>
        );
    }
}

export default FundingComingEnd;