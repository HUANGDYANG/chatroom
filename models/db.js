//这个模块里面封装了所有对数据库的常用操作

//引包
var MongoClient = require('mongodb').MongoClient;
var settings = require("../settings.js");

//不管数据库什么操作，都是先连接数据库，所以我们可以把连接数据库封装成为内部函数
function _connectDB(callback) {
    var url = settings.dburl;   //从settings文件中，都数据库地址
    //连接数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            callback(err, null);   //连接失败时返回的信息
            return;
        }
        callback(err, db);    //连接成功后返回db和err
    });
}

init();

function init() {
    //对数据库进行一个初始化
    _connectDB(function (err, db) {
        if (err) {
            console.log(err);   //连接失败时打印失败信息,以后不在打印
            return;
        }
        db.collection('users').createIndex(
            {"username": 1},
            null,
            function (err, results) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("索引建立成功");
            }
        );
    });
}

//插入数据
exports.insertOne = function (collectionName, json, callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName).insertOne(json, function (err, result) {
            callback(err, result);  //这里的err是插入出错时的err
            db.close(); //关闭数据库
        })
    })
};

//查找数据，找到所有数据。args是个对象{"pageamount":10,"page":10}
exports.find = function (collectionName, json, callback) {
    var result = [];    //结果数组
    //连接数据库，连接之后查找所有
    _connectDB(function (err, db) {
        var cursor = db.collection(collectionName).find(json);
        cursor.each(function (err, doc) {
            if (err) {
                callback(err, null);
                db.close(); //关闭数据库
                return;
            }
            if (doc != null) {
                result.push(doc);   //放入结果数组
            } else {
                //遍历结束，没有更多的文档了
                callback(null, result);
                db.close(); //关闭数据库
            }
        });
    });
}

exports.deleteMany = function (collectionName, json, callback) {
    _connectDB(function (err, db) {
        //删除
        db.collection(collectionName).deleteMany(
            json,
            function (err, results) {
                callback(err, results);
                db.close(); //关闭数据库
            }
        );
    });
}

//修改
exports.updateMany = function (collectionName, json1, json2, callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName).updateMany(
            json1,
            json2,
            function (err, results) {
                callback(err, results);
                db.close();
            });
    })
}
