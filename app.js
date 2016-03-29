/*
* 功能:   数据采集
* 创建人: TEST
* 时间:   2016-03-24
*/
var request = require('request'),
  cheerio = require('cheerio'), 
  URL_36KR = 'http://36kr.com/';      //36氪 
/* 开启数据采集器 */
 function dataCollectorStartup() {     
   dataRequest(URL_36KR);
 }
/* 数据请求 */
function dataRequest(dataUrl)
{
  request({
    url: dataUrl, 
    method: 'GET'
  }, function(err, res, body) { 
    if (err) {      
      console.log(dataUrl)
      console.error('[ERROR]Collection' + err);   
      return;     
    }
    switch(dataUrl)
    {
      case URL_36KR:
        dataParse36Kr(body);
        break;    
    }
  }); 
}
/* 36kr 数据解析 */
function dataParse36Kr(body)
{
  console.log('============================================================================================');
  console.log('======================================36kr==================================================');
  console.log('============================================================================================');  
  var $ = cheerio.load(body);
  var articles = $('article')
  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];
    var descDoms = $(article).find('.desc');
    if(descDoms.length == 0)
    {
      continue;
    }
    var coverDom = $(article).children().first();
    var titleDom = $(descDoms).find('.info_flow_news_title');
    var timeDom = $(descDoms).find('.timeago');
    var titleVal =  titleDom.text();
    var urlVal = titleDom.attr('href');
    var timeVal = timeDom.attr('title');
    var coverUrl = coverDom.attr('data-lazyload');
    //处理时间
    var timeDateSecs = new Date(timeVal).getTime() / 1000;
    if(urlVal != undefined)
    {
       console.info('--------------------------------');
       console.info('标题：' + titleVal);
       console.info('地址：' + urlVal);
       console.info('时间：' + timeDateSecs);
       console.info('封面：' + coverUrl);        
       console.info('--------------------------------');
    }
  };
}
dataCollectorStartup();