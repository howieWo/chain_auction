import React, { Component } from 'react'
import {Layout,Modal, message, Cascader, BackTop, InputNumber,Affix,  Drawer, Form, Button, Col, Row, Input, Select, DatePicker} from 'antd'
import {BrowserRouter, Route} from 'react-router-dom'
import {web3, AppContract, getContract, saveJsonToIPFS, getPayGas} from './Utils'
import Header from './pages/HeaderComponent'
import MenuComponent from './pages/MenuComponent'
import Main from './pages/Main'
import InitiateFunding from './pages/InitiateFunding'
import residences from './provinceData'
import Shop from './pages/Shop'
import GoFunding from './pages/GoFunding'
import moment from 'moment'
import PersonalCenter from './pages/PersonalCenter'
import FundingDetail from './pages/FundingDetail'
import FundingNewOnline from './pages/FundingNewOnline'
import FundingComingEnd from './pages/FundingComingEnd'
import './App.css';

const { Option } = Select;
const {Footer, Content} = Layout
const confirm = Modal.confirm;

class App extends Component {
  
  constructor(props) {
    super(props)
    this.state={
      account: '',
      isCheck: false,
      visible: false,
      drawerVisible: false,
      mateMaskIsLogin: false,
      userService: undefined,
      nickname: '',
      age:'',
      gender:'', 
      email:'',
      brithday:'',
      residence:'', 
      detailedAddr:'',
      phoneNumber:'',
      zipcode: '',
      description:'',
      userServiceAddr: '',
    }
    this.init()
  }

  init = async() => {
    const [account] = await web3.eth.getAccounts();
    console.log("当前地址:" + account)
    if(account === undefined) {
      Modal.error({title: '错误',
                  content: '检测到您还未登录MateMask，请先登录，登录后请刷新当前页面'})
      return;
    }
    const userServiceAddr = await AppContract.methods.userService().call({
      from: account
    })
    // 在一些简单操作上，设置同步，耗时操作上设置异步
    const userService = await getContract("UserService", userServiceAddr)
    this.setState({userService,userServiceAddr})
    console.log(userService)
    const isCheck = await userService.methods.checkUser(account).call({
      from: account
    })
    console.log(isCheck)
    if(isCheck){
      this.setState({
        visible: false
      })
    } else {
      this.setState({
        visible: true
      })
    }
    this.setState({
      isCheck:isCheck,
      account: account
    })
  }

  hideModal = () => {
    // Modal.error({title: '提示',
    //             content: '检测到您还未登录MateMask，请先登录'})
    message.warning("若后续需要完善您的信息，请点击右上角【个人中心】进行完善", 4)
    this.setState({
      visible: false,
    });
  }

