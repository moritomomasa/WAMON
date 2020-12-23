<template>
  <client-only>
    <slick>
    <div id="app">
      <div class="container">
        <div class="my-screen">
          <video id="my-video" width="400px" autoplay muted playsinline></video>
        </div>
        <div class="opponent-screen">
          <video id="opponent-video" width="400" auotplay playsinline></video>
        </div>
      </div>

        <div>
          <div class="main">
            <div class="room-info">
              <a>【Your id: <span id="my-id">{{you.peerId}}</span>】</a>
              <a>【Opponent id: <span id="opponent-id">{{opponent.peerId}}</span>】</a>
            </div>
            <button @click="disconnect" class="button">切断</button>
          </div>

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
        APIKey: '088ef9b7-e969-44b6-8236-135f33b51e61',
        selectedAudio: this.$route.query.audio,
        selectedVideo: this.$route.query.video,
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
          //video: this.selectedVideo ? { deviceId: { exact: this.selectedVideo } } : false
        }
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        document.getElementById('my-video').srcObject = stream;
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
          const el = document.getElementById('opponent-video');
          el.srcObject = stream;
          el.play();
        });
      },
      //相手を探す
      searchOpponent: async function (){
        let getId = 'null';
        let getKey = 'null';
        let getType = 'null';

        if(this.you.type == 'talk'){
            await firebase.database().ref('listen')
              .once('value',function(snapshot) {
                snapshot.forEach(function (childSnapshot) {
                  const value = childSnapshot.val();
                  getId = childSnapshot.key;
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
                  getType = 'talk';
                  return;
                });
              });
        }
        this.opponent.peerId =　getId
        this.opponent.type = getType

        if(this.opponent.peerId != 'null'){
          this.setMatchingData()
          this.makeCall()
          this.removeData(this.you.type, this.you.peerId)
          this.removeData(this.opponent.type, this.opponent.peerId)
        }
      },
      setOpponentPeerId:async function () {
        const yourId = this.you.peerId
        let opponentId
        await firebase.database().ref('matching').once('value',function(snapshot) {
          snapshot.forEach(function (childSnapshot) {
          const val = childSnapshot.val();
          console.log(val)
          if(val.opponent == yourId){
            opponentId = childSnapshot.key;
          }
          return;
          });
        });
        this.opponent.peerId = opponentId
      },
      setMatchingData: function () {
        firebase.database().ref('matching/' + this.you.peerId).set({
          opponent: this.opponent.peerId
        });
      },
      //データベースの削除
      removeData: function (type, id) {
        firebase.database().ref(type + '/' + id).remove();
      },
      //データベースのフェッチ
      fetchData: function (type, id) {
      },
      // 切断ボタン
      disconnect:async function () {
        await firebase.database().ref('matching/' + this.you.peerId).remove();
        await firebase.database().ref('matching/' + this.opponent.peerId).remove();
        this.$router.replace('/')
      }
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
        call.answer(this.localStream);
        this.connect(call);
        this.setOpponentPeerId();
      });
      this.searchOpponent();
    },
  })
</script>


    <style scoped>
      #app{
        text-align: center;
      }
      .container {
        min-height: 10vh;
        margin: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      h1 {
        font-weight: 400;
      }
      .name {
        color: #ff00ff;
      }
      .my-screen {
        float: left;
        margin: 0px;
      }
      .opponent-screen {
        float: right;
        margin: 0px;
      }
      .audio {
        margin-bottom: 20px;
      }
      .room-info {
        margin-bottom: 20px;
      }
    </style>
