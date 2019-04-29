const fs = require('fs')
const path = require('path')
const solc = require('solc')
const contractPath = path.resolve(__dirname, '../contracts')

//调用文件遍历方法
fileDisplay(contractPath);
//文件遍历方法
function fileDisplay(filePath){
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath,function(err,files){
        if(err){
            console.warn(err)
        }else{
            //遍历读取到的文件列表
            files.forEach(function(filename){
                //获取当前文件的绝对路径
                var filedir = path.join(filePath, filename);
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir,function(eror, stats){
                    if(eror){
                        console.warn('获取文件stats失败');
                    }else{
                        var isFile = stats.isFile();//是文件
                        var isDir = stats.isDirectory();//是文件夹
                        if(isFile){
                            console.log(filedir);
                            // 将编译的方法封装起来
                            CompileConttract(filedir)
                        }
                        if(isDir){
                            fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                        }
                    }
                })
            });
        }
    });
}

function CompileConttract(contractPath) {
    const source = fs.readFileSync(contractPath, 'utf-8')
    var input = {
    	language: 'Solidity',
    	sources: {
    		'compile.sol': {
    			content: source
    		}
    	},
    	settings: {
    		outputSelection: {
    			'*': {
    				'*': [ '*' ]
    			}
    		}
    	}
    }

    var output = JSON.parse(solc.compile(JSON.stringify(input)))

    teamJson = {
    	'abi': {},
    	'bytecode': ''
    };

    if(Array.isArray(output.errors) && output.errors.length > 0){
    	console.log(output.errors[0].formattedMessage)
    } else {
    	Object.keys(output.contracts).forEach(name => {
    		Object.keys(output.contracts[name]).forEach(contractName => {
    			teamJson.abi = output.contracts[name][contractName].abi;
        		teamJson.bytecode = output.contracts[name][contractName].evm.bytecode.object;
    			const filePath = path.resolve(__dirname, `../src/compile/${contractName}.json`)
    			fs.writeFileSync(filePath, JSON.stringify(teamJson))
    			console.log('写入成功!');
    		})
    	})
    }
}
