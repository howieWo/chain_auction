import React from 'react'
import { Steps, Modal, Button, message, notification, Form, Input, Tag, InputNumber, Tooltip, Icon, Upload  } from 'antd';
import '../App.css'
import TextArea from 'antd/lib/input/TextArea';
import moment from 'moment'
import {web3, AppContract, getContract, saveJsonToIPFS, readJsonFromIpfs, ipfsPrefix, saveImageToIpfs} from '../Utils'
import BigNumber  from 'bignumber.js'
const Step = Steps.Step;
const confirm = Modal.confirm;
const Dragger = Upload.Dragger;
const CheckableTag = Tag.CheckableTag;
const tagsFromServer = ['环球名物', '数码周边', '手机周边', '大家电', '可穿戴'];
let id = 0;

const steps = [{
    title: '填写基本信息',
    content: 'First-content',
  }, {
    title: '上传展示图片和视频',
    content: 'Second-content',
  }, {
    title: '发起者介绍',
    content: 'Last-content',
  }, {
    title: '完成提交',
    content: 'Last-content',
  }];

class GoFunding extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            current: 0,
            selectedTags: [],
            fundingName: "",
            fundingSynopsis: "",
            goodsName: "",
            goodsSynopsis: "",
            goodsType: [],
            fundingTarget: "",
            fundingPrice: "",
            onlinePrice: "",
            fundingTop: "",
            fundingDay: "",
            indexImgs: [],
            indexImgsName: [],
            indexImgsList: [],
            goodsImgs:[],
            goodsImgsName: [],
            goodsImgsList:[],
            goodsDecImgs: [],
            goodsDecImgsName: [],
            goodsDecImgsList: [],
            rotationImgs: [],
            rotationImgsName: [],
            rotationImgsList: [],
            goodsDecVideo: [],
            goodsDecVideoName: [],
            goodsDecVideoList: [],
            goodsTypeInput: [],
            teamImgs:[],
            teamImgsName: [],
            teamImgsList:[],
            projectScheduleImgs: [],
            projectScheduleImgsName: [],
            projectScheduleImgsList: [],
            frequentlyQuestions:[],
            frequentlyQuestionsName:[],
            frequentlyQuestionsList:[],
            examiningReport: [],
            examiningReportName: [],
            examiningReportList: [],
            teamIntroduce: "",
            detailedTeamIntroduce: "",
            weiboAddress: "",
            thankLetter: "",
            contactNumber: "",
            estimatedShipment: "",
            
        };
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
    }

    next() {
        console.log(this.state.goodsDecVideo)
        console.log(this.state.teamImgs)

        let flag = false;
        // 检查一下current，然后封装到state中
        if( this.state.current === 0 ) {
            if(this.state.selectedTags.length <= 0) {
                message.error("请选中至少一个标签！")
                return
            }

            console.log("把第一页数据封装了")
            const fundingName = this.props.form.getFieldValue('fundingName')
            if(fundingName === undefined) {
                message.error("请填入您的项目名称！")
                return
            }
            const fundingSynopsis = this.props.form.getFieldValue('fundingSynopsis')
            if( fundingSynopsis === undefined ) {
                message.error("请填入您的一句话简介！")
                return
            } 
            const fundingTarget = this.props.form.getFieldValue('fundingTarget')
            if( fundingTarget === undefined ) {
                message.error("请填入您的众筹总额！")
                return
            }
        
            const fundingPrice = this.props.form.getFieldValue('fundingPrice')
            if(fundingPrice === undefined) {
                message.error("请填入您项目的最低支持金额！")
                return
            }
            const onlinePrice = this.props.form.getFieldValue('onlinePrice')
            if(onlinePrice === undefined) {
                message.error("请填入您商品的上架价格！")
                return
            }
            
            const fundingTop = this.props.form.getFieldValue('fundingTop')
            if(fundingTop === undefined) {
                message.error("请填入您商品的筹资上限！")
                return
            }

            const fundingDay = this.props.form.getFieldValue('fundingDay')
            if(fundingDay === undefined) {
                message.error("请填入您商品的筹资天数！")
                return
            }

            console.log(fundingName + fundingSynopsis + fundingTarget + fundingPrice
                + onlinePrice + fundingTop + fundingDay
                )
            
            this.setState({
                fundingName,
                fundingSynopsis,
                fundingTarget,
                fundingPrice,
                onlinePrice,
                fundingTop,
                fundingDay,
            })

            // this.setState({
            //     fundingTarget,
            //     fundingPrice,
            //     onlinePrice
            // })
            if((this.state.goodsName !== "" || this.state.goodsSynopsis !== "")) {
                setTimeout(()=>{
                    this.props.form.setFieldsValue({
                        "goodsName":this.state.goodsName,
                        "goodsSynopsis": this.state.goodsSynopsis,
                    });
                    this.setGoodsTypeInput()
                },0)
            }
        } else if ( this.state.current === 1 ) {
            const goodsName = this.props.form.getFieldValue('goodsName')
            if(goodsName === undefined) {
                message.error("请填入您的商品名称！")
                return
            }
            const goodsSynopsis = this.props.form.getFieldValue('goodsSynopsis')
            if( goodsSynopsis === undefined ) {
                message.error("请填入您的商品简介！")
                return
            }
            // 通过名称获取到相应的类型数据
            console.log(this.state.goodsTypeInput)
            const { form } = this.props;
            const keys = form.getFieldValue('keys');
            keys.map((v,i) => {
                const type = this.props.form.getFieldValue(`names[${v}]`)
                console.log("type" + type)
                if(type === "" || type === undefined) {
                    message.error(`第${i+1}个类型输入框不允许为空！`)
                    flag = true
                } else {
                    this.state.goodsType.push(type)
                }
            
            })
            console.log(keys)
            if(this.state.indexImgs.length <= 0) {
                message.error("请上传至少一张首页图片")
                return
            }
            if(this.state.goodsImgs.length <= 0) {
                message.error("请上传至少一张展示图片")
                return

            }
            if(this.state.goodsDecImgs.length <= 0) {
                message.error("请上传至少一张详情图片")
                return
            }
            if(this.state.goodsDecVideo.length <= 0) {
                message.error("请上传产品详情展示视频")
                return
            }
            // 还要把数据封装到state中
            this.setState({
                goodsName: goodsName,
                goodsSynopsis: goodsSynopsis
            })
           
            if(this.state.teamIntroduce!==""
                ||this.state.detailedTeamIntroduce!==""
                ||this.state.weiboAddress!==""
                ||this.state.thankLetter!==""
                ||this.state.contactNumber!==""
                ||this.state.estimatedShipment!==""
            ){
                setTimeout(()=>{
                    this.props.form.setFieldsValue({
                        "teamIntroduce":this.state.teamIntroduce,
                        "detailedTeamIntroduce": this.state.detailedTeamIntroduce,
                        "weiboAddress": this.state.weiboAddress,
                        "thankLetter": this.state.thankLetter,
                        "contactNumber": this.state.contactNumber,
                        "estimatedShipment": this.state.estimatedShipment
                    });
                },0)
            }
        } else if( this.state.current === 2 ) {
            console.log("把第三页数据封装了")
            // 取出所有的数据，封装到state中
            // thankLetter 
            const teamIntroduce = this.props.form.getFieldValue('teamIntroduce')
            if(teamIntroduce === "" || teamIntroduce === undefined) {
                message.error("请填入您的自我介绍！")
                return
            }
            const detailedTeamIntroduce = this.props.form.getFieldValue('detailedTeamIntroduce')
            if(detailedTeamIntroduce === "" || detailedTeamIntroduce === undefined ) {
                message.error("请填入您的详细自我介绍！")
                return
            }

            const weiboAddress = this.props.form.getFieldValue('weiboAddress')

            const thankLetter = this.props.form.getFieldValue('thankLetter')
            if(thankLetter === "" || thankLetter === undefined ) {
                message.error("请填入您的感谢信！")
                return
            }

            const contactNumber = this.props.form.getFieldValue('contactNumber')
            if(contactNumber === "" || contactNumber === undefined ) {
                message.error("请填入您的联系电话号码！")
                return
            }

            const estimatedShipment = this.props.form.getFieldValue('estimatedShipment')
            if(estimatedShipment === "" || estimatedShipment === undefined ) {
                message.error("请填入预计奖励发货时间！")
                return
            }

            // 然后判断是否填充了图片
            if(this.state.teamImgs.length <= 0) {
                message.error("请上传至少一张团队简介图片")
                return
            }
            if(this.state.projectScheduleImgs.length <= 0) {
                message.error("请上传至少一张项目进度图片")
                return
            }
            if(this.state.frequentlyQuestions.length <= 0) {
                message.error("请上传至少一张常见问题图片")
                return
            }
            if(this.state.examiningReport.length <= 0) {
                message.error("请上传检验报告图片")
                return
            }

            // 将数据进行封装到state中
            this.setState({
                teamIntroduce,
                detailedTeamIntroduce,
                weiboAddress,
                thankLetter,
                contactNumber,
                estimatedShipment
            })

            console.log("indexImgs" + this.state.indexImgs)
            console.log("rotationImgs" + this.state.rotationImgs)
            console.log("goodsImgs" + this.state.goodsImgs)
            console.log("goodsDecImgs" + this.state.goodsDecImgs)
            console.log("goodsDecVideo" + this.state.goodsDecVideo)

            console.log("teamImgs" + this.state.teamImgs)
            console.log("projectScheduleImgs" + this.state.projectScheduleImgs)
            console.log("examiningReport" + this.state.examiningReport)
            console.log("frequentlyQuestions" + this.state.frequentlyQuestions)
        }
        if(flag) {
            return
        }
        const current = this.state.current + 1;
        this.setState({ current });
    }
    
    prev() {

        
        // 如果当前页是第四页，先把第三页相应的数据为其封装好
        // 然后再让它跳转页面
        if(this.state.current === 3) {
            // 对第三页的数据进行封装
            // teamIntroduce,
            // detailedTeamIntroduce,
            // weiboAddress,
            // thankLetter,
            // contactNumber,
            // estimatedShipment
            setTimeout(()=>{
                this.props.form.setFieldsValue({
                    "teamIntroduce":this.state.teamIntroduce,
                    "detailedTeamIntroduce": this.state.detailedTeamIntroduce,
                    "weiboAddress": this.state.weiboAddress,
                    "thankLetter": this.state.thankLetter,
                    "contactNumber": this.state.contactNumber,
                    "estimatedShipment": this.state.estimatedShipment
                });
            },0)
            
        } else if(this.state.current === 2) {
            if((this.state.goodsName !== "" || this.state.goodsSynopsis !== "")) {
                setTimeout(()=>{
                    this.props.form.setFieldsValue({
                        "goodsName":this.state.goodsName,
                        "goodsSynopsis": this.state.goodsSynopsis,
                    });
                    // 迫不得已的方法
                    this.setGoodsTypeInput()
                },0)
            }
        } else if(this.state.current === 1) {
            //     fundingName,
            //     fundingSynopsis,
            //     fundingTarget,
            //     fundingPrice,
            //     onlinePrice,
            //     fundingTop,
            //     fundingDay,
            setTimeout(()=>{
                this.props.form.setFieldsValue({
                    "fundingName": this.state.fundingName,
                    "fundingSynopsis": this.state.fundingSynopsis,
                    "fundingTarget": this.state.fundingTarget,
                    "fundingPrice": this.state.fundingPrice,
                    "onlinePrice":this.state.onlinePrice,
                    "fundingTop": this.state.fundingTop,
                    "fundingDay": this.state.fundingDay
                })
            },0)
        }

        const current = this.state.current - 1;
        this.setState({ current });
    }
    setGoodsTypeInput =()=> {
        // 迫不得已的方法
        if(this.state.goodsType.length === 1) {
            this.props.form.setFieldsValue({
                "names[0]" : this.state.goodsType[0]
            });
        }else if(this.state.goodsType.length === 2 ){
            this.props.form.setFieldsValue({
                "names[0]" : this.state.goodsType[0]
            });
            this.props.form.setFieldsValue({
                "names[1]" : this.state.goodsType[1]
            });
        }else if(this.state.goodsType.length === 3 ){
            this.props.form.setFieldsValue({
                "names[0]" : this.state.goodsType[0]
            });
            this.props.form.setFieldsValue({
                "names[1]" : this.state.goodsType[1]
            });
            this.props.form.setFieldsValue({
                "names[2]" : this.state.goodsType[2]
            });
        }else if(this.state.goodsType.length === 4 ){
            this.props.form.setFieldsValue({
                "names[0]" : this.state.goodsType[0]
            });
            this.props.form.setFieldsValue({
                "names[1]" : this.state.goodsType[1]
            });
            this.props.form.setFieldsValue({
                "names[2]" : this.state.goodsType[2]
            });
            this.props.form.setFieldsValue({
                "names[3]" : this.state.goodsType[3]
            });
        }else if(this.state.goodsType.length === 5 ){
            this.props.form.setFieldsValue({
                "names[0]" : this.state.goodsType[0]
            });
            this.props.form.setFieldsValue({
                "names[1]" : this.state.goodsType[1]
            });
            this.props.form.setFieldsValue({
                "names[2]" : this.state.goodsType[2]
            });
            this.props.form.setFieldsValue({
                "names[3]" : this.state.goodsType[3]
            });
            this.props.form.setFieldsValue({
                "names[4]" : this.state.goodsType[4]
            });
        }else if(this.state.goodsType.length === 6 ){
            this.props.form.setFieldsValue({
                "names[0]" : this.state.goodsType[0]
            });
            this.props.form.setFieldsValue({
                "names[1]" : this.state.goodsType[1]
            });
            this.props.form.setFieldsValue({
                "names[2]" : this.state.goodsType[2]
            });
            this.props.form.setFieldsValue({
                "names[3]" : this.state.goodsType[3]
            });
            this.props.form.setFieldsValue({
                "names[4]" : this.state.goodsType[4]
            });
            this.props.form.setFieldsValue({
                "names[5]" : this.state.goodsType[5]
            });
        }else if(this.state.goodsType.length === 7 ){
            this.props.form.setFieldsValue({
                "names[0]" : this.state.goodsType[0]
            });
            this.props.form.setFieldsValue({
                "names[1]" : this.state.goodsType[1]
            });
            this.props.form.setFieldsValue({
                "names[2]" : this.state.goodsType[2]
            });
            this.props.form.setFieldsValue({
                "names[3]" : this.state.goodsType[3]
            });
            this.props.form.setFieldsValue({
                "names[4]" : this.state.goodsType[4]
            });
            this.props.form.setFieldsValue({
                "names[5]" : this.state.goodsType[5]
            });
            this.props.form.setFieldsValue({
                "names[6]" : this.state.goodsType[6]
            });
        }else if(this.state.goodsType.length === 8 ){
            this.props.form.setFieldsValue({
                "names[0]" : this.state.goodsType[0]
            });
            this.props.form.setFieldsValue({
                "names[1]" : this.state.goodsType[1]
            });
            this.props.form.setFieldsValue({
                "names[2]" : this.state.goodsType[2]
            });
            this.props.form.setFieldsValue({
                "names[3]" : this.state.goodsType[3]
            });
            this.props.form.setFieldsValue({
                "names[4]" : this.state.goodsType[4]
            });
            this.props.form.setFieldsValue({
                "names[5]" : this.state.goodsType[5]
            });
            this.props.form.setFieldsValue({
                "names[6]" : this.state.goodsType[6]
            });
            this.props.form.setFieldsValue({
                "names[7]" : this.state.goodsType[7]
            });
        }
    }
    // 选中标签的操作
    handleChange(tag, checked) {
        const { selectedTags } = this.state;
        console.log(selectedTags)
        const nextSelectedTags = checked
            ? [...selectedTags, tag]
            : selectedTags.filter(t => t !== tag);
        this.setState({ selectedTags: nextSelectedTags });
    }

    // 移除新增的文本框
    remove = (k) => {
        const { form } = this.props;
        const keys = form.getFieldValue('keys');
        if (keys.length === 1) {
          return;
        }
    
        form.setFieldsValue({
          keys: keys.filter(key => key !== k),
        });
    }
    
    // 增加一个类型文本框
    add = () => {
        const { form } = this.props;
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(id++);
        form.setFieldsValue({
          keys: nextKeys,
        });
    }
    
    handleSubmit = (e) => {
        // e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const { keys, names } = values;
                console.log('Received values of form: ', values);
                console.log('Merged values:', keys.map(key => names[key]));
            }
        });
    }

    handleIndexImgsUpload = async(files) => {
        const hash = await saveImageToIpfs(files)
        console.log("图片的hash为：" + hash)
        const name = files.name
        this.state.indexImgsName.push(name)
        this.state.indexImgs.push(hash)
        this.setState({
            indexImgs:  this.state.indexImgs,
            indexImgsName: this.state.indexImgsName
        })
        // this.state.indexImgsList.
        // 先清除List中的所有元素
        this.state.indexImgsList.splice(0,this.state.indexImgsList.length)
        this.state.indexImgs.map((url,index) => {
            this.state.indexImgsList.push({
                uid: index,
                name: `${this.state.indexImgsName[index]}`,
                status: 'done',
                url: ipfsPrefix + url
            })
            this.setState({
                indexImgsList: this.state.indexImgsList
            })
            
        })
        notification.success({
            message: '上传成功',
            description: '图片已上传至ipfs!hash为：' + hash
        })
        console.log(this.state.indexImgs)
        return false
    }

    onFileIndexImgsRemove = (e) => {
        const indexArr = this.state.indexImgsName.map((v,i) => {
            if(v === e.name) {
                return i
            }
        })
        const index = indexArr.filter((v) => {
            if(v !== undefined) {
                return v
            }
        })[0]
        console.log(index)
        this.state.indexImgs.splice(index, 1)
        this.state.indexImgsName.splice(index, 1)
        this.state.indexImgsList.splice(index, 1)
        this.setState({
            indexImgs: this.state.indexImgs,
            indexImgsName: this.state.indexImgsName,
            indexImgsList: this.state.indexImgsList
        })
    }

    handleRotationImgsUpload = async(files) => {
        const hash = await saveImageToIpfs(files)
        console.log("图片的hash为：" + hash)
        const name = files.name
        this.state.rotationImgsName.push(name)
        this.state.rotationImgs.push(hash)
        this.setState({
            rotationImgsName: this.state.rotationImgsName,
            rotationImgs: this.state.rotationImgs
        })
        this.state.rotationImgsList.splice(0,this.state.rotationImgsList.length)
        this.state.rotationImgs.map((url,index) => {
            this.state.rotationImgsList.push({
                uid: index,
                name: `${this.state.rotationImgsName[index]}`,
                status: 'done',
                url: ipfsPrefix + url
            })
            this.setState({
                rotationImgsList: this.state.rotationImgsList
            })
            
        })
        notification.success({
            message: '上传成功',
            description: '图片已上传至ipfs!hash为：' + hash
        })
        console.log(this.state.rotationImgs)
        console.log(this.state.rotationImgsList)
        return false
    }

    onFileRotationImgsRemove = (e) => {
        const indexArr = this.state.rotationImgsName.map((v,i) => {
            if(v === e.name) {
                return i
            }
        })
        const index = indexArr.filter((v) => {
            if(v !== undefined) {
                return v
            }
        })[0]
        this.state.rotationImgs.splice(index, 1)
        this.state.rotationImgsName.splice(index, 1)
        this.state.rotationImgsList.splice(index, 1)
        this.setState({
            rotationImgs: this.state.rotationImgs,
            rotationImgsName: this.state.rotationImgsName,
            rotationImgsList: this.state.rotationImgsList
        })
    }

    handleGoodsImgsUpload = async(files) => {
        const hash = await saveImageToIpfs(files)
        console.log("图片的hash为：" + hash)
        const name = files.name
        this.state.goodsImgsName.push(name)
        this.state.goodsImgs.push(hash)
        this.setState({
            goodsImgsName: this.state.goodsImgsName,
            goodsImgs: this.state.goodsImgs
        })
        this.state.goodsImgsList.splice(0,this.state.goodsImgsList.length)
        this.state.goodsImgs.map((url,index) => {
            this.state.goodsImgsList.push({
                uid: index,
                name: `${this.state.goodsImgsName[index]}`,
                status: 'done',
                url: ipfsPrefix + url
            })
            this.setState({
                goodsImgsList: this.state.goodsImgsList
            })
            
        })
        notification.success({
            message: '上传成功',
            description: '图片已上传至ipfs!hash为：' + hash
        })
        console.log(this.state.goodsImgs)
        return false
    }

    onFileGoodsImgsRemove = (e) => {
        const indexArr = this.state.goodsImgsName.map((v,i) => {
            if(v === e.name) {
                return i
            }
        })
        const index = indexArr.filter((v) => {
            if(v !== undefined) {
                return v
            }
        })[0]
        this.state.goodsImgs.splice(index, 1)
        this.state.goodsImgsName.splice(index, 1)
        this.state.goodsImgsList.splice(index, 1)
        this.setState({
            goodsImgs: this.state.goodsImgs,
            goodsImgsName: this.state.goodsImgsName,
            goodsImgsList: this.state.goodsImgsList
        })
    }


    handleGoodsDecImgsUpload = async(files) => {
        const hash = await saveImageToIpfs(files)
        console.log("图片的hash为：" + hash)
        const name = files.name
        this.state.goodsDecImgsName.push(name)
        this.state.goodsDecImgs.push(hash)
        this.setState({
            goodsDecImgsName: this.state.goodsDecImgsName,
            goodsDecImgs: this.state.goodsDecImgs
        })
        this.state.goodsDecImgsList.splice(0,this.state.goodsDecImgsList.length)
        this.state.goodsDecImgs.map((url,index) => {
            this.state.goodsDecImgsList.push({
                uid: index,
                name: `${this.state.goodsDecImgsName[index]}`,
                status: 'done',
                url: ipfsPrefix + url
            })
            this.setState({
                goodsDecImgsList: this.state.goodsDecImgsList
            })
            
        })
        notification.success({
            message: '上传成功',
            description: '图片已上传至ipfs!hash为：' + hash
        })
        console.log(this.state.goodsDecImgsList)
        console.log(this.state.goodsDecImgs)
        return false
    }

    onFileGoodsDecImgsRemove = (e) => {
        const indexArr = this.state.goodsDecImgsName.map((v,i) => {
            if(v === e.name) {
                return i
            }
        })
        const index = indexArr.filter((v) => {
            if(v !== undefined) {
                return v
            }
        })[0]
        this.state.goodsDecImgs.splice(index, 1)
        this.state.goodsDecImgsName.splice(index, 1)
        this.state.goodsDecImgsList.splice(index, 1)
        this.setState({
            goodsDecImgs: this.state.goodsDecImgs,
            goodsDecImgsName: this.state.goodsDecImgsName,
            goodsDecImgsList: this.state.goodsDecImgsList
        })
    }
    // notability
    // goodnotes
    // marginNote
    handleGoodsDecVideoUpload = async (files) => {
        const hash = await saveImageToIpfs(files)
        console.log("视频的hash为：" + hash)
        const name = files.name
        this.state.goodsDecVideoName.push(name)
        this.state.goodsDecVideo.push(hash)
        this.setState({
            goodsDecVideoName: this.state.goodsDecVideoName,
            goodsDecVideo: this.state.goodsDecVideo
        })
        this.state.goodsDecVideoList.splice(0,this.state.goodsDecVideoList.length)
        this.state.goodsDecVideo.map((url,index) => {
            this.state.goodsDecVideoList.push({
                uid: index,
                name: `${this.state.goodsDecVideoName[index]}`,
                status: 'done',
                url: ipfsPrefix + url
            })
            this.setState({
                goodsDecVideoList: this.state.goodsDecVideoList
            })
            
        })
        notification.success({
            message: '上传成功',
            description: '视频已上传至ipfs!hash为：' + hash
        })
        console.log("视频为 + " + this.state.goodsDecVideo)
        return false
    }

    onFileGoodsDecVideoRemove = (e) => {
        const indexArr = this.state.goodsDecVideoName.map((v,i) => {
            if(v === e.name) {
                return i
            }
        })
        const index = indexArr.filter((v) => {
            if(v !== undefined) {
                return v
            }
        })[0]
        this.state.goodsDecVideo.splice(index, 1)
        this.state.goodsDecVideoName.splice(index, 1)
        this.state.goodsDecVideoList.splice(index, 1)
        this.setState({
            goodsDecVideo: this.state.goodsDecVideo,
            goodsDecVideoName: this.state.goodsDecVideoName,
            goodsDecVideoList: this.state.goodsDecVideoList
        })
        console.log(this.state.goodsDecVideo)
    }


    handleTeamImgsUpload = async (files) => {
        const hash = await saveImageToIpfs(files)
        console.log("图片的hash为：" + hash)
        const name = files.name
        this.state.teamImgsName.push(name)
        this.state.teamImgs.push(hash)
        this.setState({
            teamImgs: this.state.teamImgs,
            teamImgsName: this.state.teamImgsName
        })
        this.state.teamImgsList.splice(0,this.state.teamImgsList.length)
        this.state.teamImgs.map((url,index) => {
            this.state.teamImgsList.push({
                uid: index,
                name: `${this.state.teamImgsName[index]}`,
                status: 'done',
                url: ipfsPrefix + url
            })
            this.setState({
                teamImgsList: this.state.teamImgsList
            })
            
        })
        notification.success({
            message: '上传成功',
            description: '视频已上传至ipfs!hash为：' + hash
        })
        return false
    }

    onFileTeamImgsRemove = (e) => {
        console.log(this.state.teamImgs)
        const indexArr = this.state.teamImgsName.map((v,i) => {
            if(v === e.name) {
                return i
            }
        })
        console.log(indexArr)
        const index = indexArr.filter((v) => {
            if(v !== undefined) {
                return v
            }
        })[0]
        console.log(index)
        this.state.teamImgs.splice(index, 1)
        this.state.teamImgsName.splice(index, 1)
        this.state.teamImgsList.splice(index, 1)
        this.setState({
            teamImgs: this.state.teamImgs,
            teamImgsName: this.state.teamImgsName,
            teamImgsList: this.state.teamImgsList
        })
        console.log(this.state.teamImgs)
    }

    handleScheduleImgsUpload = async (files) => {
        const hash = await saveImageToIpfs(files)
        console.log("视频的hash为：" + hash)
        const name = files.name
        this.state.projectScheduleImgsName.push(name)
        this.state.projectScheduleImgs.push(hash)
        this.setState({
            projectScheduleImgsName: this.state.projectScheduleImgsName,
            projectScheduleImgs: this.state.projectScheduleImgs
        })
        this.state.projectScheduleImgsList.splice(0,this.state.projectScheduleImgsList.length)
        this.state.projectScheduleImgs.map((url,index) => {
            this.state.projectScheduleImgsList.push({
                uid: index,
                name: `${this.state.projectScheduleImgsName[index]}`,
                status: 'done',
                url: ipfsPrefix + url
            })
            this.setState({
                projectScheduleImgsList: this.state.projectScheduleImgsList
            })
            
        })
        notification.success({
            message: '上传成功',
            description: '图片已上传至ipfs!hash为：' + hash
        })
        console.log(this.state.projectScheduleImgs)
        return false
    }

    onFileScheduleImgsRemove = (e) => {
        const indexArr = this.state.projectScheduleImgsName.map((v,i) => {
            if(v === e.name) {
                return i
            }
        })
        const index = indexArr.filter((v) => {
            if(v !== undefined) {
                return v
            }
        })[0]
        this.state.projectScheduleImgs.splice(index, 1)
        this.state.projectScheduleImgsName.splice(index, 1)
        this.state.projectScheduleImgsList.splice(index, 1)
        this.setState({
            projectScheduleImgs: this.state.projectScheduleImgs,
            projectScheduleImgsName: this.state.projectScheduleImgsName,
            projectScheduleImgsList: this.state.projectScheduleImgsList
        })
        console.log(this.state.projectScheduleImgs)
    }

    handleFrequentlyQuestionsUpload = async (files) => {
        const hash = await saveImageToIpfs(files)
        console.log("视频的hash为：" + hash)
        const name = files.name
        this.state.frequentlyQuestionsName.push(name)
        this.state.frequentlyQuestions.push(hash)
        this.setState({
            frequentlyQuestions: this.state.frequentlyQuestions,
            frequentlyQuestionsName: this.state.frequentlyQuestionsName
        })
        this.state.frequentlyQuestionsList.splice(0,this.state.frequentlyQuestionsList.length)
        this.state.frequentlyQuestions.map((url,index) => {
            this.state.frequentlyQuestionsList.push({
                uid: index,
                name: `${this.state.frequentlyQuestionsName[index]}`,
                status: 'done',
                url: ipfsPrefix + url
            })
            this.setState({
                frequentlyQuestionsList: this.state.frequentlyQuestionsList
            })
            
        })
        notification.success({
            message: '上传成功',
            description: '图片已上传至ipfs!hash为：' + hash
        })
        console.log(this.state.frequentlyQuestions)
        return false
    }

    onFileFrequentlyQuestionsRemove = (e) => {
        console.log(this.state.frequentlyQuestionsName)
        const indexArr = this.state.frequentlyQuestionsName.map((v,i) => {
            if(v === e.name) {
                return i
            }
        })
        const index = indexArr.filter((v) => {
            if(v !== undefined) {
                return v
            }
        })[0]
        this.state.frequentlyQuestions.splice(index, 1)
        this.state.frequentlyQuestionsName.splice(index, 1)
        this.state.frequentlyQuestionsList.splice(index, 1)
        this.setState({
            frequentlyQuestions: this.state.frequentlyQuestions,
            frequentlyQuestionsName: this.state.frequentlyQuestionsName,
            frequentlyQuestionsList: this.state.frequentlyQuestionsList
        })
        console.log(this.state.frequentlyQuestions)
    }
    

    handleExaminingReportUpload = async (files) => {
        const hash = await saveImageToIpfs(files)
        console.log("视频的hash为：" + hash)
        const name = files.name
        this.state.examiningReportName.push(name)
        this.state.examiningReport.push(hash)
        this.setState({
            examiningReport: this.state.examiningReport,
            examiningReportName: this.state.examiningReportName
        })
        this.state.examiningReportList.splice(0,this.state.examiningReportList.length)
        this.state.examiningReport.map((url,index) => {
            this.state.examiningReportList.push({
                uid: index,
                name: `${this.state.examiningReportName[index]}`,
                status: 'done',
                url: ipfsPrefix + url
            })
            this.setState({
                examiningReportList: this.state.examiningReportList
            })
            
        })
        notification.success({
            message: '上传成功',
            description: '图片已上传至ipfs!hash为：' + hash
        })
        console.log(this.state.examiningReport)
        return false
    }

    onFileExaminingReportRemove = (e) => {
        const indexArr = this.state.examiningReportName.map((v,i) => {
            if(v === e.name) {
                return i
            }
        })
        const index = indexArr.filter((v) => {
            if(v !== undefined) {
                return v
            }
        })[0]
        this.state.examiningReport.splice(index, 1)
        this.state.examiningReportName.splice(index, 1)
        this.state.examiningReportList.splice(index, 1)
        this.setState({
            examiningReport: this.state.examiningReport,
            examiningReportName: this.state.examiningReportName,
            examiningReportList: this.state.examiningReportList
        })
        console.log(this.state.examiningReport)
    }

    submitData = async() => {
        // 关闭当前
        const hide = message.loading('提交中数据中！');
                
        // 先封装出两个对象出来
        let fundingInfo = {}
        let goodsInfo = {}
        
        // 商品信息
        goodsInfo.goodsName = this.state.goodsName
        goodsInfo.goodsSynopsis = this.state.goodsSynopsis
        goodsInfo.goodsType = this.state.goodsType
        goodsInfo.indexImgs = this.state.indexImgs
        goodsInfo.indexImgsName = this.state.indexImgsName
        goodsInfo.indexImgsList = this.state.indexImgsList
        goodsInfo.goodsImgs = this.state.goodsImgs
        goodsInfo.goodsImgsName = this.state.goodsImgsName
        goodsInfo.goodsImgsList = this.state.goodsImgsList
        goodsInfo.goodsDecImgs = this.state.goodsDecImgs
        goodsInfo.goodsDecImgsName = this.state.goodsDecImgsName
        goodsInfo.goodsDecImgsList = this.state.goodsDecImgsList
        goodsInfo.rotationImgs = this.state.rotationImgs
        goodsInfo.rotationImgsName = this.state.rotationImgsName
        goodsInfo.rotationImgsList = this.state.rotationImgsList
        goodsInfo.goodsDecVideo = this.state.goodsDecVideo
        goodsInfo.goodsDecVideoName = this.state.goodsDecVideoName
        goodsInfo.goodsDecVideoList = this.state.goodsDecVideoList
        goodsInfo.goodsTypeInput = this.state.goodsTypeInput
        
        // 众筹信息和众筹团队以及项目相关信息
        fundingInfo.selectedTags = this.state.selectedTags
        fundingInfo.fundingName = this.state.fundingName
        fundingInfo.fundingSynopsis = this.state.fundingSynopsis
        fundingInfo.teamImgs = this.state.teamImgs
        fundingInfo.teamImgsName = this.state.teamImgsName
        fundingInfo.teamImgsList = this.state.teamImgsList
        fundingInfo.projectScheduleImgs = this.state.projectScheduleImgs
        fundingInfo.projectScheduleImgsName = this.state.projectScheduleImgsName
        fundingInfo.projectScheduleImgsList = this.state.projectScheduleImgsList
        fundingInfo.frequentlyQuestions = this.state.frequentlyQuestions
        fundingInfo.frequentlyQuestionsName = this.state.frequentlyQuestionsName
        fundingInfo.frequentlyQuestionsList = this.state.frequentlyQuestionsList
        fundingInfo.examiningReport = this.state.examiningReport
        fundingInfo.examiningReportName = this.state.examiningReportName
        fundingInfo.examiningReportList = this.state.examiningReportList
        fundingInfo.teamIntroduce = this.state.teamIntroduce
        fundingInfo.detailedTeamIntroduce = this.state.detailedTeamIntroduce
        fundingInfo.weiboAddress = this.state.weiboAddress
        fundingInfo.thankLetter = this.state.thankLetter
        fundingInfo.contactNumber = this.state.contactNumber
        fundingInfo.estimatedShipment = this.state.estimatedShipment
        fundingInfo.fundingTop = this.state.fundingTop
        // 然后转化成两个字符串

        const fundingInfoJson = JSON.stringify(fundingInfo)
        const goodsInfoJson = JSON.stringify(goodsInfo)

        // console.log(fundingInfoJson)
        // console.log(goodsInfoJson)

        // 需要直接传入到合约中的数据
        const fundingTarget = this.state.fundingTarget
        const fundingPrice = this.state.fundingPrice
        const onlinePrice = this.state.onlinePrice
        const fundingDay =  this.state.fundingDay
        const fundingStartDate = moment().format('L')
        const endTime = moment().add(Number(fundingDay), "days").format("YYYY-MM-DD HH:mm:ss")
        var date = moment(endTime).format()
        const fundingEndTimeStamp = moment(date).format("x")
        

        // 将相关数据传入到ipfs
        const fundingIpfsHash = await saveJsonToIPFS(fundingInfoJson)
        const goodsIpfsHash = await saveJsonToIPFS(goodsInfoJson)

        // console.log(fundingIpfsHash)
        // console.log(goodsIpfsHash)

        // 连接合约将其存储
        // 这里也有一点不一样的地方
        const fundingServiceAddr = await AppContract.methods.fundingService().call({
            from: this.state.account
        })
        const fundingService = await getContract("FundingService", fundingServiceAddr)

        const goodsHash1 = goodsIpfsHash.slice(0,23)
        const goodsHash2 = goodsIpfsHash.slice(23)
        const goodsHash1Val = web3.utils.asciiToHex(goodsHash1)
        const goodsHash2Val = web3.utils.asciiToHex(goodsHash2)

        const [account] = await web3.eth.getAccounts();
        // console.log(fundingService)
        await fundingService.methods.createFundingGoods(
                goodsHash1Val, 
                goodsHash2Val,
                web3.utils.toWei(fundingPrice), 
                web3.utils.toWei(onlinePrice), 
                web3.utils.toWei(fundingTarget), 
                fundingDay, 
                fundingEndTimeStamp).
            send({
            from: account,
            gas: '5000000'
        })

        // // 获取到User然后保存好
        const saveFundingAddr = await fundingService.methods.getFundingGoodsCurrent().call({
            from: account
        })
        console.log("save" + saveFundingAddr)
        // web3.utils.toWei(fundingTarget), 
        //

        // // 获取到FundingGoods实例，然后再把FundingGoods的相关信息设置上 
        const fundingGoods = await getContract("FundingGoods", saveFundingAddr)

        const fundingHash1 = fundingIpfsHash.slice(0,23)
        const fundingHash2 = fundingIpfsHash.slice(23)
        const fundingHash1Val = web3.utils.asciiToHex(fundingHash1)
        const fungingHash2Val = web3.utils.asciiToHex(fundingHash2)

        const poundage = (Number(fundingTarget) / 200).toString()

        // 扣除费用
        await fundingService.methods.poundage().send({
            from: account,
            value: web3.utils.toWei(poundage),
            gas: '5000000'
        })

        console.log("交易完成")
        // 更新完成众筹信息
        await fundingGoods.methods.updataFundingInfo(fundingHash1Val, fungingHash2Val).send({
            from: account,
            gas: '5000000'
        })
        // // 将这个众筹信息存储到用户的众筹列表中
        const userServiceAddr = await AppContract.methods.userService().call()
        const userService = await getContract("UserService", userServiceAddr)
        const UserAddr = await userService.methods.getUserByCurrent().call({
            from: account
        })
        const user = await getContract("User", UserAddr)
        const saveFunding = saveFundingAddr.substr(2)
        console.log(saveFunding)
        await user.methods.setFundingList(saveFunding).send({
            from: account,
            gas: '5000000'
        })

        message.success("保存成功!", 4)
    }
    
    onSubmit = async() => {

        // console.log(this.state.selectedTags)
        // console.log(this.state.fundingName)
        // console.log(this.state.fundingSynopsis)
        // console.log(this.state.goodsName)
        // console.log(this.state.goodsSynopsis)
        // console.log(this.state.goodsType)
        // console.log(this.state.fundingTarget)
        // console.log(this.state.fundingPrice)
        // console.log(this.state.onlinePrice)
        // console.log(this.state.fundingTop)
        // console.log(this.state.fundingDay)
        // console.log(this.state.indexImgs)
        // console.log(this.state.indexImgsName)
        // console.log(this.state.indexImgsList)
        // console.log(this.state.goodsImgs)
        // console.log(this.state.goodsImgsName)
        // console.log(this.state.goodsImgsList)
        // console.log(this.state.goodsDecImgs)
        // console.log(this.state.goodsDecImgsName)
        // console.log(this.state.goodsDecImgsList)
        // console.log(this.state.rotationImgs)
        // console.log(this.state.rotationImgsName)
        // console.log(this.state.rotationImgsList)
        // console.log(this.state.goodsDecVideo)
        // console.log(this.state.goodsDecVideoName)
        // console.log(this.state.goodsDecVideoList)
        // console.log(this.state.goodsTypeInput)
        // console.log(this.state.teamImgs)
        // console.log(this.state.teamImgsName)
        // console.log(this.state.teamImgsList)
        // console.log(this.state.projectScheduleImgs)
        // console.log(this.state.projectScheduleImgsName)
        // console.log(this.state.projectScheduleImgsList)
        // console.log(this.state.frequentlyQuestions)
        // console.log(this.state.frequentlyQuestionsName)
        // console.log(this.state.frequentlyQuestionsList)
        // console.log(this.state.examiningReport)
        // console.log(this.state.examiningReportName)
        // console.log(this.state.examiningReportList)
        // console.log(this.state.teamIntroduce)
        // console.log(this.state.detailedTeamIntroduce)
        // console.log(this.state.weiboAddress)
        // console.log(this.state.thankLetter)
        // console.log(this.state.contactNumber)
        // console.log(this.state.estimatedShipment)

        // 需要弹框提示，是否确定，然后再有异步框来异步上传一下
        confirm({
            title: '提示',
            content: "您确定要发起众筹吗？点击确定后不可众筹过程中不可下架，提交可能会非常耗时，请耐心等待！点击确定后请不要再点击取消按钮！",
            okText: '确定',
            cancelText: '取消',
            onOk: async()=>{
                await this.submitData()
                this.props.history.push("/")
            },
            onCancel() {
                console.log('Cancel');
            },
        });
        
    }

    render() {
        const { current } = this.state
        const { getFieldDecorator, getFieldValue } = this.props.form
        const { selectedTags } = this.state;
        getFieldDecorator('keys', { initialValue: this.state.goodsType });
        // 封装首页列表图片
        const indexImgsList = this.state.indexImgs.map((url,index) => {
            return {
                uid: index,
                name: `${this.state.indexImgsName[index]}`,
                status: 'done',
                url: ipfsPrefix + url
            }
        })
        // console.log("file" + JSON.stringify(indexImgsList))
        const indexImgProps = {
            name: "indexImgs",
            // action: 'http://localhost:7300',
            beforeUpload: this.handleIndexImgsUpload,
            onRemove: this.onFileIndexImgsRemove,
            multiple: true,
            listType: 'picture',
            fileList: this.state.indexImgsList
        }

        // 封装轮播图
        const rotationImgsList = this.state.rotationImgs.map((url,index) => {
            return {
                uid: index,
                name: `${this.state.rotationImgsName[index]}`,
                status: 'done',
                url: ipfsPrefix + url
            }
        })
        const rotationImgsProps = {
            name: "rotationImgs",
            // action: '//jsonplaceholder.typicode.com/posts/',
            beforeUpload: this.handleRotationImgsUpload,
            onRemove: this.onFileRotationImgsRemove,
            multiple: true,
            listType: 'picture',
            fileList: this.state.rotationImgsList
        }

        // 封装商品展示图片
        const goodsImgsList = this.state.goodsImgs.map((url,index) => {
            return {
                uid: index,
                name: `${this.state.goodsImgsName[index]}`,
                status: 'done',
                url: ipfsPrefix + url
            }
        })
        const goodsImgsProps = {
            name: "goodsImgs",
            // action: '//jsonplaceholder.typicode.com/posts/',
            beforeUpload: this.handleGoodsImgsUpload,
            onRemove: this.onFileGoodsImgsRemove,
            multiple: true,
            listType: 'picture',
            fileList: this.state.goodsImgsList
        }

        
        // 封装商品详细信息图片

        const goodsDecImgsList = this.state.goodsDecImgs.map((url,index) => {
            return {
                uid: index,
                name: `${this.state.goodsDecImgsName[index]}`,
                status: 'done',
                url: ipfsPrefix + url
            }
        })

        const goodsDecImgsProps = {
            name: "goodsDec",
            // action: '//jsonplaceholder.typicode.com/posts/',
            beforeUpload: this.handleGoodsDecImgsUpload,
            onRemove: this.onFileGoodsDecImgsRemove,
            multiple: true,
            listType: 'picture',
            fileList: this.state.goodsDecImgsList
        }

        // 封装视频信息
        const goodsDecVideoList = this.state.goodsDecVideo.map((url,index) => {
            return {
                uid: index,
                name: `${this.state.goodsDecVideoName[index]}`,
                status: 'done',
                url: ipfsPrefix + url
            }
        })


        // console.log("file" + JSON.stringify(goodsImgsList))
        // 封装商品视频信息
        const goodsDecVideoProps = {
            name: "goodsDecVideo",
            // action: '//jsonplaceholder.typicode.com/posts/',
            beforeUpload: this.handleGoodsDecVideoUpload,
            onRemove: this.onFileGoodsDecVideoRemove,
            multiple: false,
            listType: 'text',
            fileList: this.state.goodsDecVideoList
        }

        // 封装团队图片信息
        const teamImgsList = this.state.teamImgs.map((url,index) => {
            return {
                uid: index,
                name: `${this.state.teamImgsName[index]}.png`,
                status: 'done',
                url: ipfsPrefix + url
            }
        })

        const teamImgsProps = {
            name: "teamImgs",
            // action: '//jsonplaceholder.typicode.com/posts/',
            beforeUpload: this.handleTeamImgsUpload,
            onRemove: this.onFileTeamImgsRemove,
            multiple: true,
            listType: 'picture',
            fileList: this.state.teamImgsList
        }
        
        // 封装项目进度表
        const projectScheduleImgsList = this.state.projectScheduleImgs.map((url,index) => {
            return {
                uid: index,
                name: `${this.state.projectScheduleImgsName[index]}`,
                status: 'done',
                url: ipfsPrefix + url
            }
        })

        // console.log("file" + JSON.stringify(projectScheduleImgsList))
        const projectScheduleProps = {
            name: "projectSchedule",
            // action: '//jsonplaceholder.typicode.com/posts/',
            beforeUpload: this.handleScheduleImgsUpload,
            onRemove: this.onFileScheduleImgsRemove,
            multiple: true,
            listType: 'picture',
            fileList: this.state.projectScheduleImgsList
        }


        // 封装常见问题
        const frequentlyQuestionsList = this.state.frequentlyQuestions.map((url,index) => {
            return {
                uid: index,
                name: `${this.state.frequentlyQuestionsName[index]}`,
                status: 'done',
                url: ipfsPrefix + url
            }
        })

        // console.log("file" + JSON.stringify(frequentlyQuestionsList))
        const frequentlyQuestionsProps = {
            name: "frequentlyQuestions",
            // action: '//jsonplaceholder.typicode.com/posts/',
            beforeUpload: this.handleFrequentlyQuestionsUpload,
            onRemove: this.onFileFrequentlyQuestionsRemove,
            multiple: true,
            listType: 'picture',
            fileList: this.state.frequentlyQuestionsList
        }
        
        // 封装质量报告
        const examiningReportList = this.state.examiningReport.map((url,index) => {
            return {
                uid: index,
                name: `${this.state.examiningReportName[index]}`,
                status: 'done',
                url: ipfsPrefix + url
            }
        })

        // console.log("file" + JSON.stringify(frequentlyQuestionsList))
        const examiningReportProps = {
            name: "examiningReport",
            // action: '//jsonplaceholder.typicode.com/posts/',
            beforeUpload: this.handleExaminingReportUpload,
            onRemove: this.onFileExaminingReportRemove,
            multiple: true,
            listType: 'picture',
            fileList: this.state.examiningReportList
        }

        //封装商品类型信息
        const keys = getFieldValue('keys');
        const formItems = keys.map((k, index) => (
            <Form.Item
            required={false}
            key={k}
            style={{marginTop: "20px"}}
            >
            {getFieldDecorator(`names[${k}]`, {
                validateTrigger: ['onChange', 'onBlur'],
                rules: [{
                required: true,
                whitespace: true,
                message: "此项不允许为空！",
                }],
            })(
                <Input placeholder="请输入种类名称" style={{ width: '50%'}}/>
            )}
            {keys.length > 1 ? (
                <Icon
                className="dynamic-delete-button"
                type="minus-circle-o"
                onClick={() => this.remove(k)}
                />
            ) : null}
            </Form.Item>
        ));

        const fundingInfoPage = <div className="go-funding-info">
            <div>
                <span style={{ marginRight: 8, display: 'inline', fontSize: "14px", fontWeight: "400" }}>* 标签:</span>
                {tagsFromServer.map(tag => (
                <CheckableTag
                    key={tag}
                    checked={selectedTags.indexOf(tag) > -1}
                    onChange={checked => this.handleChange(tag, checked)}
                    style={{fontSize: "14px"}}
                >
                    {tag}
                </CheckableTag>
                ))}
            </div>
            {/* 此处可以设置一下自动上线逻辑 */}
            <Form layout="vertical" hideRequiredMark style={{paddingTop: "20px"}}>
                <Form.Item label="* 项目名称：">
                    {getFieldDecorator('fundingName', {
                        rules: [{ required: true, message: '项目名称不能为空' }],
                    })(
                        <Input
                        placeholder="项目名称尽量不多于25个字"
                        style={{ width: '50%' }}
                        name="fundingName"
                        />
                    )}
                </Form.Item>
                <Form.Item label="* 一句话说明：">
                    {getFieldDecorator('fundingSynopsis', {
                        rules: [{ required: true, message: '一句话说明不能为空' }],
                    })(
                        <Input
                        placeholder="请用一句话简介项目内容（请尽量不超过50字）"
                        style={{ width: '50%' }}
                        name="fundingSynopsis"
                        />
                    )}
                </Form.Item>
                <Form.Item label={(
                        <span>
                        * 众筹金额&nbsp;
                        <Tooltip title="此项是需要众筹的总金额">
                            <Icon type="question-circle-o" />
                        </Tooltip>
                        </span>
                    )}>
                    {getFieldDecorator('fundingTarget', {
                        rules: [{ required: true, message: '众筹金额不能为空' }],
                    })(
                        <Input
                        placeholder="不少于XX"
                        style={{ width: '20%' }}
                        name="fundingTarget"
                        suffix="ETH"
                        type="number"
                        />
                    )}
                </Form.Item>
                <Form.Item label={(
                        <span>
                        * 每次一份支持金额&nbsp;
                        <Tooltip title="此项是每一个支持者最低支持的金额，可以理解为众筹时的价格">
                            <Icon type="question-circle-o" />
                        </Tooltip>
                        </span>
                    )}>
                    {getFieldDecorator('fundingPrice', {
                        rules: [{ required: true, message: '众筹价格不能为空' }],
                    })(
                        <Input
                        placeholder="请填入每一份支持的金额"
                        style={{ width: '20%' }}
                        name="fundingTarget"
                        suffix="ETH"
                        type="number"
                        />
                        
                    )}
                </Form.Item>
                <Form.Item label={(
                        <span>
                        * 商品上架价格&nbsp;
                        <Tooltip title="此项是众筹完成后，在商城上线时的价格">
                            <Icon type="question-circle-o" />
                        </Tooltip>
                        </span>
                    )}>
                    {getFieldDecorator('onlinePrice', {
                        rules: [{ required: true, message: '上架价格不能为空' }],
                    })(
                        <Input
                        placeholder="上架价格不能为空"
                        style={{ width: '20%' }}
                        name="onlinePrice"
                        suffix="ETH"
                        type="number"
                        />
                    )}
                </Form.Item>
                <Form.Item label="* 筹资上限">
                    {getFieldDecorator('fundingTop', {
                        rules: [{ required: true, message: '筹资上限不能为空' }],
                    })(
                        <InputNumber
                        placeholder="不少于100%"
                        initialValue={100}
                        min={0}
                        max={1000}
                        style={{ width: '40%' }}
                        formatter={value => `${value}%`}
                        parser={value => value.replace('%', '')}
                        name="fundingTop"
                        />
                    )}
                </Form.Item>
                <Form.Item label="* 筹资天数">
                    {getFieldDecorator('fundingDay', {
                        rules: [{ required: true, message: '筹资天数不能为空' }],
                    })(
                        <InputNumber
                        placeholder="10-60天"
                        initialValue={100}
                        min={0}
                        max={60}
                        style={{ width: '40%' }}
                        name="fundingDay"
                        />
                    )}
                </Form.Item>
            </Form>
        </div>

        const GoodsInfoPage = <div className="go-funding-info">
            {/* 此处可以设置一下自动上线逻辑 */}
            <Form layout="vertical" hideRequiredMark style={{paddingTop: "20px"}}>
                <Form.Item label="* 商品名称：">
                    {getFieldDecorator('goodsName', {
                        rules: [{ required: true, message: '商品名称不能为空' }],
                    })(
                        <Input
                        placeholder="请输入商品名称"
                        style={{ width: '50%' }}
                        name="goodsName"
                        />
                    )}
                </Form.Item>
                <Form.Item label="* 产品简介：">
                    {getFieldDecorator('goodsSynopsis', {
                        rules: [{ required: true, message: '产品简介不能为空' }],
                    })(
                        <TextArea
                        placeholder="请简要叙述您的项目"
                        style={{ width: '50%' }}
                        rows={4}
                        name="goodsSynopsis"
                        />
                    )}
                </Form.Item>
                <label htmlFor="* 添加商品种类：">添加商品种类</label>
                {formItems}
                <Form.Item>
                    <Button onClick={this.add} style={{ width: '50%', marginTop: "20px" }}>
                        <Icon type="plus" /> 添加商品种类
                    </Button>
                </Form.Item>
                <Form.Item style={{width: "50%"}} label={(
                        <span>
                        * 上传首页图片&nbsp;
                        <Tooltip title="这些图片用来在首页的列表中进行展示">
                            <Icon type="question-circle-o" />
                        </Tooltip>
                        </span>
                    )}>
                    <Dragger {...indexImgProps}>
                        <p className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">点击此区域或者拖拽文件到此区域来上传文件</p>
                        <p className="ant-upload-hint">支持单文件上传或者多文件上传，多文件上传时请按住`ctrl`键来选中多个文件</p>
                    </Dragger>
                </Form.Item>

                <Form.Item style={{width: "50%"}} label={(
                        <span>
                        * 上传轮播图片&nbsp;
                        <Tooltip title="这些图片用来放到首页的轮播图中展示">
                            <Icon type="question-circle-o" />
                        </Tooltip>
                        </span>
                    )}>
                    <Dragger {...rotationImgsProps}>
                        <p className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">点击此区域或者拖拽文件到此区域来上传文件</p>
                        <p className="ant-upload-hint">支持单文件上传或者多文件上传，多文件上传时请按住`ctrl`键来选中多个文件</p>
                    </Dragger>
                </Form.Item>

                <Form.Item style={{width: "50%"}} label={(
                        <span>
                        * 上传展示图片&nbsp;
                        <Tooltip title="这些图片用来在详情页展示">
                            <Icon type="question-circle-o" />
                        </Tooltip>
                        </span>
                    )}>
                    <Dragger {...goodsImgsProps}>
                        <p className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">点击此区域或者拖拽文件到此区域来上传文件</p>
                        <p className="ant-upload-hint">支持单文件上传或者多文件上传，多文件上传时请按住`ctrl`键来选中多个文件</p>
                    </Dragger>
                </Form.Item>
                <Form.Item style={{width: "50%"}} label={(
                        <span>
                        * 上传商品描述图片&nbsp;
                        <Tooltip title="这些图片可以包含文字等信息，主要是对商品进行详细的介绍">
                            <Icon type="question-circle-o" />
                        </Tooltip>
                        </span>
                    )}>
                    <Dragger {...goodsDecImgsProps}>
                        <p className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">点击此区域或者拖拽文件到此区域来上传文件</p>
                        <p className="ant-upload-hint">支持单文件上传或者多文件上传，多文件上传时请按住`ctrl`键来选中多个文件</p>
                    </Dragger>
                </Form.Item>
                
                <Form.Item style={{width: "50%"}} label={(
                        <span>
                        * 上传商品描述视频（请确保您的视频大小在10M以内）&nbsp;
                        <Tooltip title="商品视频描述信息">
                            <Icon type="question-circle-o" />
                        </Tooltip>
                        </span>
                    )}>
                    <Dragger {...goodsDecVideoProps}>
                        <p className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">点击此区域或者拖拽文件到此区域来上传文件</p>
                        <p className="ant-upload-hint">仅支持单文件上传</p>
                    </Dragger>
                </Form.Item>
            </Form>
        </div>

        const sponsorInfo = <div className="go-funding-info">
            {/* 此处可以设置一下自动上线逻辑 */}
            <Form layout="vertical" hideRequiredMark>
                <Form.Item label="* 自我介绍（团队名称之类的）：">
                    {getFieldDecorator('teamIntroduce', {
                        rules: [{ required: true, message: '自我介绍！不能为空' }],
                    })(
                        <Input
                        placeholder="请输入自我介绍"
                        style={{ width: '50%' }}
                        name="teamIntroduce"
                        />
                    )}
                </Form.Item>
                <Form.Item label="* 详细自我介绍：">
                    {getFieldDecorator('detailedTeamIntroduce', {
                        rules: [{ required: true, message: '自我介绍！不能为空' }],
                    })(
                        <TextArea
                        placeholder="请输入详细自我介绍"
                        style={{ width: '50%' }}
                        rows={4}
                        name="detailedTeamIntroduce"
                        />
                    )}
                </Form.Item>
                
                <Form.Item label="微博/博客地址：">
                    {getFieldDecorator('weiboAddress')(
                        <Input
                        placeholder="请输入微博/博客地址（可选）"
                        style={{ width: '50%' }}
                        name="weiboAddress"
                        />
                    )}
                </Form.Item>
                
                <Form.Item label="* 感谢信：">
                    {getFieldDecorator('thankLetter', {
                        rules: [{ required: true, message: '感谢信不能为空' }],
                    })(
                        <TextArea
                        placeholder="请输入感谢信"
                        style={{ width: '50%' }}
                        rows={4}
                        name="thankLetter"
                        />
                    )}
                </Form.Item>
                
                <Form.Item label="* 联系电话：">
                    {getFieldDecorator('contactNumber', {
                          rules: [{ required: true, message: '联系方式必填' },
                                  { pattern:new RegExp(/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/, "g"),  message: '请输入正确的手机号'}
                        ],
                      })(
                          <Input
                          style={{ width: '50%' }}
                          name="contactNumber"
                          placeholder="此项信息不会展示在详情页中"
                          type='number'
                          />
                      )}
                </Form.Item>
                
                <Form.Item label={(
                        <span>
                        * 预计回报时间&nbsp;
                        <Tooltip title="此处填写众筹成功后，预计多少天内给支持者发货">
                            <Icon type="question-circle-o" />
                        </Tooltip>
                        </span>
                    )}>
                    {getFieldDecorator('estimatedShipment')(
                        <InputNumber
                        placeholder="请填入预计回报时间"
                        style={{ width: '50%' }}
                        min={1}
                        name="estimatedShipment"
                        />
                    )}
                </Form.Item>
                {/* {
                    console.log(JSON.stringify(teamImgsProps) + JSON.stringify(projectScheduleProps) + JSON.stringify(frequentlyQuestionsProps))
                } */}
                <Form.Item style={{width: "50%"}} label={(
                        <span>
                        * 上传团队介绍图片&nbsp;
                        <Tooltip title="这些图片可以包含文字或者团队介绍照片">
                            <Icon type="question-circle-o" />
                        </Tooltip>
                        </span>
                    )}>
                    {
                        console.log(teamImgsProps)
                    }
                    <Dragger {...teamImgsProps}>
                        <p className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">点击此区域或者拖拽文件到此区域来上传文件</p>
                        <p className="ant-upload-hint">支持单文件上传或者多文件上传，多文件上传时请按住`ctrl`键来选中多个文件</p>
                    </Dragger>
                </Form.Item>
                <Form.Item style={{width: "50%"}} label={(
                        <span>
                        * 上传项目计划表&nbsp;
                        <Tooltip title="项目计划表">
                            <Icon type="question-circle-o" />
                        </Tooltip>
                        </span>
                    )}>
                    {
                        console.log(projectScheduleProps)
                    }
                    <Dragger {...projectScheduleProps}>
                        <p className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">点击此区域或者拖拽文件到此区域来上传文件</p>
                        <p className="ant-upload-hint">支持单文件上传或者多文件上传，多文件上传时请按住`ctrl`键来选中多个文件</p>
                    </Dragger>
                </Form.Item>

                <Form.Item style={{width: "50%"}} label={(
                        <span>
                        * 常见问题&nbsp;
                        <Tooltip title="常见问题">
                            <Icon type="question-circle-o" />
                        </Tooltip>
                        </span>
                    )}>
                    {
                        console.log(frequentlyQuestionsProps)
                    }
                    <Dragger {...frequentlyQuestionsProps}>
                        <p className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">点击此区域或者拖拽文件到此区域来上传文件</p>
                        <p className="ant-upload-hint">支持单文件上传或者多文件上传，多文件上传时请按住`ctrl`键来选中多个文件</p>
                    </Dragger>
                </Form.Item>
                <Form.Item style={{width: "50%"}} label={(
                        <span>
                        * 质量检测报告&nbsp;
                        <Tooltip title="质量检测报告">
                            <Icon type="question-circle-o" />
                        </Tooltip>
                        </span>
                    )}>
                    {
                        console.log(examiningReportProps)
                    }
                    <Dragger {...examiningReportProps}>
                        <p className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">点击此区域或者拖拽文件到此区域来上传文件</p>
                        <p className="ant-upload-hint">支持单文件上传或者多文件上传，多文件上传时请按住`ctrl`键来选中多个文件</p>
                    </Dragger>
                </Form.Item>
            </Form>
        </div>

        return (
        <div>
            <Steps current={current} style={{marginTop: "20px"}}>
            {steps.map(item => <Step key={item.title} title={item.title} />)}
            </Steps>
            <div>{
                current === 0?<div className="go-funding-content">
                                <div className="go-funding-title">项目信息</div>
                                {fundingInfoPage}
                            </div>
                            :current === 1?<div className="go-funding-content">
                                <div className="go-funding-title">众筹商品信息</div>
                                {GoodsInfoPage}
                            </div>
                            :current === 2?<div className="go-funding-content">
                                <div className="go-funding-title">发起人简介</div>
                                {sponsorInfo}
                            </div>:undefined
            }</div>
            <div className="steps-action">
            {
                current < steps.length - 1
                && <Button type="primary" style={{width: "130px", height: '45px'}} onClick={() => this.next()}>下一步</Button>
            }
            {
                current === steps.length - 1
                && <Button type="primary" style={{width: "130px", height: '45px'}} onClick={this.onSubmit}>完成</Button>
            }
            {
                current > 0
                && (
                <Button style={{ marginLeft: 8, width: "130px", height: '45px'}} onClick={() => this.prev()}>
                上一步
                </Button>
                )
            }
            </div>
        </div>
        );
    }
}

export default Form.create()(GoFunding)