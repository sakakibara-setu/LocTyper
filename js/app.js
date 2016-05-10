/*

TODO
タイマー部分
　カウントダウンタイマバー（プログレスバー）の表示． ok
　残り２割になったときに背景を赤に変更． ok
　0になったときのクリア判定．→残り時間をスコアにすることに．
アイテム部分
　ステータス（アイテムによるLOC増加量）の表示．
　アイテム購入ボタン．
　アイテムによる定期LOCの追加，キータイプ時LOCの追加．
　アイテム購入後，グラフィックの追加．
　　まず，htmlにアイテムエリアを作成後，アイテム購入ボタンを追加．
　　で，それをクリックした時に，絵が追加される処理と，LOCの周期増加イベントを追加．ステータスも更新．購入時にはLOCも減らす．LOCが足りなければ何もしない．
　　LOCの周期増加イベントは，増加量分LOCを増やす．新たに購入されるたびに，増加量を増やす．ただしぎりぎり時間の場合は増やさない．

エンジニアは購入後，動き出すまで時間が多少かかる．二人目からは指数的に減っていく．円のプログレスバーを半透明なエンジニアの上に置く感じか．
botは購入後，即座に動き出すが，あまり書いてくれない．

クリア時のスコア表示． ok
タイムアップ時のスコア表示． いるかな？
リセット． 更新してもらおう．
吹き出し． ok
エフェクト．
ステータス．アイテム購入時にステータス画面更新．

5秒ごとに前のメッセージと今のメッセージが違っているか判定し，違っていればフェードアニメーションで更新． ok

・アイテム購入時．
優れたエンジニアには，優れた環境を．
あなたは何処のメーカー？
失敗は少なく，多くを学べ．
botは素直だが，多くはできない．
エンジニアには”教育”が必要だ．
たくさんいればいるほど，連携が難しい．人月の神話．
マネジメントとは，”制御”だ．自分を理解することから始まる．
少しずつ近づいている．
・一定のLOC．
順調な滑り出し．
もう少し．
・制限時間．
まだ余裕．
間に合うか．

値段変化．

*/

/* LOCカウント部用-------------------------------------------- */
var typeStart = true; // ゲーム開始判定．true=まだ始まっていない．
var codeMaxLength = 30; // codeViewクリアまでの最大行数．
var loc = 0; // LOC．これがclearLoc分貯まればクリア．
var clearLoc = 30000; // クリアに必要なloc．
var clear = false;
/* タイマー部用-------------------------------------------- */
var timer; // 周期実行関数用
var bar; // プログレスバー用
var endTime = 180000; // barの終了までの時間．1000=1秒．
var minute = 2; // タイマーの終了までの時間．分．
var second = 60; // タイマーの終了までの時間．秒．
/* アイテム部用-------------------------------------------- */
var priceRate = 1.5; // アイテムの値段の上がり幅

var item = 0; // アイテム（物的資源）全体による加算値
var item2 = 1; // itemを倍加する値
var display = { pow: 1, price: 30, num:1 };
var mouse = { pow: 1, price: 3, num:1 };
var ide = { pow: 1, price: 1000, num:1 };

var coding; // 周期実行関数用
var cps = 0; // 周期的にlocに加算される値．アイテム（人的資源）全体による加算値．
var cps2 = 1; // cpsを倍加する値
var bot = { pow: 10, price: 100, num:10 }; // pow:エンジニアによる加算値，price:必要なLOC量，num:残り数量．
var botNum = 0;
var engineer = { pow: 80, price: 500, num:10 }; // pow:エンジニアによる加算値，price:必要なLOC量，num:残り数量．
var engineerNum = 0; // 現在のエンジニア数
var maneger = { pow: 1, price: 8000, num:1 }; // pow:プロジェクトマネージャーによる乗算値（pow:1 = cps+100%），price:必要なLOC量．
var ai = { pow:1, price: 999999999, num:1 };
/* メッセージ部用-------------------------------------------- */
var message = "";
var preMessage = "";
var messageReloader;
var messageSwitch = 3;

window.addEventListener("load", init);

