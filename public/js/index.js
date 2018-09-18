$(document).ready(function () {
    //星星海特效
    var screenX = document.documentElement.clientWidth;
    var screenY = document.documentElement.clientHeight;

    for (var i = 0; i < 150; i++) {
        var x = parseInt(Math.random() * screenX);
        var y = parseInt(Math.random() * screenY);
        var span = document.createElement('span');
        span.className = 'star'
        span.style.top = y + 'px';
        span.style.left = x + 'px';

        var scale = Math.random() * 1.5;
        span.style.transform = "scale(" + scale + "," + scale + ")";

        var rate = Math.random() * 1.5;
        span.style.animationDelay = rate + 's';
        document.body.appendChild(span);
    }

    //前端校验
    $('#account').focus(function (e) {
            // console.log(e.target);
            $('#tip').html('帐号由6-12个字母，数字，下划线组成')
            // console.log($('#account').val());
        }
    )
    $('#password').focus(function (e) {
        $('#tip').html('密码由6-12个字母，数字，下划线组成')

    })

    //登录
    $("#login").click(function () {

        // console.log(2);
        $.post("/check", {
            "account": $("#account_login").val(),
            "password": $("#password_login").val()
        }, function (result) {
            if (result === '-3') {
                // console.log(-3);
                $('#tip_login').html('服务器出错')
            } else if (result === '-1') {
                // console.log(-1);
                $('#tip_login').html('用户不存在')
            } else if (result === '-2') {

                $('#tip_login').html('密码错误')

            } else if (result === "-4") {
                $('#tip_login').html('用户被登录')
            } else {
                window.location.href = '/chat';
            }
        })
    })

    //enter键登录或注册
    $('#password_login').keydown(function (event) {
        if (event.keyCode === 13) {
            $('#login').click()
        }
    })

    $('#password').keydown(function (event) {
        if (event.keyCode === 13) {
            $('#regist').click()
        }
    })

    //前端检验和ajax 注册
    $("#regist").click(function () {
        //前端验证
        if (!(/^[0-9a-zA-Z\_]{6,12}$/.test($('#account').val()))) {
            $('#tip').html('帐号格式错误')
            return false;
        }
        if (!(/^[0-9a-zA-Z\_]{6,12}$/.test($('#password').val()))) {
            $('#tip').html('密码格式错误')
            return false;
        }


        //提交服务器
        $.post("/doRegist", {
            "account": $("#account").val(),
            "password": $("#password").val()
        }, function (result) {
            if (result === '-3') {
                // console.log(-3);
                $('#tip').html('服务器出错')
            } else if (result === '-1') {
                // console.log(-1);
                $('#tip').html('用户名被占用')
            } else {
                // console.log(1);
                // $("#tip").html('注册成功');
                alert('注册成功')
                window.location.href = '/';
            }
        })
    })
});
