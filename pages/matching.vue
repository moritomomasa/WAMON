<!--
  説明：マッチング中ページ
-->
<template>
  <div id="app">
    <!-- ユーザー情報 -->
    <span v-if="isMatch">
      <span v-if="you.type == 'listen'" v-on="reflectDisplayName(you.name, partner.name)"></span>
      <span v-else v-on="reflectDisplayName(partner.name, you.name)"></span>
    </span>
    <!-- マッチ相手探し中 -->
    <div v-if="!isMatch">
      <img src="../img/loading.gif" class="loading">
      <p class="loading-msg">{{ labels.searchTalkPartnerMsg }}</p>
    </div>
    <!-- 時間経過 -->
    <div v-show="isMatch" class="countTalkTime">{{ talkTimeHMS }}</div>
    <!-- ミュートボタン -->
    <div>
      <img v-if="!isMute" src="../img/mike-on.png" class="button mike-btn" @click="switchMute()" alt="mike-on">
      <img v-else src="../img/mike-off.png" class="button mike-btn" @click="switchMute()" alt="mike-off">
    </div>
    <!-- 切断ボタン -->
    <button @click="disconnect" class="btn">{{ labels.disconnect }}</button>
    <!-- オーディオ -->
    <audio id="audio"></audio>
  </div>
</template>

