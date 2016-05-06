/*

TODO
タイマー部分
　カウントダウンタイマバー（プログレスバー）の表示．
　残り２割になったときに背景を赤に変更．
　0になったときのクリア判定．
アイテム部分
　ステータス（アイテムによるLOC増加量）の表示．
　アイテム購入ボタン．
　アイテムによる定期LOCの追加，キータイプ時LOCの追加．
　アイテム購入後，グラフィックの追加．

*/

/* LOCカウント部用-------------------------------------------- */
var typeStart = true; // ゲーム開始判定．true=まだ始まっていない．
var codeMaxLength = 30; // codeViewクリアまでの最大行数．
var loc = 0; // LOC．これがclearLoc分貯まればクリア．
var clearLoc = 100; // クリアに必要なloc．
var digit = 1; // 現在のLOC桁数．
/* LOCカウント部用-------------------------------------------- */
var timer;
var endTime = 180000; // 終了までの時間．1000=1秒．
var minute = 2;
var second = 60;
var bar;

window.addEventListener("load", init);

// 初期設定
function init(){
    timerSetup();
}

function timerSetup() {
    /* progressbar部分 */
    bar = new ProgressBar.Line(container, {
        strokeWidth: 1, // 下のバーに対する比率．この場合上のバーは1.5倍．
        easing: 'linear',
        duration: endTime, // 終わるまでの時間
        color: '#eee',
        trailColor: '#ED6A5A',
        trailWidth: 1,
        svgStyle: {
            width: '100%',
            height: '100%'
        },
        from: {
            color: '#eee' // 変化前の色
        },
        to: {
            color: '#eee' // 変化後の色
        },
        step: (state, bar) => {
            bar.path.setAttribute('stroke', state.color);
        }
    });
}

function timerStart(){
    bar.animate(1.0);  // 0.0~1.0．0.5とかにすると半分までしか進まない．

    /* タイマビュー部分 */
    timer = setInterval(function() {
        if(second == 0){
            if(minute == 0){
                alert("タイムアップ！");
            }
            second = 60;
            minute--;
        }
        second--;
        $('#timerView').text(("0" + String(minute)).slice(-2) + ":" + ("0" + String(second)).slice(-2));
    }, 1000);
}

/* keyup時イベント．LOCのカウント，それに合わせたコード片の表示． */
document.addEventListener("keyup", function(e){
    /* LOCカウント部 */
    loc++; // TODO アイテムに応じて増加量を変更．
    if(String(loc).length > digit){ // 桁数による位置調整
        $("#loc").css("left", $('#loc').position().left - 7);
        digit = String(loc).length;
    }
    $('#loc').text(loc);
    /*if(loc > clearLoc-1){ // クリア判定．5分立った時にするか，ある一定以上書き上げたらにするか．後者ならlocが減っていくでもいいよな．
        alert("クリア！");
        loc = 0;
        $('#loc').text(loc);
        typeStart = true;
        $("#loc").css("left", 140);
        digit = 1;
        document.getElementById("codeView").value = "_";
        return;
    }*/

    /* Code部 */
    if(typeStart){
        document.getElementById("codeView").value = "function func(e){" + "\n" + "    var start=\"start!\"" + "\n";
        typeStart = false;
        timerStart();
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
