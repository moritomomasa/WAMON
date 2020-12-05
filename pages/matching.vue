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

            <div>
              <p>Your id: <span id="my-id">{{peerId}}</span></p>
              <p>Opponent id: <span id="opponent-id">{{calltoid}}</span></p>
              <p>他のブラウザでこのIDをコールしましょう。</p>
              <h3>debug:{{debug}}</h3>
              <button @click="makeCall" class="button">Call</button>
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
  import Peer from 'skyway-js';
  export default({
    components: {
    },
    data() {
      return {
        Ref: '',
        APIKey: '088ef9b7-e969-44b6-8236-135f33b51e61',
        selectedAudio: '',
        selectedVideo: '',
        audios: [],
        videos: [],
        localStream: null,
        peerId: '',
        calltoid: '',
        userName: this.$route.query.name,
        userType: this.$route.query.type,
        userState: 'waiting',
        opponentKey: '',
        debug: '',
      }
    },
    methods: {
      //audio,videoの変更
      onChange: function () {
        if (this.selectedAudio != '' && this.selectedVideo != '') {
          this.connectLocalCamera();
        }
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
          this.debug = 'remove';
          this.removeData(this.opponentKey);
        });
      },
      //相手を探す
      searchOpponent: async function (){
        let getId = 'null';
        let getKey = 'null';
        if(this.userType == 'talk'){
            await this.Ref.orderByChild('type').startAt('listen').endAt('listen')
              .once('value',function(snapshot) {
                snapshot.forEach(function (childSnapshot) {
                  const value = childSnapshot.val();
                  getKey = childSnapshot.key;
                  if(value.state == 'waiting'){
                    getId = value.peerId;
                    return;
                  }
                });
              });
        }
        else if(this.userType == 'listen'){
            await this.Ref.orderByChild('type').startAt('talk').endAt('talk')
              .once('value',function(snapshot) {
                snapshot.forEach(function (childSnapshot) {
                  const value = childSnapshot.val();
                  getKey = childSnapshot.key;
                  if(value.state == 'waiting'){
                    getId = value.key.peerId;
                    return;
                  }
                });
              });
        }
        else{
            console.log('Type does not exist');
        }
        this.calltoid =　getId;
        this.opponentKey = getKey;
        if(this.calltoid != 'null'){
          this.debug = 'makecall';
          this.makeCall();
        }
      },
      //データの削除
      removeData: function (key) {
        if(data != 'null'){
          this.Ref.child(key).remove();
        }
      },
      // 切断ボタン
      disconnect: function () {
        window.close()
      firebase.database().ref(this.peerId).remove();
      }
    },
    mounted: async function () {
      const deviceInfos = (await navigator.mediaDevices.enumerateDevices());
      this.Ref = firebase.database().ref();
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
          peerId: this.peerId,

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
    </style>
