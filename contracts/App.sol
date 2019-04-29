pragma solidity >=0.4.22 <0.6.0;


// 因为App合约是和外界通信的唯一合约
// 所有的执行操作都在这个合约中进行
contract App {
    // 发起者
    address payable public Sponsor;
    address public fundingService ;
    address public userService ;
    
    // 拍卖列表
    // address [] public AuctionList;

    constructor() public {
        Sponsor = msg.sender;
        // 创建出所有的操作对象，并将其暴露出去
        fundingService = address(new FundingService(Sponsor));
        userService = address(new UserService(Sponsor));
    }

    // 判断当前是不是合约发起者
    function isSponsor() public view returns(bool){
        return msg.sender == Sponsor;
    }

    // // 返回所有的拍卖列表
    // function getAuctionList() public {
    //     // return AuctionList;
    // }                                                                                                                                                                                                                                                                                                  

}

contract FundingService {
    // 众筹列表
    address [] public FundingList;
    address payable public Sponsor;
    address [] fundingListOnline;
    mapping (address=>address) UserFundingMapping;
    address fundingGoods; // 这个东西应该加上线程锁才对
    constructor(address payable _sponsor) public {
        Sponsor = _sponsor;
    }

    function createFundingGoods(bytes23 _goodsHash1, bytes23 _goodsHash2, 
            uint _fundingPrice, uint _onlinePrice, uint _target, uint _validDay, 
            string memory _fundingEndTimeStamp) public returns(address){
        address newFundingGoods = address(new FundingGoods(Sponsor, msg.sender, _fundingPrice,
                                    _onlinePrice, _target, _validDay, _fundingEndTimeStamp,
                                    _goodsHash1, _goodsHash2));
        // 在创建完新的众筹之后，还应该修改用户IPFS上的信息
        FundingList.push(newFundingGoods);
        // UserFundingMapping[msg.sender] = newFundingGoods;
        fundingGoods = newFundingGoods;

    }

     function poundage() payable public{
        uint value = msg.value;
        // 收千分之五的分成
        Sponsor.transfer(value);
    }

    // function getAllFundingGoods() public view returns(address){
    //     return FundingList[0];
    // }

    // function getFundingGoodsCurrent() public view returns(address){
    //     return fundingGoods;
    // }
    function getFundingList() public view returns(address [] memory) {
        return FundingList;
    } 

    function getFundingGoodsCurrent() public view returns(address) {
        return fundingGoods;
    }

    function getFungindGoodsCount() public view returns(uint) {
        return FundingList.length;
    }

    function getFundingGoodsById(uint _index) public view returns(address) {
        return FundingList[_index];
    }

}


contract UserService {
    // 参与过那些订单
    address [] public UserKeysList;
    address [] public UserValuesList;
    address payable public Sponsor;
    mapping(address => address) public UserListMapping;
    
    constructor(address payable _sponsor) public {
        Sponsor = _sponsor;
    }

    // 创建相应的账户，包含基本的个人信息收货地址等等
    // 应当包含什么信息呢？ 用户的hash，用户的姓名，用户的性别年龄，用户的昵称
    // 用户的头像？(修改花费ETH)用户的签名，用户的出生日期，账户余额
    // 性别:* 男  女  保密 真实性别不能修改！ 姓名
    // 生日:
    // 个人所在地:
    // 详细地址:
    // 邮政编码:
    // 固定电话:
    // 手机号:
    function createUser(bytes23 _hash1, bytes23 _hash2) public  {
        address newUser = address(new User(_hash1, _hash2));
        // UserList.push(newUser);
        UserListMapping[msg.sender] = newUser; 
        UserKeysList.push(msg.sender);
        UserValuesList.push(newUser);
    }

    // 检测当前用户是否登录过当前网站
    function checkUser(address user) public view returns(bool) {
        uint len = UserKeysList.length;
        // 将UserList中的hash挨个拿出来对比，如果没有
        // 那就返回一个标志，要求前端页面完善个人信息
        bool flag = false;
        for( uint i = 0 ; i<len ; i++) {
            if(UserKeysList[i] == user) {
                flag = true;
            }
        }
        if(flag) {
            return true;
        }else {
            return false;
        }
    }

    function getAllUserAddress() public view returns(address[] memory){
        return UserKeysList;
    }

    function getAllUser() public view returns(address [] memory) {
        // 返回整个UserMapping中的值
        return UserValuesList;
    }

    function getUserByAddress(address userAddr) view public returns(address){
        return UserListMapping[userAddr];
    }

    // 在外部调用时，call一定要加上from
    function getUserByCurrent() view public returns(address){
        return UserListMapping[msg.sender];
    }

   
    // function updataUser(address userAddr, bytes23 _hash1, bytes23 _hash2) {
    //     address user = UserListMapping[userAddr];
        
    // }

}

