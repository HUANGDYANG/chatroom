
//引入md5相关的包
var crypto = require("crypto");
module.exports = function(mingma){
    //md5使用步骤
    var md5 = crypto.createHash('md5');
    var password = md5.update(mingma).digest('base64');
    return password;
}