<script>
  import firebase from '@/plugins/firebase'
  import Peer from 'skyway-js'

  // API
  const API_KEY = 'cdcf59b1-9f67-452d-a607-18fc887dc36c'
  // ラベル・メッセージモデル
  const LABELS = {
    disconnect: '切断',
    searchTalkPartnerMsg: 'マッチング相手を探しています...'
  }
  // あなたの情報の初期化
  const initYou = {
    peerId: '',
    name: '',
    type: '',
    selectedAudio: null,
    selectedVideo: null
  }
  // 相手の情報の初期化
  const initPartner = {
    peerId: '',
    name: '',
    type: ''
  }
  // 時間情報の初期化
  const initTime = {
    start: 0,
    hour: 0,
    min: 0,
    sec: 0
  }

  export default({
    data() {
      return {
        // ラベル・メッセージ
        labels: LABELS,
        // あなたの情報
        you: initYou,
        // 相手の情報
        partner: initPartner,
        // 経過時間
        time: initTime,
        // webRTCのAPIキー
        APIKey: API_KEY,
        // デバイスのストリーム
        localStream: null,
        // マイクのオンオフ(デフォルトはオン)
        isMute: false,
        // 会話中かどうか
        isMatch: false,
      }
    },
    mounted: async function () {
      // youオブジェクトの初期化
      this.you = {
        name: this.$route.query.name,
        type: this.$route.query.type,
        selectedAudio: this.$route.query.audio
      }
      // ページを離れる前に実行
      window.onbeforeunload = this.beforeLeave
      // デバイスへ接続
      this.connectDevice()
      // 1.peerkey取得
      this.peer = new Peer({
        key: this.APIKey,
        debug: 3,
      })
      // 2.固有のid取得
      this.peer.on('open', () => {
        this.you.peerId = this.peer.id
        firebase.database().ref(this.you.type + '/' + this.you.peerId).set({
          name: this.you.name,
        })
      })
      // すでに待機中だった人がいた場合に発火
      this.peer.on('call', call => {
        this.isMatch = true
        call.answer(this.localStream)
        this.connectPartnerDevice(call)
        this.getPartnerInfo()
        this.start = new Date()
        this.countTalkTime()
      })
      // 待機中の人がいない場合は会話相手を探す
      this.searchPartner()
    },
    computed: {
      //* 会話時間'時：分：秒' */
      talkTimeHMS: function() {
        // 数値が1桁の場合、頭に0を付けて2桁で表示する指定
        if(this.hour < 10) this.hour = '0' + this.hour
	      if(this.min < 10) this.min = '0' + this.min
	      if(this.sec < 10) this.sec = '0' + this.sec
        return this.hour + ' : ' + this.min + ' : ' + this.sec
      }
    },
    methods: {
      //* マッチしたら画面にニックネームを表示する */
      reflectDispName: function (listner, talker) {
        document.getElementById("listner-name").innerHTML = listner
        document.getElementById("talker-name").innerHTML = talker
      },
      //* 自信のデバイスの定義 */
      connectDevice: async function () {
        const constraints = {
          audio: this.you.selectedAudio ? { deviceId: { exact: this.you.selectedAudio } } : true,
          video: this.you.selectedVideo ? { deviceId: { exact: this.you.selectedVideo } } : false
        }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        this.localStream = stream
      },
      //* 相手のデバイスの接続 */
      connectPartnerDevice: function (call) {
        call.on('stream', stream => {
          const el = document.getElementById('audio')
          el.srcObject = stream
          el.play()
        })
      },
      //* お互いのデバイスを接続する */
      makeCall: function () {
        const call = this.peer.call(this.partner.peerId, this.localStream)
        this.connectPartnerDevice(call)
      },
      //* 相手を探す */
      searchPartner: async function (){
        if (this.you.type == 'talk') {
            await firebase.database().ref('listen')
              .once('value',function(snapshot) {
                snapshot.forEach(function (childSnapshot) {
                  const value = childSnapshot.val()
                  this.partner.peerId = childSnapshot.key
                  this.partner.name = value.name
                  this.partner.type = 'listen'
                  return
                })
              })
        }
        else if (this.you.type == 'listen') {
            await firebase.database().ref('talk')
              .once('value',function(snapshot) {
                snapshot.forEach(function (childSnapshot) {
                  const value = childSnapshot.val()
                  this.partner.peerId = childSnapshot.key
                  this.partner.name = value.name
                  this.partner.type = 'talk'
                  return
                })
              })
        }
        // 相手がいたら
        if (this.partner.peerId) {
          this.isMatch = true
          // 会話中データベースに移行
          this.switchMatchingData()
          // 待機データベースから2人のデータを削除
          this.removeData(this.you.type, this.you.peerId)
          this.removeData(this.partner.type, this.partner.peerId)
          // お互いのオーディオを接続
          this.makeCall()
          // 会話時間の追跡開始
          this.start = new Date()
          this.countTalkTime()
        }
      },
      //* 相手の情報取得 */
      getPartnerInfo: async function () {
        await firebase.database().ref('matching').once('value', function(snapshot) {
          snapshot.forEach(function (childSnapshot) {
            if(childSnapshot.val().id == this.you.peerId){
              this.partner.peerId = childSnapshot.key
              this.partner.name = childSnapshot.val().name
            }
          return
          })
        })
      },
      //* 会話中データベースに移行 */
      switchMatchingData : async function () {
        if(this.you.peerId) {
          await firebase.database().ref('matching/' + this.you.peerId).set({
            id: this.partner.peerId,
            name: this.you.name
          })
        }
      },
      //* データベースの削除 */
      removeData: function (type, id) {
        firebase.database().ref(type + '/' + id).remove()
      },
      //* ミュートの切り替え */
      switchMute: function() {
        if (this.localStream) {
          this.isMute = !this.isMute
          this.localStream.getAudioTracks()[0].enabled = !this.isMute
        }
      },
      //* 会話の切断 */
      disconnect : async function () {
        this.beforeLeave()
        location.replace('/')
      },
      //* 会話の切断前に必ず実行する */
      beforeLeave : function () {
        this.removeData('matching', this.you.peerId)
        this.removeData('matching', this.partner.peerId)
        this.removeData(this.you.type, this.you.peerId)
        this.peer.destroy()
      },
      //* 経過時間をHMSで計算 */
      countTalkTime: function () {
	      this.datet = parseInt((new Date().getTime() - this.start.getTime()) / 1000)
	      this.hour = parseInt(this.datet / 3600)
	      this.min = parseInt((this.datet / 60) % 60)
	      this.sec = this.datet % 60
	      setTimeout(this.countTalkTime, 1000)
      },
    }
    })
</script>

<style scoped>
  #app{
    text-align: center;
  }

  .countTalkTime {
    font-size: 2vw;
  }

  .loading {
    width: 27vw;
    margin-top: 6vw;
  }

  .loading-msg {
    font-size: 1.5vw;
  }

  .mike-btn {
    width: 22%;
    border-radius: 50%;
    border-color: black;
    padding: 1vh;
    margin-bottom: 6vw;
  }
</style>