contract FundingGoods {

    address payable public Sponsor;
    address payable public owner;
    // string public name;
    // string public content;
    uint public target;
    uint public fundingPrice;
    uint public onlinePrice;
    // string public img;
    // string public video;
    address public newGoods;
    uint public fundingState;
    uint public validDay;
    string public fundingStartDate;
    string public fundingEndTimeStamp;
    uint public count;
    // 因为buy不允许传入参数，所有使用这个变量来存储订单的hash值
    // bytes23 [] public OrderHashs;
    // bytes23 public orderHash1;
    // bytes23 public orderHash2;
    address public newOrder;
    // 用来标记购买
    uint flag = 0;
    address public fundingInfo;
    address public fundingComment;
    address payable [] public buyersList;
    address [] public OrderList;
    mapping(address => uint) public buyers;
    mapping(address => address) public orders;
    // 评价列表
    // 那些人有权评价，那些人无权评价？

    // 已经把主要的信息存储到IPFS上
    // IPFS上
    constructor(address payable _sponsor, address payable _owner, uint _fundingPrice, 
        uint _onlinePrice, uint _target, uint _validDay, string memory _fundingEndTimeStamp,
        bytes23 _goodsHash1, bytes23 _goodsHash2) public {
        Sponsor = _sponsor;
        owner = _owner;
        // 包含不同的型号，评价信息
        newGoods = address(new Goods(_goodsHash1, _goodsHash2));
        target = _target;
        validDay = _validDay;
        fundingEndTimeStamp = _fundingEndTimeStamp;
        fundingPrice = _fundingPrice;
        onlinePrice = _onlinePrice;
        count = 0;
        fundingState = 0;
    }

    // 通过当前当前商品的具体信息
    function getGoods() public view returns(address){
        return newGoods;
    }

    // 这里所有的钱都要回退到初始状态（检查没有发货的全部回退ETH）
    // function cancelFundingGoods() public {

    // }

    // 购买完之后一定要调用这个方法
    // function addBuyer() public{
    //     if( flag == 1 ) { // 当前账户已经购买
    //         buyersList.push(msg.sender);
    //     }
    // }
    // 更新众筹的具体信息（非商品信息）比如说项目进度之类的信息
    function updataFundingInfo(bytes23 _infoHash1, bytes23 _infoHash2) public {
        // 每次都重新创建一个实例，然后他们两个链接起来
        // fundingEndTimeStamp = _fundingEndTimeStamp;
        fundingInfo = address(new FundingInfo(_infoHash1, _infoHash2));
    }
    
    // fundingComment
    function updataFundingComment(bytes23 _infoHash1, bytes23 _infoHash2) public {
        fundingComment = address(new FundingComment(_infoHash1, _infoHash2));
    }


    function getAllBuyers() public view returns(address payable [] memory){
        return buyersList;
    }

    // 购买的逻辑 这里应该非常的复杂
    function buy() public payable {
        // 生成订单对象，然后插入相应的数据
        // 状态改变，当最后一个取消订单，回滚
        // 不同的人取消订单或者
        // 判断当前账户是否已经参与过众筹，如果参与过就不再参与，等待上线
        require(buyers[msg.sender] == 0);
        // 只有状态是众筹中的时候才可以继续往下执行
        // 状态是其他的时候不允许再买了
        require(fundingState == 0);
        // 如果当前商品还未上线
        if(fundingState == 2) {
            // 看看转到合约的钱是不是上线价
            require(onlinePrice == msg.value);
        }else{
            // 转到合约是不是众筹价
            require(fundingPrice == msg.value);
        }
        // 创建订单的实例，用来存储hash值
        // 
        // 将这个hash重新初始化
        // delete orderHash1;
        // delete orderHash2; 
        orders[msg.sender] = newOrder;
        // delete newOrder;
        // 放入到mapping中
        buyers[msg.sender] = msg.value;
        // flag = 1;
        // addBuyer();
        buyersList.push(msg.sender);
        // 然后众筹人数加一
        count += 1;
        // 在用户购买完成之后，还应该修改用户IPFS上参与过的HASH信息
        // 修改参与过什么项目

        // 如果收到的钱大于上线的钱，那么项目上线，并且要修改所有订单的状态为上线
        // 上线之前的所有钱都存在合约中
        if(target <= fundingPrice * count) {
            fundingState = 1; // 众筹成功，等待商家上线
            // // 如果是已经上线过 （此处的上线逻辑并没有用上）
            // if(fundingState == 1000) { // 
            //     // 开始分成
            //     uint value = msg.value;
            //     // 收千分之五的分成
            //     Sponsor.transfer(value / 200);
            //     owner.transfer(value - value/200);
            // } else if(fundingState == 1) {
                
            // } else { // 如果是第一次，那么设置为上线状态，然后把所有众筹的钱都转给卖家
            //     fundingState = 1; // 众筹成功，等待商家上线
            //     // owner.transfer(count*fundingPrice);
            // }
        }
    }

    // 众筹只有一种可能那就是，时间到了，如果时间不到
    // 人为不可修改众筹信息
    // 众筹失败，所有的钱退回到原来的账户中
    function fundingFail() payable public{
        // 先检查一下是不是众筹的状态，只有是众筹的状态才能够修改
        // 如果已经是上线的状态或者是其他的状态是不允许众筹失败的
        require(fundingState == 0);
        require(msg.sender == owner);
        // 遍历所有的名单，然后把钱全部转回去，设置状态为失败状态
        // 这时候的订单还没有生效，所以不用修改订单信息
        uint len = buyersList.length;
        for(uint i = 0;i<len; i++) {
            buyersList[i].transfer(buyers[buyersList[i]]);
        }
        updataFundingStateFail();
    }

    // 修改当前状态为失败状态，有的修改需要权限，有的修改不需要权限
    function updataFundingStateFail() public {
        fundingState = 13;
    }
    
    // 只有已经上架的商品才可以修改为下架
    function updataFundingStateUndercarriage() public {
        require(fundingState == 2);
        require(msg.sender == owner);
        fundingState = 5;
    }

    // 修改当前众筹商品的状态为发货
    function updataFundingStateOnline() public{
        // 如果当前的状态是待上线，目标达到，众筹者手动结束众筹
        require(fundingState == 1);
        require(msg.sender == owner);
        // 改为发货状态
        fundingState = 12;
        // 将ETH全部转给众筹者
        owner.transfer(count*fundingPrice);
    }

    function updataFundingStateNotOnline() public payable{
        // 如果当前的状态是待上线，目标达到，众筹者手动结束众筹
        require(fundingState == 1);
        require(msg.sender == owner);
        // 完成众筹
        fundingState = 3;
        // 将ETH全部转给众筹者
        owner.transfer(count*fundingPrice);
    }

    // 修改当前的状态为14，表示这个众筹项目已经完成
    function updateFundingStateFinish() public {
        require(fundingState == 12);
        require(msg.sender == owner);
        fundingState = 14;
    }

    function getFudingInfo() public view returns(uint, uint, uint , uint, uint, string memory) {
        // 上线价，目标，时间，开始时间，支持人数
        return(fundingPrice, target, validDay, fundingState, count, fundingEndTimeStamp);
    }

    function getFundingState() public view returns(uint){
        return fundingState;
    }

    // // 众筹失败的逻辑
    // function failFunding() public payable {
    //     // 遍历所有的名单，然后把钱全部转回去，设置状态为失败状态
    // } 
    
    // 在调用buy之前，一定要调用这个方法，然后把相关的hash传入
  
    function createOrder(bytes23 _hash1, bytes23 _hash2) public{
        // orderHash1 = _hash1;
        // orderHash2 = _hash2;
        // OrderHashs[0] = _hash1;
        // OrderHashs[1] = _hash2;
        newOrder = address(new Order(_hash1, _hash2));
        OrderList.push(newOrder);
    }

    function getOrderList() public view returns(address [] memory){
        return OrderList;
    }

    function getOrder() public view returns(address) {
        return newOrder;
    }

}