  showDrawer = () => {
      this.setState({
        visible: false,
        drawerVisible: true
      });
  };
  // 获取数据拼接提交到IPFS上
  // 获取其hash值，然后提交到
  onSubmit = () => {
    const account = this.state.account
    const nickname = this.props.form.getFieldValue('nickname')
    if(nickname === undefined) {
      message.error("请填入您的昵称！")
      return
    }
    const age = this.props.form.getFieldValue('age')
    if(age === undefined) {
      message.error("请填入您的年龄！")
      return
    } 
    const gender = this.props.form.getFieldValue('gender')
    if(gender === undefined) {
      message.error("请填入您的性别！")
      return
    }

    const email = this.props.form.getFieldValue('email')
    if(email === undefined) {
      message.error("请填入您的邮箱！")
      return
    }

    // let brithday = this.props.form.getFieldValue('brithday')
    // console.log(brithday)
    var brithday
    if(this.props.form.getFieldValue('brithday') !== undefined) {
      brithday = this.props.form.getFieldValue('brithday').format('YYYY-MM-DD')
    }else{
      message.error("请选择您的出生日期！")
      return
    }

    const residence = this.props.form.getFieldValue('residence')
    const detailedAddr = this.props.form.getFieldValue('detailedAddr')
    var ShippingAddress
    if(residence === undefined) {
      message.error("请选择您所在地区！")
    } else {
      if(detailedAddr !== ''){
        ShippingAddress = residence[0] + residence[1] + residence[2] + detailedAddr
      }else{
        message.error("请填入您的详细信息")
      }
    }
    
    const phoneNumber = this.props.form.getFieldValue('phoneNumber')
    if(phoneNumber === undefined ) {
      message.error("请填入您的手机号！")
      return
    }
    const zipcode = this.props.form.getFieldValue('zipcode')
    if(zipcode === undefined) {
      message.error("请填入您的邮编！")
      return
    }

    const realName = this.props.form.getFieldValue('realName')
    if(realName === undefined) {
      message.error("请填入您的真实姓名！")
      return
    }
    
    let description = this.props.form.getFieldValue('description')
    if(description === undefined) {
      description = ''
    }

    console.log(this.state.account)
    console.log(nickname)
    console.log(age)
    console.log(gender)
    console.log(email)
    console.log(brithday)
    console.log(ShippingAddress)
    console.log(phoneNumber)
    console.log(zipcode)
    console.log(description)
    console.log(realName)

    let userInfo = new Object();
    userInfo.hash = this.state.account
    userInfo.nickname = nickname
    userInfo.age = age
    userInfo.regDate = moment().format('YYYY-MM-DD')
    userInfo.gender = gender
    userInfo.email = email
    userInfo.realName = realName
    userInfo.brithday = brithday
    userInfo.detailedAddr = detailedAddr
    userInfo.residence = residence
    userInfo.ShippingAddress = ShippingAddress
    userInfo.phoneNumber = phoneNumber
    userInfo.zipcode = zipcode
    userInfo.description = description
    userInfo.JoinOrders = []
    userInfo.InitiatedOrders = []

    console.log(userInfo)

    confirm({
      title: '提示',
      content: '确定要提交您的个人信息吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async()=>{
        // 关闭当前
        // message.warning("若后续需要完善您的信息，请点击右上角【个人中心】进行完善", 4)
        console.log(userInfo)
        console.log(JSON.stringify(userInfo))
        // const hide = message.loading('提交中数据中！');
        const userIpfsHash = await saveJsonToIPFS(userInfo)
        // hide()
        console.log(userIpfsHash)
        const hash1 = userIpfsHash.slice(0,23)
        const hash2 = userIpfsHash.slice(23)
        const hash1Val = web3.utils.asciiToHex(hash1)
        const hash2Val = web3.utils.asciiToHex(hash2)


        await this.state.userService.methods.createUser(hash1Val, hash2Val).send({
          from: this.state.account,
          gas: '5000000'
        })
        message.success("保存成功!", 4)
        this.forceUpdate();
        this.setState({
          drawerVisible: false,
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });

   

    // console.log(this.props.form.getFieldValue('brithday').format('YYYY-MM-DD'))

    // 获取到所有需要提交的数据
    // console.log(this.state.account)
    // console.log(this.state.nickname)
    // console.log(this.state.age)
    // console.log(this.state.gender)
    // console.log(this.state.brithday)
    // console.log(this.state.residence[0] + this.state.residence[1] + this.state.residence[2])
    // console.log(this.state.detailedAddr)
    // console.log(this.state.phoneNumber)
    // console.log(this.state.zipcode)
    // console.log(this.state.description)
  }

  inputChange = (e) => {
    console.log(e.target.name + ":" + e.target.value)
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  ageChange = (e) => {
    this.setState({
      age: e
    })
  }
  
  genderChange = (e) => {
    this.setState({
      gender: e
    })
  }

  brithdayChange = (e) => {
    this.setState({
      brithday: e
    })
  }
  
  residenceChange = (e) => {
    this.setState({
      residence: e
    })
  }

  onClose = () => {
    // 如果检测到已经填写上数据，提醒一下
    console.log(this.state.nickname)
    var flag = false
    if(this.state.nickname !== '' || this.state.email !== '' || this.state.phoneNumber !== '') {
      confirm({
        title: '警告',
        content: '关闭后您填写的数据将会清空，您是否继续关闭！',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk: ()=>{
          // 关闭当前
          message.warning("若后续需要完善您的信息，请点击右上角【个人中心】进行完善", 4)
          
          this.setState({
            drawerVisible: false,
          });
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    }else{
      message.warning("若后续需要完善您的信息，请点击右上角【个人中心】进行完善", 4)
      this.setState({
        drawerVisible: false,
      });
    }
    
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const prefixSelector = getFieldDecorator('prefix', {
      initialValue: '86',
    })(
      <Select style={{ width: 70 }}>
        <Option value="86">+86</Option>
        <Option value="87">+87</Option>
      </Select>
    );
    // 如果已经填写过相关信息，不再提醒，直接进入页面
    return (
      <BrowserRouter className='App'>
        <BackTop />
        <Modal
          title="提示"
          visible={this.state.visible}
          onOk={this.showDrawer}
          onCancel={this.hideModal}
          okText="马上去完善"
          cancelText="稍后再说"
        >
          <p>检测到您是第一次进入本网站或者还未完善个人信息，请先完善您的个人信息</p>
        </Modal>
        <Layout className='layout'>
          <Header></Header>
          <Affix offsetTop={this.state.top}>
            <MenuComponent></MenuComponent>
          </Affix>
          
          <Content style={{ padding: '0 50px' }}>
            <Route path='/' exact component={Main}></Route>
            <Route path='/PersonalCenter' component={PersonalCenter}></Route>
            <Route path='/InitiateFunding' component={InitiateFunding}></Route>
            <Route path='/Shop' component={Shop}></Route>
            <Route path='/GoFunding' component={GoFunding}></Route> 
            <Route path='/FundingNewOnline' component={FundingNewOnline}></Route> 
            <Route path='/FundingComingEnd' component={FundingComingEnd}></Route> 
            <Route path='/FundingDetail' component={FundingDetail}></Route>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Howie wong 毕业设计 ©2019 Created by Howie wong
          </Footer>
        </Layout>
        <div>
            <Drawer
            title="完善用户信息（带*号为必填项）"
            width={720}
            onClose={this.onClose}
            visible={this.state.drawerVisible}
            >
            <Form layout="vertical" hideRequiredMark >
                <Row gutter={16}>
                  <Col span={12}>
                      <Form.Item label="账号地址：">
                        {this.state.account}
                      </Form.Item>
                  </Col>
                  <Col span={12}>
                      <Form.Item label="* 昵称：">
                      {getFieldDecorator('nickname', {
                          rules: [{ required: true, message: '昵称不能为空' }],
                      })(
                          <Input
                          style={{ width: '100%' }}
                          placeholder="请输入您的昵称"
                          name="nickname"
                          onChange={this.inputChange}
                          />
                      )}
                      </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                      <Form.Item label="* 年龄：">
                      {getFieldDecorator('age', {
                          rules: [{ required: true, message: '您输入您的年龄' }],
                      })(
                        <InputNumber
                        style={{ width: '100%' }}
                        placeholder="您输入您的年龄"
                        name="age"
                        min={1}
                        initialValue={1}
                        onChange={this.ageChange}
                        />
                      )}
                      </Form.Item>
                  </Col>
                  <Col span={12}>
                      <Form.Item label="* 性别">
                      {getFieldDecorator('gender', {
                          rules: [{ required: true, message: '请选择性别' }],
                      })( 
                          <Select placeholder="请选择性别" 
                                  onChange={this.genderChange}
                          >
                          <Option value="male">男</Option>
                          <Option value="famale">女</Option>
                          </Select>
                      )}
                      </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                      <Form.Item label="* 邮箱"> 
                      {getFieldDecorator('email', {
                          rules: [{ required: true, message: '请输入您的邮箱' },
                                  { type: 'email', message: '请输入正确的邮箱'}
                        ],
                      })(
                          <Input
                          style={{ width: '100%' }}
                          placeholder="请输入您的邮箱"
                          onChange={this.inputChange}
                          />
                      )}
                      </Form.Item>
                  </Col>
                  <Col span={12}>
                      <Form.Item label="* 生日"> 
                      {getFieldDecorator('brithday', {
                          rules: [{ required: true, message: '请选择您的生日' }],
                      })(
                          <DatePicker 
                            placeholder="请选择您的生日"
                            format="YYYY-MM-DD"
                            style={{width: '100%'}}
                            onChange={this.brithdayChange}
                          />
                          // <DatePicker.RangePicker
                          // style={{ width: '100%' }}
                          // getPopupContainer={trigger => trigger.parentNode}
                          // />
                      )}
                      </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="* 收货地区"
                    >
                      {getFieldDecorator('residence', {
                        initialValue: ['北京市', '北京市', '东城区'],
                        rules: [{ type: 'array', required: true, message: '请选择您的收货地址!' }],
                      })(
                        <Cascader
                        options={residences} 
                        onChange={this.residenceChange}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="* 详细地址"
                    > 
                      {getFieldDecorator('detailedAddr', {
                        rules: [{ required: true, message: '请填写您的详细地址!' }],
                      })(
                        <Input
                        style={{ width: '100%' }}
                        name="detailedAddr"
                        placeholder="请填写您的详细地址"
                        onChange={this.inputChange}
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                      <Form.Item label="* 手机号">
                      {getFieldDecorator('phoneNumber', {
                          rules: [{ required: true, message: '请输入您的手机号' },
                                  { pattern:new RegExp(/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/, "g"),  message: '请输入正确的手机号'}
                        ],
                      })(
                          <Input
                          style={{ width: '100%' }}
                          name="phoneNumber"
                          placeholder="请输入正确的手机号"
                          type='number'
                          addonBefore={prefixSelector}
                          onChange={this.inputChange}
                          />
                      )}
                      </Form.Item>
                  </Col>
                  <Col span={12}>
                      <Form.Item label="* 邮编">
                      {getFieldDecorator('zipcode', {
                          rules: [{ required: true, message: '请填写您所在地区的邮编' },
                                  { pattern:new RegExp(/^[1-9][0-9]{5}$/, "g"),  message: '请输入正确的邮编'}
                        ],
                      })(
                          <Input
                          style={{ width: '100%' }}
                          name="zipcode"
                          placeholder="请填写您所在地区的邮编"
                          type='number'
                          onChange={this.inputChange}
                          />
                      )}
                      </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                      <Form.Item label="* 真实姓名">
                      {getFieldDecorator('realName', {
                          rules: [{ required: true, message: '请输入您的真实姓名' }],
                      })(
                          <Input
                          style={{ width: '100%' }}
                          name="realName"
                          placeholder="请输入您的真实姓名"
                          type='text'
                          onChange={this.inputChange}
                          />
                      )}
                      </Form.Item>
                  </Col>
                  <Col></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                      <Form.Item label="个性签名">
                      {getFieldDecorator('description')(
                        <Input.TextArea 
                        rows={3} 
                        name='description'
                        placeholder="请输入您的简介或者个性签名" 
                        onChange={this.inputChange}
                        />)
                      }
                      </Form.Item>
                  </Col>
                </Row>
            </Form>
            <div
                style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e9e9e9',
                padding: '10px 16px',
                background: '#fff',
                textAlign: 'right',
                }}
            >
                <Button onClick={this.onClose} style={{ marginRight: 8 }}>
                稍后再说
                </Button>
                <Button onClick={this.onSubmit} type="primary">
                保存数据
                </Button>
            </div>
            </Drawer>
            
        </div>
      </BrowserRouter>
    )
  }
}

export default Form.create()(App);
