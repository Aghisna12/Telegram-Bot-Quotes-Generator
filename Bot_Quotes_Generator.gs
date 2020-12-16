/**
* Script Name   : Telegram Bot Quotes Generator
* Language Code : GoogleAppScript(GAS) /JavaScript
* Build Date    : 16-des-2020 8.30pm
* Last Update   : -
* Author        : Aghisna12
*/

/* Langkah 1 */
// simpan global variable untuk url hasil deploy pada project script ini
var url_hasil_deploy = "MASUKAN_URL_HASIL_DEPLOY_DISINI";

//simpan global variable token untuk dipakai lagi saat request api
var token = "MASUKAN_TOKEN_BOT_TELEGRAMMU_DISINI";

//fungsi mengirim pesan untuk bot dengan request ke api telegram
function sendMessage(chat_id, text, parse = 'HTML') {
  var payload = {
    'method':'sendMessage',
    'chat_id':String(chat_id),
    'text':text,
    'parse_mode':parse
  }
  var data = {
    'method':'post',
    'payload':payload
  }
  return UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/", data);
}

//fungsi mengirim foto untuk bot dengan request ke api telegram
function sendPhoto(chat_id, blob, parse = 'HTML') {
  var payload = {
    'method':'sendPhoto',
    'chat_id':String(chat_id),
    'photo':blob
  }
  var data = {
    'method':'post',
    'payload':payload
  }
  return UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/", data);
}

//fungsi membuat quotes dengan api google page speed test yang diambil screenshot webnya
function buatQuotes(text, by) {
  if (text) {
  
    //menggunakan versi web google app script(ada warning header)
    var url = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?screenshot=true&url=" + url_hasil_deploy + "?" + encodeURIComponent(text);
    
    //menggunakan static site github(tanpa warning header)
    var url = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?screenshot=true&url=https://aghisna12.github.io/belajar/QuotesGenerator.html?" + encodeURIComponent(text);
    if (by) {
      url += "::" + by;
    }
    var respons = UrlFetchApp.fetch(url);
    var respons_r = JSON.parse(respons);
    if (respons_r.lighthouseResult.audits["final-screenshot"].details.data) {
      var str_img = respons_r.lighthouseResult.audits["final-screenshot"].details.data;
      var base64_img = str_img.replace("data:image/jpeg;base64,", "")
      var decoded = Utilities.base64Decode(base64_img);
      return Utilities.newBlob(decoded, MimeType.JPEG, "test.jpeg");
    }
  }
}

/* LANGKAH 2 */
//berfungsi untuk menangkap request http/s GET
function doGet(e) {
  
  //membuat output HTML yang akan ditampilkan ke klien
  return HtmlService.createHtmlOutput("<!DOCTYPE html><html><head>	<meta charset='UTF-8'>	<title>Quotes Generator</title></head><style>html, body {    width: 100%;    height: 100%;    padding: 0;    margin: 0;}#canvas {    width: 100%;    height: 100%;}</style><body>	<canvas id='myCanvas'></canvas>	<script>		var data = '" + e.queryString + "';		if (data.length > 0 && data.includes('::')) {			var data_r = (data).split('::');			if (data_r.length == 2) {				var text = '❝' + decodeURIComponent(data_r[0]) + '❞';				var by = '-' + data_r[1] + '-';				var canvas = document.getElementById('myCanvas');				canvas.width = window.innerWidth;				canvas.height = window.innerHeight;				var font_size = canvas.width / text.length;				if (font_size < 26) {					font_size = 26;				}				var ctx = canvas.getContext('2d');				var background = new Image();				var images = ['https://github.com/Aghisna12/aghisna12.github.io/raw/master/belajar/img/flower.jpg','https://github.com/Aghisna12/aghisna12.github.io/raw/master/belajar/img/rose.jpg','https://github.com/Aghisna12/aghisna12.github.io/raw/master/belajar/img/month.jpg'];				background.src = images[Math.floor(Math.random() * images.length)];;				background.onload = function(){					ctx.drawImage(background, 0, 0, canvas.width, canvas.height);					ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';					ctx.fillRect(0, 0, canvas.width, canvas.height);					ctx.font = 'bold ' + font_size.toString() + 'px Comic Sans MS';					ctx.fillStyle = 'white';					ctx.textAlign = 'center';					ctx.fillText(text, canvas.width/2, canvas.height/2);					ctx.font = 'bold 26px Arial';					ctx.fillText(by, (canvas.width / 2), (canvas.height / 2) + font_size);				}			}		}	</script></body></html>");
  
}

/*Langkah 3 */
//berfungsi untuk menangkap request http/s POST
function doPost(e) {
  
  //jika type post data adalah 'application/json'
  if (e.postData.type == "application/json") {
    
    //parse isi konten data post ke JSON array
    var update_r = JSON.parse(e.postData.contents);
    
    //jika update ada key message
    if (update_r.message) {
      
      //simpan variable msg dari update.message untuk dipakai lagi dibawahnya agar tidak mengambilnya dari array update
      var msg = update_r.message;
      
      //simpan variable text dari update.message.text untuk dipakai lagi juga dibawahnya
      var text = msg.text;
      
      //simpan variable chat_id dari update.message.chat.id untuk dipakai juga dibawahnya
      var chat_id = msg.chat.id;
      
      //simpan variable message_id dari update.message.message_id untuk dipakai juga dibawahnya
      var message_id = msg.message_id;
      
      //jika karakter huruf pertama dari variable text mengandung '!' atau '/' dan variable text juga terdapat <spasi>
      if ((text.substring(0, 1) === "!" || text.substring(0, 1) === "/") && text.includes(" ")) {
        
        //simpan variable array text_r dari pemecahan(split) <spasi> dari variable text
        var text_r = text.split(" ");
        
        //jika variable array text_r panjangnya lebihdari atau samadengan 2(dua)
        if (text_r.length >= 2) {
          
          //variable command
          var cmd = text_r[0];
          
          //variable argument
          text_r.splice(0, 1);
          var arg = text_r.join(" ");
          
          //jika nilai variable cmd dirubah ke huruf kecil semua samadengan '!quotes' atau nilai variable cmd dirubah ke huruf kecil semua samadengan '/quotes'
          if (cmd.toLowerCase() === "!quotes" || cmd.toLowerCase() === "/quotes") {
            
            //variable by dari update.message.from.username
            var by = msg.from.username;
            
            //membuat quotes dengan parameter argument dan by(dari username)
            var blob_quotes = buatQuotes(arg, by);
            
            //mulai kirim photo ke client bot Telegram
            sendPhoto(chat_id, blob_quotes);
            
          }
        }
      }
    }
  }
}

/* Langkah 4*/
//run fungsi ini jika sudah berhasil mendeploy pada project ini
function setWebhook() {
  var respons = UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/setWebhook?url=" + url_hasil_deploy);
  Logger.log(respons);
}
