<template>
    <div id="app">
      <!--
      <h1>
        <span class="name">{{ $route.query.name }}さん</span>
        <span class="type">は{{ $route.query.type }}側です</span>
      </h1>
      -->

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
              <p>他のブラウザでこのIDをコールしましょう。</p>
              <h3>コールする</h3>
              <input v-model="calltoid" placeholder="call id">
              <button @click="makeCall" class="button--green">Call</button>
            </div>
          </div>

        </div>
    </div>
</template>

<script>
  import Peer from 'skyway-js';

  export default({

    components: {
    },

    data() {
      return {
        APIKey: 'cdcf59b1-9f67-452d-a607-18fc887dc36c',
        selectedAudio: '',
        selectedVideo: '',
        audios: [],
        videos: [],
        localStream: null,
        peerId: '',
        calltoid: ''
      }
    },

    methods: {
      onChange: function () {
        if (this.selectedAudio != '' && this.selectedVideo != '') {
          this.connectLocalCamera();
        }
      },

      connectLocalCamera: async function () {
        const constraints = {
          audio: this.selectedAudio ? { deviceId: { exact: this.selectedAudio } } : true,
          video: this.selectedVideo ? { deviceId: { exact: this.selectedVideo } } : true
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        document.getElementById('my-video').srcObject = stream;
        this.localStream = stream;
      },

      makeCall: function () {
        console.log('makeCall');
        const call = this.peer.call(this.calltoid, this.localStream);
        this.connect(call);
      },

      connect: function (call) {
        call.on('stream', stream => {
          const el = document.getElementById('opponent-video');
          el.srcObject = stream;
          el.play();
        });
      }
    },

    mounted: async function () {
      const deviceInfos = (await navigator.mediaDevices.enumerateDevices());
      console.log(deviceInfos);

      //オーディオデバイス取得
      deviceInfos
      .filter(deviceInfo => deviceInfo.kind === 'audioinput')
      .map(audio => this.audios.push({text: audio.label || 'Microphone' + (this.audios.length + 1), value: audio.deviceId}));

      //カメラ取得
      deviceInfos
      .filter(deviceInfo => deviceInfo.kind === 'videoinput')
      .map(video => this.videos.push({text: video.label || 'Camera' + (this.videos.length + 1), value: video.deviceId}));

      console.log(this.audios, this.videos);

      this.peer = new Peer({
        key: this.APIKey,
        debug: 3,
      });

      this.peer.on('open', () => {
        this.peerId = this.peer.id
      });

      this.peer.on('call', call => {
        call.answer(this.localStream);
        this.connect(call);
      });

    }
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