contract FundingInfo {
    bytes23 [] public fundingInfo;
    constructor(bytes23 _hash1, bytes23 _hash2) public {
        fundingInfo.push(_hash1);
        fundingInfo.push(_hash2);
    }

    function getFundingInfo() public view returns(bytes23[] memory) {
        return fundingInfo;
    }

     // 更新当前的商品信息
    function updataFundingInfo(bytes23 _hash1, bytes23 _hash2) public{
        fundingInfo[0] = _hash1;
        fundingInfo[1] = _hash2;
    }
}


// contract AcutionOrder {
//     constructor() public {

//     }
// }

// 将所有的重要信息放到IPFS上，这里只是存储hash
// 参与过的订单
contract User {
    address [] public FundingList;
    address [] public OrderList;
    bytes23 [] public user;
    constructor(bytes23 _hash1, bytes23 _hash2) public {
        user.push(_hash1);
        user.push(_hash2);
    }
    
    function getUserInfo() public view returns(bytes23 [] memory){
        return user;
    }

    // 修改用户信息，注意这里获取到当前user才可以修改，一定是通过hash获取的
    function updataUser(bytes23 _hash1, bytes23 _hash2) public {
        user[0] = _hash1;
        user[1] = _hash2;
    }

    function setFundingList(address fundingAddr) public {
        FundingList.push(fundingAddr);
    }
    
    function setOrderList(address orderAddr) public {
        OrderList.push(orderAddr);
    }

    function getFundingList() public view returns(address [] memory) {
        return FundingList;
    }

    function getOrderList() public view returns(address [] memory) {
        return OrderList;
    }
}

