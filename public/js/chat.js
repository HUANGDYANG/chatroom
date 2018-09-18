var socket = io();

//ctrl+enter键发送聊天消息
$("#content").keydown(function (e) {
    if (e.keyCode == 13 && e.ctrlKey) {
        //把文本框的内容上传：
        socket.emit("chat", {
            "content": $("#content").val(),
            "user": $("#user").html()
        });
        $(this).val("");
    }
});

//点击发送按钮发送消息
$('#send').click(function (e) {
    socket.emit("chat", {
        "content": $("#content").val(),
        "user": $("#user").html()
    });
    $("#content").val("");

})

//音乐暂停和开始
$('#play_music').click(function (e) {
    var audio = document.getElementById('music');
    // console.log(audio);
    if (audio.paused === true) {
        audio.play();
        // console.log(this);
        // console.log($('#play_music'));
        $('#play_music').css({'animation-play-state': 'running'})
    } else {
        audio.pause();
        $('#play_music').css({'animation-play-state': 'paused'})
    }
})


//发送表情
//初始化表情
function initialEmoji() {
    var emojiContainer = document.getElementById('emojiContainer'),
        //此节点对象不显示在html文档中
        docFragment = document.createDocumentFragment();
    for (var i = 1; i <= 45; i++) {
        var emojiItem = document.createElement('img');
        emojiItem.src = '../img/paopao/' + i + '.png';
        emojiItem.title = i;  //选择表情到文本框时的序号，也是img标签的title
        docFragment.appendChild(emojiItem);
    }
    ;
    emojiContainer.appendChild(docFragment);
}

this.initialEmoji();

//点击表情弹出选择
document.getElementById('emoji').addEventListener('click', function (e) {
    var emojiContainer = document.getElementById('emojiContainer');
    emojiContainer.style.display = 'block';
    e.stopPropagation();
}, false);

document.body.addEventListener('click', function (e) {
    var emojiContainer = document.getElementById('emojiContainer');
    if (e.target !== emojiContainer) {
        emojiContainer.style.display = 'none';
    }
    ;
});

//获取选择的表情并添加到textarea输入框
document.getElementById('emojiContainer').addEventListener('click', function (e) {
    //获取被点击的表情
    var target = e.target;
    if (target.nodeName.toLowerCase() === 'img') {
        var content = document.getElementById('content');
        content.focus();
        content.value = content.value + '[emoji:' + target.title + ']';
    }
    ;
}, false);

//客户端文字转化表情
function showEmoji(msg) {
    var match, result = msg,
        reg = /\[emoji:\d+\]/g,
        emojiIndex,
        totalEmojiNum = document.getElementById('emojiContainer').children.length;
    //多次匹配，exec()返回Array或null
    while (match = reg.exec(msg)) {
        emojiIndex = match[0].slice(7, -1);
        //表情不存在表情库里
        if (emojiIndex > totalEmojiNum) {
            result = result.replace(match[0], '[X]');
        } else {
            //将emoji字符串替换为html的img标签
            result = result.replace(match[0], '<img class="emoji" src="../img/paopao/' + emojiIndex + '.png" />');
        }
        ;
    }
    ;
    return result;
}

//发送图片
var that = this;
function F_Open_dialog() {
    $("#btn_file").click();
}
// 采坑了，下面注释的写法有问题 ，模拟click()后不能监听change ;
// $("#img").click(function (e) {
//     F_Open_dialog();
// $('#btn_file').click();
document.getElementById('btn_file').addEventListener('change', function (e) {
    var _this = this;
    //this.value 是本地路径
    // console.log(this.value);
    if (!this.value) {
        return;
    }
    //获取文件并用FileReader进行读取
    var file = this.files[0];

    // console.log(file);

    if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
        return;
    }
    var reader = new FileReader();

    if (!reader) {
        this.value = '';
        return;
    }

    reader.onload = function (e) {
        //读取成功,发送到服务器
        _this.value = '';
        that.socket.emit('img', e.target.result);
        // console.log(this);
    };
    reader.readAsDataURL(file);

})
// })



//告诉服务器登录的人
socket.emit("system", $("#user").html());

//统计在线人数并展示在客户端
socket.on('onlineUser', function (alluser) {
    // console.log(alluser);
    $("#alluser").html('');
    $('.count').html(alluser.length);
    for (var i = 0; i < alluser.length; i++) {
        $("#alluser").prepend("<li>" + alluser[i] + "</li>")
    }
})


//监听用户发来的消息,包括自己发给服务器的
socket.on("chat", function (msg) {

    var content = showEmoji(msg.content);  //将字符表情转化图片
    $(".list").append("<li><b>" + msg.user + "：</b>" + content + "</li>");
    // $(".wrap_list").scrollTop($(".list").height() - 500);

    $(".wrap_list").stop().animate({'scrollTop': ($(".list").height() - 500)});

    // console.log($(".wrap_list").scrollTop());
    // console.log($(".list").height());
});

//还没实现:点击图片放大
function jump() {
    // window.open(document.getElementById('img_src').getAttribute('src'));
    // console.log(1);
}

//将接受的图片展示在客户端
socket.on("img", function (user, imgData) {
    clearTimeout(timer)

    $(".list").append("<li><b>" + user + "：</b><br>" + "<a onclick='jump()'> <img id='img_src' src=' " + imgData + "'></a>" + "</li>");

    var timer=setTimeout(function () {
        $(".wrap_list").scrollTop($(".list").height() - 500);  //图片发送慢，延迟发送
    },1)

})

//系统广播用户登录离开
socket.on("system", function (msg, way) {
    $(".list").append("<li>" + "系统消息:用户" + msg + way + "</li>");

})

//离开确认
window.onbeforeunload = function (e) {
    var e = window.event || e;
    e.returnValue = ("确定离开当前页面吗？");
}

