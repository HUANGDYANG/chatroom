var formidable = require('formidable');
var db = require("../models/db.js");
var md5 = require("../models/md5.js");
var alluser = []; //在线人数
exports.alluser = alluser;

//显示首页
exports.showIndex = function (req, res, next) {
    res.render("index");
};

exports.doRegist = function (req, res, next) {

    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //得到表单之后做的事情
        var account = fields.account;
        var password = fields.password;
        // console.log(account+password);

        //找重名用户
        db.find("users", {"account": account}, function (err, result) {
            if (err) {
                res.send('-3');   //数据库错误
                return;
            }
            if (result.length !== 0) {
                res.send("-1");   //用户名被占用
                return;
            }

            //无重名用户，插入
            password = md5(md5(password) + 'nodejs');

            db.insertOne("users", {"account": account, "password": password}, function (err, result) {
                if (err) {
                    res.send("-3");
                    return;
                }
                res.send("1");
            })
        })
    })
}

//确认登陆，检查此人是否有用户名，并且昵称不能重复
exports.checkUser = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //得到表单之后做的事情
        var account = fields.account;
        var password = fields.password;
        // console.log(account + password);

        //查看是否有此用户
        db.find("users", {"account": account}, function (err, result) {
            if (err) {
                res.send('-3');
                return;
            }
            if (result.length === 0) {
                res.send('-1'); //无此用户
                return;
            }

            //有此用户，查看对应密码是否正确
            password = md5(md5(password) + 'nodejs');

            db.find("users", {"account": account, "password": password}, function (err, result) {
                if (err) {
                    res.send('-3');
                    return;
                }
                if (result.length === 0) {
                    // console.log(result);
                    res.send('-2');  //密码错误
                    return;
                }
                if (alluser.indexOf(account) !== -1) {
                    res.send('-4');  //当前用户在线
                    return;
                }

                req.session.account = account;

                res.send("1");
            })
        })
    });
};

//聊天室业务
exports.chat = function (req, res, next) {
    //这个页面必须保证有用户名
    if (!req.session.account) {
        // res.send('alert("未登录")');
        res.redirect("/");
        return;
    }

    res.render("chat", {
        "account": req.session.account,
    });
    // console.log(alluser);
};

