<template>
    <div id="app">
      <h1 class="title">承認<span class="blue">欲求</span></h1>
      <h2 class="subtitle">あなたの欲望をいまここで</h2>
      <form　@submit.prevent="canMatching" class="form">
        <span class="name">
          <input type="name"
                 class="form-control"
                 maxlength="10"
                 v-model="name"
                 aria-describedby="emailHelp"
                 placeholder="ニックネーム" />
          {{ name.length }}/10
        </span>

        <div class="audio">
          入力デバイス:
          <select v-model="selectedAudio" @change="">
            <option disabled value="">未選択</option>
            <option v-for="(audio, key, index) in audios" v-bind:key="index" :value="audio.value">
              {{ audio.text }}
            </option>
          </select>
        </div>

        <div class="links">
          <span id="listen">
            <input type="button"
                   v-on:click="toListenMode()"
                   value="聞く"
                   id="button--grey-listen"
                   style="width: 100px; height: 55px; font-size: 20px" />
          </span>
          <span id="talk">
            <input type="button"
                   v-on:click="toTalkMode()"
                   value="話す"
                   id="button--grey-talk"
                   style="width: 100px; height: 55px; font-size: 20px" />
          </span>
        </div>

        <div class="start">
          <input type="submit"
                 v-if="!isWaiting"
                 id="button--grey"
                 target="_blank"
                 value="マッチング開始"
                 style="width: 340px; height: 55px; font-size: 20px" />
          <input type="submit"
                 v-if="isWaiting"
                 id="button--grey"
                 target="_blank"
                 value="待機中..."
                 style="width: 340px; height: 55px; font-size: 20px" />
          <p v-if="!error" class="error">&nbsp;</p>
          <p v-if="error" class="error" style="color: red">入力に不備があります</p>
        </div>
      </form>
    </div>
</template>

<script>
  export default {
    components: {},
    data() {
      return {
        name: "",
        type: "",
        selectedAudio: "",
        selectedVideo: "",
        audios: [],
        videos: [],
        localStream: null,
        error: false,
        isWaiting: false,
      };
    },
    methods: {
      toListenMode: function () {
        if(this.isWaiting == false){
          this.type = "listen";
          document.getElementById("button--grey-listen").className =
            "button--grey-push";
          document.getElementById("button--grey-talk").className =
            "button--grey-talk";
        }
      },
      toTalkMode: function () {
        if(this.isWaiting == false){
          this.type = "talk";
          document.getElementById("button--grey-talk").className =
            "button--grey-push";
          document.getElementById("button--grey-listen").className =
            "button--grey-listen";
        }
      },
      canMatching:async function() {
        if (this.name === "" || this.type === "" || this.selectedAudio === "") {
          this.error = true
        } else {
          this.isWaiting = !this.isWaiting;
          this.error = false
          setTimeout(this.moveToMatching, 2*1000);
        }
      },
      moveToMatching: function() {
        if(this.isWaiting == true){
          var link = "matching?type=" + this.type + "&name=" + this.name +
                     "&audio=" + this.selectedAudio;
          this.$router.replace(link)
        }
      },
    },
    mounted: async function () {
      const deviceInfos = (await navigator.mediaDevices.enumerateDevices());
      //オーディオデバイス取得
      deviceInfos
      .filter(deviceInfo => deviceInfo.kind === 'audioinput')
      .map(audio => this.audios.push({text: audio.label || 'Microphone' + (this.audios.length + 1), value: audio.deviceId}));
      //カメラ取得
      //deviceInfos
      //.filter(deviceInfo => deviceInfo.kind === 'videoinput')
      //.map(video => this.videos.push({text: video.label || 'Camera' + (this.videos.length + 1), value: video.deviceId}));
    }
  };
</script>

<style scoped>
  .title {
    font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    display: block;
    font-weight: 400;
    font-size: 100px;
    color: #c71585;
    letter-spacing: 1px;
    font-size: 6em;
  }
  .blue {
    color: #4169e1;
  }
  .subtitle {
    font-weight: 300;
    font-size: 3em;
    color: #b8860b;
    word-spacing: 5px;
    padding-bottom: 15px;
  }
  .links {
    padding-top: 15px;
    padding-bottom: 15px;
  }
  .form {
    width: 70%;
    margin: auto;
  }
  .name {
  }
  .form-control {
    font-size: 25px;
  }
  .audio {
    padding: 10px;
    margin-bottom: 0px;
  }
</style>
