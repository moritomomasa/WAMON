<!--
  説明：マッチング設定入力ページ
-->
<template>
    <div id="app">
      <!-- タイトル -->
      <div class="title">{{ labels.titleFront }}<span style="color: #4169e1">{{ labels.titleBack }}</span></div>
      <div class="subtitle">{{ labels.subtitle }}</div>
      <form class="form" @submit.prevent="canMatching">
        <!-- フォーム：ユーザー名 -->
        <div class="user-name-block">
          <!-- タイトル -->
          <div class="form-title">{{ labels.userNameForm }}</div>
          <input type="text"
                 v-model="userModel.userName"
                 :maxlength="max_user_name_length"/>
          <!-- -現在の文字数表示 -->
          <div>{{ userModel.userName.length }}/{{ max_user_name_length }}</div>
        </div>
        <!-- フォーム：デバイス選択 -->
        <div class="device-block">
          <!-- タイトル -->
          <div class="form-title">{{ labels.deviceForm }}</div>
          <!-- デバイス選択 -->
          {{userModel.selectedAudio}}
          <select class="choose-audio" v-model="userModel.selectedAudio">
            <option disabled value="">{{ labels.unselected }}</option>
            <option v-for="(audio, key, index) in audios" :key="index" :value="audio.value">
              {{ audio.text }}
            </option>
          </select>
        </div>
        <!-- フォーム：マッチングタイプ選択 -->
        <div class="match-type-block">
          <!-- タイトル -->
          <div class="form-title">{{ labels.matchTypeForm }}</div>
          <!-- 話す・聞くボタン -->
          <input type="button"
                 class="match-type-btn btn"
                 value="聞く"
                 :style="userModel.isTalk == false ? activeTypeStyle : null"
                 @click="userModel.isTalk == false ? null : changeType()"/>
          <input type="button"
                 class="match-type-btn btn"
                 value="話す"
                 :style="userModel.isTalk == false ? null : activeTypeStyle"
                 @click="userModel.isTalk == false ? changeType() : null"/>
        </div>
      <!-- マッチ開始ボタン -->
        <div class="start">
          <input v-if="!isWaiting"
                 type="submit"
                 class="match-btn btn"
                 :value="labels.matchStartMsg"
                 target="_blank"/>
          <input v-else
                 type="submit"
                 class="match-btn btn"
                 :value="labels.matchWaitMsg"
                 target="_blank"/>
          <!-- 入力に不備があった時に表示 -->
          <div v-if="hasError" style="color: red">{{ labels.validErrMsg }}</div>
        </div>
      </form>

    </div>
</template>

<script>
  // ユーザー名の文字数上限
  const MAX_USER_NAME_LENGTH = 10

  // ラベル・メッセージモデル
  const LABELS = {
    titleFront: 'WA',
    titleBack: 'MON',
    subtitle: '聞きたいこと 話したい思い',
    userNameForm: 'ニックネーム入力',
    deviceForm: '使用デバイス選択',
    unselected: '未選択',
    matchTypeForm: 'タイプ選択',
    matchStartMsg: 'マッチング開始',
    matchWaitMsg:  '待機中...',
    validErrMsg: '入力に不備があります'
  }

  // ユーザーモデル
  const initialUserModel = {
    // ユーザー名
    userName: '',
    // 話す側かどうか
    isTalk: false,
    // 使用するオーディオ
    selectedAudio: '',
    // 使用するカメラ ※現在は未使用
    selectedCam: ''
  }

  export default {
    data() {
      return {
        //　ラベル・メッセージ
        labels: LABELS,
        // ユーザーの設定情報
        userModel: initialUserModel,
        // 使用可能オーディオリスト
        audios: [],
        // 使用可能カメラリスト
        cameras: [],
        // ユーザー名の文字数上限
        max_user_name_length: MAX_USER_NAME_LENGTH,
        // 入力不備があるかどうか
        hasError: false,
        // マッチング待機状態かどうか
        isWaiting: false,
      };
    },
    mounted () {
    },
    computed: {
      //* 選択中のマッチタイプのボタンのスタイル設定 */
      activeTypeStyle: function(){
        return {
            color: '#fff',
            backgroundColor: '#ff8800'
          }
      }
    },
    methods: {
      //** */
      changeType: function () {
        this.userModel.isTalk = !this.userModel.isTalk
      },
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
      canMatching: async function() {
        console.log(this.userModel)
        if (this.userModel.userName === "" || this.userModel.selectedAudio === "") {
          // 入力フォームのいづれかが未入力であった場合
          this.hasError = true
        } 
        else {
          // マッチング画面へ遷移
          this.isWaiting = true;
          this.hasError = false
          setTimeout(this.moveToMatching, 0*1000);
        }
      },
      moveToMatching: function() {
        if (this.isWaiting == true) {
          const link = "matching?type="+this.userModel.isTalk+"&name="+this.userModel.userName+"&audio="+this.userModel.selectedAudio
          this.$router.replace(link)
        }
      },
    },
    mounted: async function () {
      const deviceInfos = (await navigator.mediaDevices.enumerateDevices());
      //オーディオデバイス取得
      deviceInfos.filter(deviceInfo => deviceInfo.kind === 'audioinput').map(audio => this.audios.push({text: audio.label || 'Microphone' + (this.audios.length + 1), value: audio.deviceId}));
      //カメラ取得
      //deviceInfos.filter(deviceInfo => deviceInfo.kind === 'videoinput').map(video => this.videos.push({text: video.label || 'Camera' + (this.videos.length + 1), value: video.deviceId}));
    }
  };
</script>

<style scoped>
  .title {
    display: block;
    font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 7vw;
    font-weight: 400;
    letter-spacing: 1px;
    color: #c71585;
  }

  .subtitle {
    padding-bottom: 10vh;
    font-size: 2vw;
    font-weight: 300;
    word-spacing: 5px;
    
  }

  .form {
    width: 70%;
    margin: auto;
  }

  .user-name-block {
    font-size: 1rem;
  }

  .device-block {
    margin-top: 20px;
    font-size: 1vw;
  }

  .choose-audio {
    width: 80%;
  }
  
  .match-type-block {
    padding: 2vh 0 5vh 0;
  }

  .match-type-btn {
    width: 40%;
    height: 60px;
    font-size: 1.0rem;
    font-weight: 600;
  }

  .match-btn {
    width: 90%;
    height: 70px;
    font-size: 1.5vw
  }
</style>
