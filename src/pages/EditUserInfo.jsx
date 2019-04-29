import React from 'react'
import { Modal, message, Cascader, InputNumber, Form, Button, Col, Row, Input, Select, DatePicker, Switch } from 'antd'
import { web3, AppContract, getContract, saveJsonToIPFS, readJsonFromIpfs, getPayGas } from '../Utils'
import residences from '../provinceData'
import moment from 'moment'
import '../App.css';

const { Option } = Select;
const confirm = Modal.confirm;

class EditUserInfo extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      isCheck: false,
      editVisible: false,
      mateMaskIsLogin: false,
      user: undefined,
      userService: undefined,
      disabled: true,
      nickname: '',
      age: '',
      gender: '',
      regDate: '',
      email: '',
      brithday: '',
      residence: [],
      detailedAddr: '',
      phoneNumber: '',
      realName: '',
      zipcode: '',
      description: ''
    }
    this.init()
  }


  init = async () => {
    const [account] = await web3.eth.getAccounts();
    console.log("当前地址:" + account)
    if (account === undefined) {
      Modal.error({
        title: '错误',
        content: '检测到您还未登录MateMask，请先登录，登录后请刷新当前页面'
      })
      return;
    }
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

    // 填写了个人信息的是true
    // 如果还没有填写，让其填写
    if (!isCheck) {
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
      this.setState({
        disabled: false
      })
    } else {
      const hide = message.loading('数据获取中！请稍后！', 0)
      // 获取到当前登录者对应的User实例
      // 这里获取到ipfs，然后从ipfs上获取数据
      // 如果想在合约中取到msg.sender的值，那么必须要声明from
      const UserAddr = await userService.methods.getUserByCurrent().call({
        from: account
      })
      const user = await getContract("User", UserAddr)
      const userInfoArr = await user.methods.getUserInfo().call()

      // 可以判断一下，如果都不等于undefined再执行
      if (userInfoArr !== undefined) {
        if ((userInfoArr[0] !== '' && userInfoArr[0] !== undefined)
          && (userInfoArr[1] !== '' && userInfoArr[1] !== undefined)) {
          const userInfo = await readJsonFromIpfs(userInfoArr[0], userInfoArr[1])
          
          this.setState({ user: user })
          console.log(userInfo)
          // 同步获取到的数据
          this.setState({
            nickname: userInfo.nickname,
            age: userInfo.age,
            gender: userInfo.gender,
            email: userInfo.email,
            brithday: userInfo.brithday,
            residence: userInfo.residence,
            detailedAddr: userInfo.detailedAddr,
            phoneNumber: userInfo.phoneNumber,
            zipcode: userInfo.zipcode,
            realName: userInfo.realName,
            description: userInfo.description,
            regDate: userInfo.regDate
          })

          this.props.form.setFieldsValue({
            "nickname": this.state.nickname,
            "gender": this.state.gender,
            "age": this.state.age,
            "email": this.state.email,
            "brithday": moment(this.state.brithday),
            "residence": this.state.residence,
            "detailedAddr": this.state.detailedAddr,
            "phoneNumber": this.state.phoneNumber,
            "realName": this.state.realName,
            "zipcode": this.state.zipcode,
            "description": this.state.description
          });
        }
        hide()
      }
    }
    this.setState({
      account: account,
      isCheck: isCheck,
      userService: userService,
      // user: user
    })
  }

  // 获取数据拼接提交到IPFS上
  // 获取其hash值，然后提交到
  onSubmit = async () => {
    const nickname = this.props.form.getFieldValue('nickname')
    if (nickname === undefined) {
      message.error("请填入您的昵称！")
      return
    }
    const age = this.props.form.getFieldValue('age')
    if (age === undefined) {
      message.error("请填入您的年龄！")
      return
    }
    const gender = this.props.form.getFieldValue('gender')
    if (gender === undefined) {
      message.error("请填入您的性别！")
      return
    }

    const email = this.props.form.getFieldValue('email')
    if (email === undefined) {
      message.error("请填入您的邮箱！")
      return
    }

    // let brithday = this.props.form.getFieldValue('brithday')
    // console.log(brithday)
    var brithday
    if (this.props.form.getFieldValue('brithday') !== undefined) {
      brithday = this.props.form.getFieldValue('brithday').format('YYYY-MM-DD')
    } else {
      message.error("请选择您的出生日期！")
      return
    }

    const residence = this.props.form.getFieldValue('residence')
    const detailedAddr = this.props.form.getFieldValue('detailedAddr')
    var ShippingAddress
    if (residence === undefined) {
      message.error("请选择您所在地区！")
    } else {
      if (detailedAddr !== '') {
        ShippingAddress = residence[0] + residence[1] + residence[2] + detailedAddr
      } else {
        message.error("请填入您的详细信息")
      }
    }

    const phoneNumber = this.props.form.getFieldValue('phoneNumber')
    if (phoneNumber === undefined) {
      message.error("请填入您的手机号！")
      return
    }
    const zipcode = this.props.form.getFieldValue('zipcode')
    if (zipcode === undefined) {
      message.error("请填入您的邮编！")
      return
    }

    const realName = this.props.form.getFieldValue('realName')
    if (realName === undefined) {
      message.error("请填入您的真实姓名！")
      return
    }

    let description = this.props.form.getFieldValue('description')
    if (description === undefined) {
      description = ''
    }

    // console.log(this.state.account)
    // console.log(nickname)
    // console.log(email)
    // console.log(age)
    // console.log(gender)
    // console.log(brithday)
    // console.log(ShippingAddress)
    // console.log(phoneNumber)
    // console.log(zipcode)
    // console.log(description)

    let userInfo = new Object();
    userInfo.hash = this.state.account
    userInfo.nickname = nickname
    userInfo.email = email
    userInfo.age = age
    userInfo.regDate = this.state.regDate
    userInfo.gender = gender
    userInfo.brithday = brithday
    userInfo.residence = residence
    userInfo.detailedAddr = detailedAddr
    userInfo.ShippingAddress = ShippingAddress
    userInfo.phoneNumber = phoneNumber
    userInfo.zipcode = zipcode
    userInfo.realName = realName
    userInfo.description = description
    userInfo.JoinOrders = []
    userInfo.InitiatedOrders = []

    console.log(userInfo)
    var conContent = ''
    // 已经填写了
    if (this.state.isCheck) {
      conContent = "确定要更新您的个人信息吗？"
    } else {
      conContent = "确定要保存您的个人信息吗？"
    }
    confirm({
      title: '提示',
      content: conContent,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        // 关闭当前
        console.log(userInfo)
        console.log(JSON.stringify(userInfo))
        const hide = message.loading('提交中数据中！');
        const userIpfsHash = await saveJsonToIPFS(userInfo)

        console.log("存储的hash为" + userIpfsHash)
        const hash1 = userIpfsHash.slice(0, 23)
        const hash2 = userIpfsHash.slice(23)
        const hash1Val = web3.utils.asciiToHex(hash1)
        const hash2Val = web3.utils.asciiToHex(hash2)
        console.log(this.state.isCheck)
        // 这里也有一点不一样的地方
        if (this.state.isCheck) {
          // 这个更新的方法是user的，userService没有这个方法
          await this.state.user.methods.updataUser(hash1Val, hash2Val).send({
            from: this.state.account,
            gas: '5000000'
          })
        } else {
          await this.state.userService.methods.createUser(hash1Val, hash2Val).send({
            from: this.state.account,
            gas: '5000000'
          })
        }
        hide()
        message.success("保存成功!", 4)
        this.props.history.push("/EditUserInfo")
      },
      onCancel() {
        console.log('Cancel');
      },
    });
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

  // 传入一个参数表示当前switch的状态
  onSwitchChange = (isSwitch) => {
    console.log(isSwitch)
    this.setState({
      disabled: isSwitch
    })
  }

  hideModal = () => {
    this.setState({
      editVisible: false
    })
  }

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

    return (<div>
      <Modal
        title="温馨提醒"
        visible={this.state.editVisible}
        onOk={this.hideModal}
        onCancel={this.hideModal}
        okText="去完善"
        cancelText="稍后再说"
      >
        <p>
          检测到您是第一次进入本网站或者您还未完善基本信息，您点击【个人信息】按钮完善信息
              </p>
      </Modal>
      <div
        style={{
          width: '100%',
          borderBottom: '1px solid #e9e9e9',
          padding: '15px 16px',
          background: '#2FAC6A',
          textAlign: 'right',
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px"
        }}
      >
        {/* <h3>点击按钮编辑</h3> */}
        <Switch defaultChecked checkedChildren="编辑" unCheckedChildren="锁定" onChange={this.onSwitchChange} style={{ backgroundColor: "#555" }} />
      </div>
      <Form layout="vertical" hideRequiredMark style={{ padding: "20px", backgroundColor: "#F0FFF7" }}>
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
                  // placeholder="请输入您的昵称"
                  name="nickname"
                  onChange={this.inputChange}
                  disabled={this.state.disabled}
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
                  disabled={this.state.disabled}
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
                  disabled={this.state.disabled}
                  name="gender"
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
                { type: 'email', message: '请输入正确的邮箱' }
                ],
              })(
                <Input
                  style={{ width: '100%' }}
                  disabled={this.state.disabled}
                  placeholder="请输入您的邮箱"
                  name="email"
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
                  name="brithday"
                  disabled={this.state.disabled}
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  onChange={this.brithdayChange}
                />
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
                  name="residence"
                  disabled={this.state.disabled}
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
                  disabled={this.state.disabled}
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
                { pattern: new RegExp(/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/, "g"), message: '请输入正确的手机号' }
                ],
              })(
                <Input
                  style={{ width: '100%' }}
                  name="phoneNumber"
                  placeholder="请输入正确的手机号"
                  type='number'
                  disabled={this.state.disabled}
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
                { pattern: new RegExp(/^[1-9][0-9]{5}$/, "g"), message: '请输入正确的邮编' }
                ],
              })(
                <Input
                  style={{ width: '100%' }}
                  name="zipcode"
                  disabled={this.state.disabled}
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
                  disabled={this.state.disabled}
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
                  disabled={this.state.disabled}
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
          width: '100%',
          borderBottom: '1px solid #e9e9e9',
          padding: '15px 16px',
          textAlign: 'right',

        }}
      >
        <Button onClick={this.onSubmit} type="primary" disabled={this.state.disabled}>
          保存数据
                </Button>
      </div>

    </div>)
  }
}

export default Form.create()(EditUserInfo)