<template>
  <client-only>
    <slick>
    <div id="app">
      <div class="container">
        <div class="my-screen">
          <video id="my-video" width="400px" autoplay muted playsinline></video>
        </div>
        <div class="opponent-screen">
          <video id="opponent-video" width="400" autoplay playsinline></video>
        </div>
      </div>

        <div>
          <div class="main">
            <div class="audio">
            マイク:
            <select v-model="selectedAudio" @change="onChange">
              <option disabled value="">Please select one</option>
              <option v-for="(audio, key, index) in audios" v-bind:key="index" :value="audio.value">
                {{ audio.text }}
              </option>
            </select>

            カメラ:
            <select v-model="selectedVideo" @change="onChange">
              <option disabled value="">Please select one</option>
              <option v-for="(video, key, index) in videos" v-bind:key="index" :value="video.value">
                {{ video.text }}
              </option>
            </select>
            </div>

            <div class="room-info">
              <a>【Your id: <span id="my-id">{{peerId}}</span>】</a>
              <a>【Opponent id: <span id="opponent-id">{{calltoid}}</span>】</a>
              <a>【Opponent type: <span id="opponent-id">{{opponentType}}</span>】</a>
            </div>
            <textarea v-model="calltoid" placeholder="相手のID"></textarea>
            <button @click="removeData(userType, peerId)" class="button">データ削除</button>
            <button @click="makeCall" class="button">接続</button>
            <button @click="disconnect" class="button">切断</button>
          </div>

        </div>
    </div>
    </slick>
  </client-only>
</template>

<script>
  import firebase from '@/plugins/firebase'
  import Peer from 'skyway-js';
  export default({
    components: {
    },
    data() {
      return {
        APIKey: '088ef9b7-e969-44b6-8236-135f33b51e61',
        selectedAudio: '',
        selectedVideo: '',
        audios: [],
        videos: [],
        localStream: null,
        //あなたの情報
        peerId: '',
        userName: this.$route.query.name,
        userType: this.$route.query.type,
        //相手の情報
        calltoid: '',
        opponentName: '',
        opponentType: '',
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
          video: this.selectedVideo ? { deviceId: { exact: this.selectedVideo } } : true
        }
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        document.getElementById('my-video').srcObject = stream;
        this.localStream = stream;
      },
      //マッチング
      makeCall:　function () {
        const call = this.peer.call(this.calltoid, this.localStream);
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

        if(this.userType == 'talk'){
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
        else if(this.userType == 'listen'){
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
        else{
            console.log('Type does not exist');
        }
        this.calltoid =　getId;
        this.opponentType = getType;

        if(this.calltoid != 'null'){
          this.makeCall();
          this.removeData(this.userType, this.peerId);
          this.removeData(this.opponentType, getId);
        }
      },
      //データの削除
      removeData: function (type, id) {
        firebase.database().ref(type + '/' + id).remove();
      },
      // 切断ボタン
      disconnect: function () {
        window.close()
      }
    },
    mounted: async function () {
      const deviceInfos = (await navigator.mediaDevices.enumerateDevices());
      //オーディオデバイス取得
      deviceInfos
      .filter(deviceInfo => deviceInfo.kind === 'audioinput')
      .map(audio => this.audios.push({text: audio.label || 'Microphone' + (this.audios.length + 1), value: audio.deviceId}));
      //カメラ取得
      deviceInfos
      .filter(deviceInfo => deviceInfo.kind === 'videoinput')
      .map(video => this.videos.push({text: video.label || 'Camera' + (this.videos.length + 1), value: video.deviceId}));
      
      this.peer = new Peer({
        key: this.APIKey,
        debug: 3,
      });
      this.peer.on('open', () => {
        this.peerId = this.peer.id
        //データベース挿入
        firebase.database().ref(this.userType + '/' + this.peerId).set({
          name: this.userName,
        });
      });
      this.peer.on('call', call => {
        call.answer(this.localStream);
        this.connect(call);
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
