import React from 'react'
import { Link, HashRouter, Route } from 'react-router-dom'
import {
    Layout, Menu, Breadcrumb, Icon, Empty,
} from 'antd';
import '../App.css'
import EditUserInfo from './EditUserInfo'
import JoinFundingInfo from './JoinFundingInfo'
import SponsoredFundingInfo from './SponsoredFundingInfo'
import ToBeShipped from './ToBeShipped'

const { SubMenu } = Menu;
const {
    Header, Content, Footer, Sider,
} = Layout;

class PersonalCenter extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentPath: this.props.location.pathname
        }
    }

    render() {
        // console.log(this.state.currentPath)
        return (

            <Content style={{ padding: '0 50px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item>
                        <Link to='/'>首页</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>个人中心</Breadcrumb.Item>
                </Breadcrumb>
                <Layout style={{ padding: '24px 0', background: '#fff' }}>
                    <HashRouter className='App'>
                        <Sider width={200} style={{ background: '#fff' }}>
                            <Menu
                                mode="inline"
                                defaultSelectedKeys={[this.state.currentPath]}
                                style={{ height: '100%' }}
                            >
                                <Menu.Item key="/EditUserInfo" >
                                    <Link to='/EditUserInfo'><Icon type="user" />个人信息</Link>
                                </Menu.Item>
                                <Menu.Item key="/JoinFundingInfo">
                                    <Link to='/JoinFundingInfo'>
                                        <Icon type="shopping" />参与的众筹
                                    </Link>
                                </Menu.Item>

                                <Menu.Item key="/SponsoredFundingInfo">
                                    <Link to='/SponsoredFundingInfo'>
                                        <Icon type="money-collect" />发起的众筹
                                    </Link>
                                </Menu.Item>
                                <Menu.Item key="/ToBeShipped">
                                    <Link to='/ToBeShipped'>
                                        <Icon type="inbox" />待发货商品
                                    </Link>
                                </Menu.Item>
                                {/* <Menu.Item key="/BuyedGoods"><Icon type="notification" />已购商品</Menu.Item>
                                <Menu.Item key="/UserInform"><Icon type="notification" />用户通知</Menu.Item>
                                <Menu.Item key="/ToBeShipped"><Icon type="notification" />待发货商品</Menu.Item> */}
                            </Menu>
                        </Sider>
                        <Content style={{ padding: '0 24px', minHeight: 280 }}>
                            {/* <Empty /> */}
                            <Route path='/PersonalCenter' component={EditUserInfo}></Route>
                            <Route path='/EditUserInfo' component={EditUserInfo}></Route>
                            <Route path='/JoinFundingInfo' component={JoinFundingInfo}></Route>
                            <Route path='/SponsoredFundingInfo' component={SponsoredFundingInfo}></Route>
                            <Route path='/ToBeShipped' component={ToBeShipped}></Route>
                        </Content>
                    </HashRouter>
                </Layout>
            </Content>

        )
    }
}

export default PersonalCenter