// 初期設定
function init(){
    $('#codeView').focus();
    $('#body_default').css('visibility', 'visible');
    timerSetup();
    itemSetup();
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
                alert("タイムアップ！（まだ続けられるよ）");
                clearInterval(timer);
                return;
            } else if(minute == 1){
                $(document.body).css("background", 'rgb(149, 14, 14)');
                message = "間に合うか<br>　";
            } else if(minute == 2){
                message = "まだ<br>余裕";
            }
            second = 60;
            minute--;
        }
        second--;
        $('#timerView').text(("0" + String(minute)).slice(-2) + ":" + ("0" + String(second)).slice(-2));
    }, 1000);
}

function itemSetup(){
    // で，それをクリックした時に，絵が追加される処理と，LOCの周期増加イベントを追加．ステータスも更新．購入時にはLOCも減らす．LOCが足りなければ何もしない．
    // LOCの周期増加イベントは，増加量分LOCを増やす．新たに購入されるたびに，増加量を増やす．ただしぎりぎり時間の場合は増やさない．

    // 周期実行関数．1秒ごとに実行．cpsずつ足す．初期値は0．
    coding = setInterval(function() {
        loc += cps * cps2;
        $('#loc').text(loc);

        if(!clear){
            if(loc > clearLoc-1){
                alert("納品完了！（まだ続けられるよ）");
                message = "スコア：<br>" + String(minute) + "分" + String(second) + "秒";
                clearInterval(timer);
                //loc = 0;
                //$('#loc').text(loc);
                //typeStart = true;
                //document.getElementById("codeView").value = "_";
                clear = true;
                return;
            }
        }
    }, 1000);

    // 購入判定．ボタンクリック時にLOCが足りていれば，LOCを減らし，物的資源の場合はitemを，人的資源の場合はcpsを増加させる．
    $('#button1').click(function(){
        if((loc > display.price) && (display.num > 0)){
            display.num--;
            loc -= display.price;
            item += display.pow; // キー効率が+1．まずはここから．
            $('#loc').text(loc); // 購入した時点でlocの表示を更新

            // エフェクト．画面を2つにする
            $('#codeView').css('height', 226 + 'px');
            $('#dualDisplay').fadeIn();
            $('#loc').css('top', -315 + 'px');

            // ボタンをオフに
            $('#button1').css("color", "rgb(0, 0, 0)");
            $('#button1').css("border", "solid 2px rgb(0, 0, 0)");
            $('#message1').css("visibility", "hidden");

            // メッセージ更新
            message = "優れたエンジニアには，<br>優れた環境を．";

            // ステータス画面更新
            $('#body_default').css('visibility', 'hidden');
            $('#item1').css('visibility', 'visible');
            $('#body_math').css('visibility', 'visible');
            $('#key').text(String((1 + item)*item2-1));
        }
    });
    $('#button2').click(function(){
        if((loc > mouse.price) && (mouse.num > 0)){
            mouse.num--;
            loc -= mouse.price;
            item += mouse.pow; // キー効率を+1．あっても損はない．
            $('#loc').text(loc); // 購入した時点でlocの表示を更新

            // エフェクト．マウスカーソルを変更．
            $('body').css("cursor", "url(images/cursor.png), text");
            $('#codeView').css("cursor", "url(images/cursor.png), text");
            $('#dualDisplay').css("cursor", "url(images/cursor.png), text");
            $('.button').css("cursor", "url(images/cursor.png), text");

            // ボタンをオフに
            $('#button2').css("color", "rgb(0, 0, 0)");
            $('#button2').css("border", "solid 2px rgb(0, 0, 0)");
            $('#message2').css("visibility", "hidden");

            // メッセージ更新
            message = "あなたは<br>何処のメーカー？";

            // ステータス画面更新
            $('#body_default').css('visibility', 'hidden');
            $('#item2').css('visibility', 'visible');
            $('#body_math').css('visibility', 'visible');
            $('#key').text(String((1 + item)*item2-1));
        }
    });
    $('#button3').click(function(){
        if((loc > ide.price) && (ide.num > 0)){
            ide.num--;
            loc -= ide.price;
            item2 += ide.pow; // キー効率を+100%．2倍だぞ！
            $('#loc').text(loc); // 購入した時点でlocの表示を更新

            // エフェクト．画面をIDE化
            $('#codeView').css('background-color', "#054114");
            $('#dualDisplay').css('background-color', "#054114");

            // ボタンをオフに
            $('#button3').css("color", "rgb(0, 0, 0)");
            $('#button3').css("border", "solid 2px rgb(0, 0, 0)");
            $('#message3').css("visibility", "hidden");

            // メッセージ更新
            message = "失敗は少なく，<br>多くを学べ．";

            // ステータス画面更新
            $('#body_default').css('visibility', 'hidden');
            $('#item3').css('visibility', 'visible');
            $('#body_math').css('visibility', 'visible');
            $('#key').text(String((1 + item)*item2-1));
        }
    });
    $('#button4').click(function(){
        if((loc > bot.price) && (bot.num > 0)){
            bot.num--;
            loc -= bot.price;
            cps += bot.pow; // 1秒ごとに1LOC書いてくれる．10個まで．
            $('#loc').text(loc); // 購入した時点でlocの表示を更新

            // 値段更新
            bot.price = Math.floor(bot.price * priceRate);
            $('#button4 > .itemprice').text("[" + String(bot.price) + "LOC]");

            // エフェクト．botの画像を追加

            if(bot.num <= 0){
                // ボタンをオフに
                $('#button4').css("color", "rgb(0, 0, 0)");
                $('#button4').css("border", "solid 2px rgb(0, 0, 0)");
                $('#message4').css("visibility", "hidden");
            }

            // メッセージ更新
            message = "botは素直だが，<br>多くはできない．";
            if(bot.num <= 5) {
                message = "ちりも積もれば．<br>　"
            } else if(bot.num <= 8) {
                message = "botも，<br>学習する．"
            }

            // ステータス画面更新
            botNum++;
            $('#body_default').css('visibility', 'hidden');
            $('#item4').css('visibility', 'visible');
            $('#item4 > .itemnum').text("×" + String(botNum));
            $('#body_math').css('visibility', 'visible');
            $('#cps').text(String(cps*cps2));
        }
    });
    $('#button5').click(function(){
        if((loc > engineer.price) && (engineer.num > 0)){
            engineer.num--;
            loc -= engineer.price;
            cps += engineer.pow; // 5LOC/sec．多けりゃいいってものでもない．
            $('#loc').text(loc); // 購入した時点でlocの表示を更新
            engineerNum++;

            // ただし残り1分では，cpsが増えない．メッセージを表示．
            // というかpowが下がっていく．
            if(engineerNum==1){
                engineer.pow = Math.floor(engineer.pow / 1.5);
            } else if(engineerNum==2){
                engineer.pow = Math.floor(engineer.pow / 2);
            } else if(engineerNum==3){
                engineer.pow = Math.floor(engineer.pow / 3);
            } else if(engineerNum>=4){
                engineer.pow = Math.floor(engineer.pow / (engineerNum*engineerNum));
            }

            // 値段更新
            engineer.price = Math.floor(engineer.price * priceRate);
            $('#button5 > .itemprice').text("[" + String(engineer.price) + "LOC]");

            // エフェクト．エンジニアの画像を追加

            if(engineer.num <= 0){
                // ボタンをオフに
                $('#button5').css("color", "rgb(0, 0, 0)");
                $('#button5').css("border", "solid 2px rgb(0, 0, 0)");
                $('#message5').css("visibility", "hidden");
            }

            // メッセージ更新
            message = "エンジニアには<br>”教育”が必要だ．";
            if(engineer.num <= 5) {
                message = "人月の神話．<br>　"
            } else if(engineer.num <= 8) {
                message = "たくさんいればいるほど，<br>連携が難しい．"
            }

            // ステータス画面更新
            $('#body_default').css('visibility', 'hidden');
            $('#item5').css('visibility', 'visible');
            $('#item5 > .itemnum').text("×" + String(engineerNum));
            $('#body_math').css('visibility', 'visible');
            $('#cps').text(String(cps*cps2));
        }
    });
    $('#button6').click(function(){
        if((loc > maneger.price) && (maneger.num > 0)){
            maneger.num--;
            loc -= maneger.price;
            cps2 += maneger.pow; // lpsを+100%．すごい．
            $('#loc').text(loc); // 購入した時点でlocの表示を更新

            // エフェクト．マネージャーの画像を追加

            if(maneger.num <= 0){
                // ボタンをオフに
                $('#button6').css("color", "rgb(0, 0, 0)");
                $('#button6').css("border", "solid 2px rgb(0, 0, 0)");
                $('#message6').css("visibility", "hidden");
            }

            // メッセージ更新
            message = "マネジメントとは，”制御”だ．<br>自分を理解することから始まる．";

            // ステータス画面更新
            $('#body_default').css('visibility', 'hidden');
            $('#item6').css('visibility', 'visible');
            $('#body_math').css('visibility', 'visible');
            $('#cps').text(String(cps*cps2));
        }
    });
    $('#button7').click(function(){
        if((loc > ai.price) && (ai.num > 0)){
            ai.num--;
            loc -= ai.price;
            $('#loc').text(loc); // 購入した時点でlocの表示を更新

            if(ai.num <= 0){
                // ボタンをオフに
                $('#button7').css("color", "rgb(0, 0, 0)");
                $('#button7').css("border", "solid 2px rgb(0, 0, 0)");
                $('#message7').css("visibility", "hidden");
            }

            // エフェクト．辿り着いた者．

            message = "辿り着いた者．<br>　";
        }
        message = "まだ遠い．<br>　";
    });
}

