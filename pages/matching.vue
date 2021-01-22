<template>
  <client-only>
    <slick>
    <div id="app">
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
            <div v-if="you.type == 'listen'">
              <div style="float:left">【あなた({{you.name}})】</div>
              <div style="float:right">【あいて({{opponent.name}})】</div>
            </div>
            <div v-else>
              <div style="float:right">【あなた({{you.name}})】</div>
              <div style="float:left">【あいて({{opponent.name}})】</div>
            </div>
            <div class="matching-now">通話中．．．</div>
          </div>
        </div>
      </div>
      </div>

      <!--切断ボタン-->
      <button @click="disconnect" class="button">切断</button>

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
        //document.getElementById('my-video').srcObject = stream;
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
          this.setMatchingData()
          this.makeCall()
          this.removeData(this.you.type, this.you.peerId)
          this.removeData(this.opponent.type, this.opponent.peerId)
          this.ToMatch()
        }
      },
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
      // 切断ボタン
      disconnect:async function () {
        await firebase.database().ref('matching/' + this.you.peerId).remove();
        await firebase.database().ref('matching/' + this.opponent.peerId).remove();
        this.removeData(this.you.type, this.you.peerId);
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
    },
    mounted: async function () {
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
        call.answer(this.localStream)
        this.connect(call)
        this.getOpponentInfo()
        this.ToMatch()
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
      .switching-part {
        height: 30vh;
        padding-bottom: 30vw;
      }
      .room-info {
        font-size: 1.5vw;
        padding-top: 45%;
        padding-bottom: 45%;
      }
      .matching-now {
        padding-top:30%;
      }
      .loadimg {
        width: 27vw;
        margin-top: 6vw;
      }
      .loadmsg {
        font-size: 1.5vw;
      }
      .button {
        width: 70%;
        padding: 2vh;
      }
    </style>
