/*

TODO


*/

var typeStart = true;
var codeView = $('#codeView');
var codeMaxLength = 30;
var loc = 0;
var clearLoc = 100;
var digit = 1;

window.addEventListener("load", init);

// 初期設定
function init(){

}

/* keyup時イベント．LOCのカウント，それに合わせたコード片の表示． */
document.addEventListener("keyup", function(e){
    /* LOCカウント部 */
    loc++;
    if(String(loc).length > digit){ // 桁数による位置調整
        $("#loc").css("left", $('#loc').position().left - 7);
        digit = String(loc).length;
    }
    $('#loc').text(loc);
    if(loc > clearLoc-1){ // クリア判定．5分立った時にするか，ある一定以上書き上げたらにするか．後者ならlocが減っていくでもいいよな．
        alert("クリア！");
        loc = 0;
        $('#loc').text(loc);
        typeStart = true;
        $("#loc").css("left", 140);
        digit = 1;
        document.getElementById("codeView").value = "_";
        return;
    }

    /* Timer部 */
    // □□とかで進捗バーみたいなものが表示されるといいよね．

    /* Code部 */
    if(typeStart){
        document.getElementById("codeView").value = "function func(e){" + "\n";
        typeStart = false;
    }

    document.getElementById("codeView").value += randomCode(); // ランダムなコード片を追記

    $('#codeView').scrollTop(
        $('#codeView')[0].scrollHeight - $('#codeView').height()
    ); // 自動スクロール

    var codeLength = document.getElementById("codeView").value.match(/\n/g); //IE 用
    //console.log(codeLength.length);
    if(codeLength.length > codeMaxLength){
        document.getElementById("codeView").value = "";
    } // ある程度まで行ったらクリアして最初から
});

// ランダムなコード片を返す．コード片は基本的に一行の命令文．たまにfunction(e){}．jsonから適当なコード片を読み込んで追記．
function randomCode(){
    var code = "";
    var rand = Math.floor(Math.random() * 11) ;
    console.log(rand);

    switch (rand){
        case 0:
            var randWord = randomWord();
            code = "} " + "\n" + "function " + randWord + "(e){" + "\n";
            randWord = randomWord();
            code += "    var " + randWord + "\n";
            break;
        case 1:
            var randWord = randomWord();
            code = "    var " + randWord + "\n";
            break;
        case 2:
            code = "    printf('OK');" + "\n";
            break;
        case 3:
            var randWord = randomWord();
            code = "    for(var i; i <" + randWord + ".length; i++){" + "\n";
            var randValue = Math.floor(Math.random() * 11) ;
            randWord = randomWord();
            code += "        " + randWord + "+=" + String(randValue) + "\n";
            code += "    }" + "\n";
            break;
        case 4:
            code = "    printf();" + "\n";
            break;
        case 5:
            code = "    printf();" + "\n";
            break;
        case 6:
            code = "    printf();" + "\n";
            break;
        case 7:
            code = "    printf();" + "\n";
            break;
        case 8:
            code = "    printf();" + "\n";
            break;
        case 9:
            code = "    printf();" + "\n";
            break;
        case 10:
            code = "    printf();" + "\n";
            break;
    }

    return code;
}

// ランダムな文字列を返す．a-zの範囲．
function randomWord(){
    // 生成する文字列の長さ
    var randWordLength = Math.floor( Math.random() * 4 ) + 3; // 3-6文字．
    // 生成する文字列に含める文字セット
    var randWordPattern = "abcdefghijklmnopqrstuvwxyz";
    var randWordPatternLength = randWordPattern.length;
    var randWord = "";
    for(var i=0; i<randWordLength; i++){
        randWord += randWordPattern[Math.floor(Math.random()*randWordPatternLength)];
    }

    return randWord;
}

// ステータスバー
// エンジニア一人ごとに定期的にLOCを増やす
// ポップアップで表示している暇はないだろうから，ステータスバーで常に表示
