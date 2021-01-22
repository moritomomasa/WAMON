<template>
    <div id="app">
      <!--タイトル-->
      <h1 class="title">承認<span class="title-back">欲求</span></h1>
      <h2 class="subtitle">聞きたいこと 話したい思い</h2>

      <!--フォーム(名前)-->
      <form　@submit.prevent="canMatching" class="form">
        ニックネーム入力:
        <span class="name">
          <input type="name"
                 class="form-control"
                 maxlength="10"
                 v-model="name"
                 aria-describedby="emailHelp" />
          {{ name.length }}/10
        </span>
      <!--フォーム(デバイス)-->
        <div class="audio">
          入力デバイス選択:
          <select v-model="selectedAudio" @change="" class="choose-audio">
            <option disabled value="">未選択</option>
            <option v-for="(audio, key, index) in audios" v-bind:key="index" :value="audio.value">
              {{ audio.text }}
            </option>
          </select>
        </div>
      <!--フォーム(マッチングタイプ)-->
        <div class="links">
          タイプ選択:<br>
          <span id="listen">
            <input type="button"
                   v-on:click="toListenMode()"
                   value="聞く"
                   id="button-listen"
                   style="width: 35%; height: 60px; font-size: 1.5vw" />
          </span>
          <span id="talk">
            <input type="button"
                   v-on:click="toTalkMode()"
                   value="話す"
                   id="button-talk"
                   style="width: 35%; height: 60px; font-size: 1.5vw" />
          </span>
        </div>
      <!--マッチ開始ボタン-->
        <div class="start">
          <input type="submit"
                 v-if="!isWaiting"
                 id="button"
                 target="_blank"
                 value="マッチング開始"
                 style="width: 90%; height: 70px; font-size: 1.5vw" />
          <input type="submit"
                 v-if="isWaiting"
                 id="button"
                 target="_blank"
                 value="待機中..."
                 style="width: 90%; height: 70px; font-size: 1.5vw" />
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
          document.getElementById("button-listen").className =
            "button-push";
          document.getElementById("button-talk").className =
            "button-talk";

          document.getElementById("listen-img-unselect").className =
            "listen-img-select";
          document.getElementById("talk-img-unselect").className =
            "talk-img-unselect";
        }
      },
      toTalkMode: function () {
        if(this.isWaiting == false){
          this.type = "talk";
          document.getElementById("button-talk").className =
            "button-push";
          document.getElementById("button-listen").className =
            "button-listen";

          document.getElementById("listen-img-unselect").className =
            "listen-img-unselect";
          document.getElementById("talk-img-unselect").className =
            "talk-img-select";
        }
      },
      canMatching:async function() {
        if (this.name === "" || this.type === "" || this.selectedAudio === "") {
          this.error = true
        } else {
          this.isWaiting = !this.isWaiting;
          this.error = false
          setTimeout(this.moveToMatching, 0*1000);
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
      deviceInfos
      .filter(deviceInfo => deviceInfo.kind === 'videoinput')
      .map(video => this.videos.push({text: video.label || 'Camera' + (this.videos.length + 1), value: video.deviceId}));
    }
  };
</script>

<style scoped>
  .title {
    font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    display: block;
    font-weight: 400;
    color: #c71585;
    letter-spacing: 1px;
    font-size: 7vw;
  }
  .title-back {
    color: #4169e1;
  }
  .subtitle {
    font-weight: 300;
    font-size: 2vw;
    color: #b8860b;
    word-spacing: 5px;
    padding-bottom: 10vh;
  }
  .links {
    padding-top: 2vh;
    padding-bottom: 5vh;
  }
  .form {
    width: 70%;
    margin: auto;
  }
  .name {
  }
  .form-control {
    font-size: 20px;
  }
  .audio {
    margin-top: 20px;
  }
  .choose-audio {
    width: 80%;
  }
  .choose-type {
  }
</style>