// 用来存储订单信息的ipfs值
contract Order {
    bytes23 [] public order;
    constructor(bytes23 _hash1, bytes23 _hash2) public{
        order.push(_hash1);
        order.push(_hash2);
    }

    function updataOrder(bytes23 _hash1, bytes23 _hash2) public{
        order[0] = _hash1;
        order[1] = _hash2;
    }
    function getOrder() public view returns(bytes23 [] memory) {
        return order;
    }
} 

// 用于存储所有的商品信息，在JS中获取到两段hash然后传入进来
contract Goods{

    bytes23 [] public goods;

    // string memory _name,string memory _content,string [] memory _goodsImgs, string memory _video,string [] memory _type, string [] memory _decImgs
    // 直接让这个Goods 存储ipfs的hash值
    constructor(bytes23 _hash1, bytes23 _hash2) public {
        goods.push(_hash1);
        goods.push(_hash2);
    }

    function getGoodsInfo() public view returns(bytes23[] memory) {
        return goods;
    }

     // 更新当前的商品信息
    function updataFundingGoods(bytes23 _hash1, bytes23 _hash2) public{
        goods[0] = _hash1;
        goods[1] = _hash2;
    }

}

contract FundingComment {
    bytes23 [] public fundingComments;
    constructor(bytes23 _hash1, bytes23 _hash2) public{
        fundingComments.push(_hash1);
        fundingComments.push(_hash2);
    }
}