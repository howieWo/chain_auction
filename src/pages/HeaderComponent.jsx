import React from 'react'
import {Layout, Menu, Dropdown, Form, Icon, Avatar} from 'antd'

import {Link, withRouter} from 'react-router-dom'
import '../App.css'

const {Header} = Layout
const downMenu = (
    <Menu className='downMenu'>
      <Menu.Item className='downMenuItem'>
        <a target="_blank" rel="noopener noreferrer" href="http://www.alipay.com/">资质证照</a>
      </Menu.Item>
      <Menu.Item className='downMenuItem'>
        <a target="_blank" rel="noopener noreferrer" href="http://www.taobao.com/">协议规则</a>
      </Menu.Item>
    </Menu>
  );

class HeaderComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isCheck: false,
            visible: false
        }
    }
    
    perfectInfo = () => {
        this.setState({
            visible: true
        })
    }

    showDrawer = () => {
        this.setState({
            visible: true,
        });
    };
    
    onClose = () => {
        this.setState({
            visible: false,
        });
    };

    render() {
        return (
            <Header className='header'>
                <div className='headerContent'>
                    {/* 这里可以放上一个路由 */}
                    <span className='headerRight'>
                        <Link to='/PersonalCenter#/EditUserInfo'>
                            {/* <span className="headerRight">个人中心</span>  */}
                            <Avatar style={{ backgroundColor: '#87d068' }} icon="user" />   
                        </Link>
                    </span>
                    <span className='headerRight'>|</span>
                    <span className='headerRight'>帮助中心</span>
                    <span className='headerRight'>|</span>
                    <Dropdown overlay={downMenu} className='headerRight'>
                        <a className="ant-dropdown-link" href="#">
                            资质证照 / 协议规则 <Icon type="down" />
                        </a>
                    </Dropdown>
                    <span className='headerRight'></span>
                </div>
            </Header>
        )
    }
}

export default HeaderComponent