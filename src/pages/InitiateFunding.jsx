import React from 'react'
import {BrowserRouter, withRouter, Route , Link} from 'react-router-dom'
import '../App.css'
import {Checkbox, Button} from 'antd'
import GoFunding from './GoFunding'
class InitiateFunding extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            disabled: true
        }
    }

    onChange = (e) => {
        if(e.target.checked) {
            this.setState({
                disabled: false                 
            })
        }else{
            this.setState({     
                disabled: true
            })
        }
    }

    render() {
        return (
            <div className="InitFundContentRouter">
                <div className="InitFundContent">
                    <div className="InitFundTop">
                        <span style={{fontFamily: "Mircosoft YaHei", fontSize: "16px", fontWeight: "400"}}>发起众筹</span>
                    </div>
                    <div style={{width: "100%", height: "100%", display:"flex"}}>
                        <div style={{flexGrow: "1"}}>
                            <img src='images/gofund.png' />
                        </div>
                        
                        <div style={{flexGrow: "20"}}>
                            <div style={{width: "80%", height: "70%", margin: "70px"}}>
                                <p style={{color: "#AB4A53", fontSize: "20px",fontWeight: "500"}}>男神、女神、神器，只要你来，皆可众筹......</p>
                                <p>
                                    链筹是一家可以帮您实现梦想的网站，在这里您可以发布您的梦想、 创意和创业计划，并通过网络平台面对公众集资让有创造力的人可能获取他们需要的资金，一边使他们的梦想有可能实现。
                                </p>
                                <Checkbox style={{marginTop: "10px"}} onChange={this.onChange}>阅读并同意链筹的<a href="">《服务协议》</a><a href="">《支持者协议》</a></Checkbox>
                                <br/>
                                <Button 
                                    style={{width: "150px", fontSize: "16px", height: "50px", marginTop: "30px", color:"#fff", backgroundColor: "#FE645C"}}
                                    disabled={this.state.disabled}
                                    >
                                    <Link to='/GoFunding'>立即发起项目</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(InitiateFunding)