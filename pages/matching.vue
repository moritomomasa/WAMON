<!--
  説明：マッチング中ページ
-->
<template>
  <client-only>
    <slick>
    <div id="app">
      <span v-if="isMatch">
        <span v-if="you.type == 'listen'" v-on="displayName(you.name,opponent.name)"></span>
        <span v-else v-on="displayName(opponent.name,you.name)"></span>
      </span>

      <!--オーディオ-->
      <audio id="audio"></audio>

      <div class="switching-part">
        <!--マッチ相手探し中に表示-->
        <div id="Loading" style="display:block">
          <img src="../img/loading.gif" class="loadimg">
          <p class="loadmsg">
            マッチング相手を探しています...
          </p>
        </div>

        <!--マッチング中に表示-->
        <div id="matching" style="display:none">
          <div class="main">
            <div class="room-info">
            </div>
          </div>
        </div>

        <!--時間経過-->
        <div class="count">
          <span v-if="isMatch">
            {{hour}} : {{min}} : {{sec}}
          </span>
          <span v-else>
          </span>
        </div>
      </div>

      <!--<button @click="ToMatch" class="button">切り替え</button>-->

      <!--ボタン-->
      <div class="button-area">
        <div v-if="!isMute">
          <img src="../img/mike-on.png" class="button button-mute" @click="mute" alt="mute">
        </div>
        <div v-else>
          <img src="../img/mike-off.png" class="button button-mute" @click="mute" alt="mute">
        </div>
        <button @click="disconnect" class="button button-disc">切断</button>
      </div>

    </div>
    </slick>
  </client-only>
</template>


<script>
  import firebase from '@/plugins/firebase'
