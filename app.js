var express = require('express');
var app = express();
var router = require('./router/router');

//socket.io公式：
var http = require('http').Server(app);
var io = require('socket.io')(http);

//session公式：
var session = require('express-session');
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.set("view engine", "ejs"); //模板引擎
app.use(express.static("./public"));//静态资源服务

//中间件
app.get("/", router.showIndex);//显示首页
app.post("/check", router.checkUser);//用户名登录时检测
app.get("/chat", router.chat);//聊天室界面
app.post("/doRegist", router.doRegist);//ajax post注册


//聊天室服务
io.on("connection", function (socket) {
    console.log("一个用户登录");

    //监听用户连接
    socket.on("system", function (msg) {

        //用户未被登录，则加入数组
        if (router.alluser.indexOf(msg) === -1) {
            io.emit("system", msg, '闪亮登场');
            router.alluser.push(msg);
            socket.user = msg;
            socket.userIndex = router.alluser.length - 1; //记录当前用户在数组中的index
            io.emit("onlineUser", router.alluser);
        }

    })

    //发送图片
    socket.on('img', function (imgData) {
        //通过一个newImg事件分发到除自己外的每个用户
        io.emit('img', socket.user, imgData);
    });

    //监听用户发送信息
    socket.on("chat", function (msg) {
        //把接收到的msg原样广播
        io.emit("chat", msg);
    });

    socket.on("disconnect", function () {
        console.log("一个用户离开");
        router.alluser.splice(socket.userIndex, 1); //删除数组中第index个用户
        // console.log(router.alluser);
        io.emit("system", socket.user, '已离开');
        io.emit("onlineUser", router.alluser);
    })
});

//监听
http.listen(3000);
