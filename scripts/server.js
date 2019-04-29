/**
 *main.js
 *在终端输入node main.js，打开浏览器在地址栏输入localhost:3000
 *浏览器显示Hello Nodejs
 */

// //获取http模块
// var http = require("http");
// //获取http.Server对象
// var server = new http.Server();

// //创建服务器，并监听3000端口

// server.on("request",function(req,res) {
//     res.setHeader("Access-Control-Allow-Origin", "*"); 
//     res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
//     res.setHeader("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//     res.setHeader("X-Powered-By",' 3.2.1');
//     res.setHeader("Content-Type", "text/html");
//     res.writeHead(200,{
//         "content-type":"text/plain"
//     });
//     res.write("Hello Nodejs");
//     res.end();
// }).listen(7300);

var http = require('http');
var querystring = require('querystring');

function getOrderTracesByJson(expCode, expNo) {
    const requestData =  "{'OrderCode':'','ShipperCode':'" + expCode + "','LogisticCode':'" + expNo + "'}"
    let sendData = {}
    sendData.RequestData;
}



var contents = querystring.stringify({
    name:'byvoid',
    email:'byvoid@byvoid.com',
    address:'Zijing'
});
 
var options = {
    host:'www.byvoid.com',
    path:'/application/node/post.php',
    method:'POST',
    headers:{
        'Content-Type':'application/x-www-form-urlencoded',
        'Content-Length':contents.length
    }
}
 
var req = http.request(options, function(res){
    res.setEncoding('utf8');
    res.on('data',function(data){
        console.log("data:",data);   //一段html代码
    });
});
 
req.write(contents);
req.end;