import Peer from 'skyway-js'

  export default({
    components: {
    },
    data() {
      return {
        APIKey: 'cdcf59b1-9f67-452d-a607-18fc887dc36c',
        selectedAudio: this.$route.query.audio,
        selectedVideo: null,
        audios: [],
        videos: [],
        localStream: null,
        audioTrack: null,
        isMute: false,
        isMatch: false,

        //経過時間
        start: 0,
        hour: 0,
        min: 0,
        sec: 0,
        now: 0,
        datet: 0,

        //あなたの情報
        you: {
          peerId: '',
          name: this.$route.query.name,
          type: this.$route.query.type,
        },
        //相手の情報
        opponent: {
          peerId: '',
          name: '',
          type: '',
        },
      }
    },
    methods: {
      //ミュートの切り替え
      mute: function() {
        if (this.localStream) {
          const audioTrack = this.localStream.getAudioTracks()[0]
          this.isMute = !this.isMute
          audioTrack.enabled = !this.isMute
        }
      },
      //audio,videoの変更
      onChange: function () {
        this.connectLocalCamera();
        this.makeCall();
      },
      //audio,videoの接続
      connectLocalCamera: async function () {
        const constraints = {
          audio: this.selectedAudio ? { deviceId: { exact: this.selectedAudio } } : true,
          video: this.selectedVideo ? { deviceId: { exact: this.selectedVideo } } : false
        }
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.localStream = stream;
      },
      //マッチング
      makeCall:　function () {
        const call = this.peer.call(this.opponent.peerId, this.localStream);
        this.connect(call);
      },
      //相手のaudio,videoの取得
      connect: function (call) {
        call.on('stream', stream => {
          const el = document.getElementById('audio');
          el.srcObject = stream;
          el.play();
        });
      },
      //相手を探す
      searchOpponent: async function (){
        let getId = 'null';
        let getName;
        let getKey = 'null';
        let getType = 'null';

        if(this.you.type == 'talk'){
            await firebase.database().ref('listen')
              .once('value',function(snapshot) {
                snapshot.forEach(function (childSnapshot) {
                  const value = childSnapshot.val();
                  getId = childSnapshot.key;
                  getName = value.name;
                  getType = 'listen';
                  return;
                });
              });
        }
        else if(this.you.type == 'listen'){
            await firebase.database().ref('talk')
              .once('value',function(snapshot) {
                snapshot.forEach(function (childSnapshot) {
                  const value = childSnapshot.val();
                  getId = childSnapshot.key;
                  getName = value.name;
                  getType = 'talk';
                  return;
                });
              });
        }
        this.opponent.peerId =　getId
        this.opponent.name =　getName
        this.opponent.type = getType

        //相手がいたら
        if(this.opponent.peerId != 'null'){
          this.isMatch = true
          this.setMatchingData()
          this.makeCall()
          this.removeData(this.you.type, this.you.peerId)
          this.removeData(this.opponent.type, this.opponent.peerId)
          this.ToMatch()
          this.start = new Date()
          this.count()
        }
      },
      //マッチ相手の情報取得
      getOpponentInfo:async function () {
        const yourId = this.you.peerId
        let opponentId,opponentName
        await firebase.database().ref('matching').once('value',function(snapshot) {
          snapshot.forEach(function (childSnapshot) {
          const val = childSnapshot.val();
          console.log(val.name);
          if(val.id == yourId){
            opponentId = childSnapshot.key;
            opponentName = val.name;
          }
          return;
          });
        });
        this.opponent.peerId = opponentId
        this.opponent.name = opponentName
      },
      displayName: function (listner,talker) {
        var listnerSpace = document.getElementById("listner-name")
        var talkerSpace = document.getElementById("talker-name")
        listnerSpace.innerHTML = listner
        talkerSpace.innerHTML = talker
      },
      setMatchingData:async function () {
        if(this.you.peerId) {
          await firebase.database().ref('matching/' + this.you.peerId).set({
            id: this.opponent.peerId,
            name: this.you.name
          });
        }
      },
      //データベースの削除
      removeData: function (type, id) {
        firebase.database().ref(type + '/' + id).remove();
      },
      //データベースの取得
      fetchData: function (type, id) {
      },
      count: function () {
	      this.now = new Date();

	      this.datet = parseInt((this.now.getTime() - this.start.getTime()) / 1000);

	      this.hour = parseInt(this.datet / 3600);
	      this.min = parseInt((this.datet / 60) % 60);
	      this.sec = this.datet % 60;

	      // 数値が1桁の場合、頭に0を付けて2桁で表示する指定
	      if(this.hour < 10) { this.hour = "0" + this.hour; }
	      if(this.min < 10) { this.min = "0" + this.min; }
	      if(this.sec < 10) { this.sec = "0" + this.sec; }

	      setTimeout(this.count, 1000);
　　　},
      // 切断ボタン
      disconnect:async function () {
        this.leavePage()
        location.replace('/');
      },
      ToMatch:async function () {//テスト用 切り替えボタンも消す
          document.getElementById("Loading").style.display = "none";
          document.getElementById("matching").style.display = "block";
      },
      ToWait:async function () {//テスト用
          document.getElementById("Loading").style.display = "block";
          document.getElementById("matching").style.display = "none";
      },
      //ページを離れたら
      leavePage: function () {
        this.removeData('matching', this.you.peerId);
        this.removeData('matching', this.opponent.peerId);
        this.removeData(this.you.type, this.you.peerId);
        this.peer.destroy();
      },
    },
    mounted: async function () {
      //ページを離れる前に実行
      window.onbeforeunload = this.leavePage;

      this.connectLocalCamera()

      //①peerkey取得
      this.peer = new Peer({
        key: this.APIKey,
        debug: 3,
      });
      //②固有のid取得
      this.peer.on('open', () => {
        this.you.peerId = this.peer.id
        firebase.database().ref(this.you.type + '/' + this.you.peerId).set({
          name: this.you.name,
        });
      });
      //接続された側のみ実行
      this.peer.on('call', call => {
        this.isMatch = true
        call.answer(this.localStream)
        this.connect(call)
        this.getOpponentInfo()
        this.ToMatch()
        this.start = new Date()
        this.count()
      });

      this.searchOpponent()
    },
    })
</script>


    <style scoped>
      #app{
        text-align: center;
      }
      .audio {
      }
      .count {
        font-size: 2vw;
      }
      .switching-part {
        height: 30vh;
        padding-bottom: 27vw;
      }
      .room-info {
        font-size: 1.5vw;
        padding-top: 20%;
        padding-bottom: 20%;
      }
      .loadimg {
        width: 27vw;
        margin-top: 6vw;
      }
      .loadmsg {
        font-size: 1.5vw;
      }
      .button-area {
      }
      .button-mute {
        width: 22%;
        border-radius: 50%;
        border-color: black;
        padding: 1vh;
        margin-bottom: 6vw;
      }
      .button-disc {
        width: 65%;
        padding: 1.5vh;
        font-size: 2vw;
      }
    </style>