/* keyup時イベント．LOCのカウント，それに合わせたコード片の表示． */
document.addEventListener("keyup", function(e){
    /* LOCカウント部 */
    loc += (1 + item)*item2; // アイテムに応じて増加量を変更．
    $('#loc').text(loc);
    if(!clear){
        if(loc > clearLoc-1){ // クリア判定．5分立った時にするか，ある一定以上書き上げたらにするか．後者ならlocが減っていくでもいいよな．
            alert("納品完了！（まだ続けられるよ）");
            message = "スコア：<br>" + String(minute) + "分" + String(second) + "秒";
            clearInterval(timer);
            //loc = 0;
            //$('#loc').text(loc);
            //typeStart = true;
            //document.getElementById("codeView").value = "_";
            clear = true;
            return;
        }
    }
    if((loc > 500) && (messageSwitch == 3)){
        message = "まずは<br>それなり";
        messageSwitch--;
    } else if((loc > 5000) && (messageSwitch == 2)){
        message = "ここまで<br>来た";
        messageSwitch--;
    } else if((loc > 20000) && (messageSwitch == 1)){
        message = "あと<br>もう少し";
        messageSwitch--;
    }

    /* Code部 */
    if(typeStart){
        document.getElementById("codeView").value = "function func(e){" + "\n" + "    var start=\"start!\"" + "\n";
        typeStart = false;
        timerStart();
        $('#text').fadeOut('slow', function(){
            $('#text').html("ここからが<br/>始まり");
        });
        $('#text').fadeIn('slow');

        // メッセージを周期的に確認して変更があれば更新する
        messageReloader = setInterval(function() {
            if(message != preMessage){
                $('#text').fadeOut('slow', function(){
                    $('#text').html(message);
                });
                $('#text').fadeIn('slow');
                preMessage = message;
            }
        }, 1000);
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

    if(display.num==0){
        document.getElementById("dualDisplay").value += randomCode(); // ランダムなコード片を追記

        $('#dualDisplay').scrollTop(
            $('#dualDisplay')[0].scrollHeight - $('#dualDisplay').height()
        ); // 自動スクロール

        var dualCodeLength = document.getElementById("dualDisplay").value.match(/\n/g); //IE 用
        //console.log(codeLength.length);
        if(dualCodeLength.length > codeMaxLength){
            document.getElementById("dualDisplay").value = "";
        } // ある程度まで行ったらクリアして最初から
    }
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
