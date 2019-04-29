import React from 'react'
import {Menu, Input} from 'antd'
import {Link, withRouter} from 'react-router-dom'
import '../App.css'
const Search = Input.Search;

class MenuComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentPath: this.props.location.pathname
        }
    }

    render() {
        
        return (<div className="menu">
            <div className="menuContent">
                <div className="logo">
                    {/* <img src=''></img> */}
                    {/* <img src="images/logo.png"></img> */}
                </div>
                <div className="menuList">
                    <Menu
                        mode="horizontal"
                        defaultSelectedKeys={[this.state.currentPath]}
                        style={{ lineHeight: '78px' }}
                    >   
                        <Menu.Item key="/" className='menuItem' >
                            <Link to='/' className='menuItemLink'>主页</Link>
                        </Menu.Item>
                        <Menu.Item key="/InitiateFunding" className='menuItem' >
                            <Link to='/InitiateFunding' className='menuItemLink'>发起众筹</Link>
                        </Menu.Item>
                        <Menu.Item key="/Shop" className='menuItem' >
                            <Link to='/Shop' className='menuItemLink'> 商城</Link>
                        </Menu.Item>
                    </Menu>
                </div>
                <div className="searchInput">
                    {/* <img src=''></img> */}
                    {/* <Search
                        className="search"
                        placeholder="请输入搜索内容"
                        onSearch={value => console.log(value)}
                        size="large"
                        enterButton
                        /> */}
                    <Search
                    placeholder="请输入搜索内容"
                    onSearch={value => console.log(value)}
                    size="large"
                    />
                </div>
            </div>
        </div>)
    }
}

export default withRouter(MenuComponent) 