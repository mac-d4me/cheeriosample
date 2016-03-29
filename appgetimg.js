var cheerio = require("cheerio");
var request = require("request");
var server = require("./curl");
var path = require('path');
var async = require('async');
var fs = require('fs');
//并发连接计数器
var concurrencyCount = 0;
var getUrl = function (url, callback) {
  // delay 的值在 2000 以内，是个随机的整数
  var delay = parseInt((Math.random() * 10000000) % 2000, 10);
  concurrencyCount++;
  console.log('【抓取】现在的并发数是',concurrencyCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');
    server.getData(url, function(data) {
      if (data) {
        //console.log(data);
        var $ = cheerio.load(data);
        var folder = $('.v_title h1').text().substr(0,4);
        var currencyCount = 0;
        var imgsrcs = [];
        //console.log(folder);

        $('.st_gal_item').each(function(){
            imgsrcs.push('http:' + $(this).attr('data-bimg'));
        });
        //console.log(imgsrcs);
        async.mapLimit(imgsrcs, 10, function (src, callback) {
            currencyCount++;
            console.log('【下载】现在的并发数是',currencyCount, '，正在下载' + src);
            downloadFile(src, folder, getFileNameByUrl(src),function(){
                console.log(src + '下载完成，耗时' + delay + '毫秒');
            });
            setTimeout(function () {
                currencyCount--;
                callback(null,src);
            }, 1000);
        }, function (err, result) {
            //console.log(result);
            console.log('已完成' + result.length +'张下载');        
        }); 
      } else {
        console.log("error");
      } 
    });
  setTimeout(function () {
    concurrencyCount--;
    callback(null, url + '.html#p1');
  }, delay);
};

var URL = 'http://tu.58game.com/gallery/';
//var URL = 'testlink'
var urls = [];
for(var i = 3300; i < 3500; i++){
    urls.push(URL + i);
}
//console.log(urls);
async.mapLimit(urls, 10, function (url, callback) {
  getUrl(url, callback);
}, function (err, result) {
  console.log('已完成' + result.length +'条抓取');
});

function getFileNameByUrl(u){
    var fname = path.basename(u);
    return fname;
}

//下载
function downloadFile(url,folder,fname,callback){
    var dir = './images/' + folder;
    request.head(url,function(err,res,body){
        if(err){
            console.log('error:' + err);
            return false;
        }
        if (!fs.existsSync(dir)){
            fs.mkdir(dir, function(err){
                if(err){
                    console.log(err);
                }
            });
        }
        //console.log(fname);
        setTimeout(function(){
            request(url).pipe(fs.createWriteStream(dir +'/'+ fname)).on('close',callback);
        },1000)     
    });
}