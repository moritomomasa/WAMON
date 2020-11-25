<template>
    <div id="app">
      <h1 class="title">承認<span class="blue">欲求</span></h1>
      <h2 class="subtitle">あなたの欲望をいまここで</h2>

      <form>
        <span class="input-name">
          <label for="exampleInputEmail1"></label>
          <input type="name"
                 class="form-control"
                 maxlength="10"
                 style="font-size: 25px"
                 v-model="name"
                 aria-describedby="emailHelp"
                 placeholder="name" />
          {{ name.length }}/10
        </span>
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
          <p>
            <input type="button"
                   v-on:click="canMatching()"
                   id="button--grey"
                   target="_blank"
                   value="マッチング開始"
                   style="width: 340px; height: 55px; font-size: 20px" />
          </p>
        </div>
      </form>
    </div>
</template>

<script>
  import firebase from '@/plugins/firebase'

  export default {

    components: {},
    data() {
      return {
        name: "",
        type: "",
      };
    },
    methods: {
      toListenMode: function () {
        this.type = "listen";
        document.getElementById("button--grey-listen").className =
          "button--grey-push";
        document.getElementById("button--grey-talk").className =
          "button--grey-talk";
      },
      toTalkMode: function () {
        this.type = "talk";
        document.getElementById("button--grey-talk").className =
          "button--grey-push";
        document.getElementById("button--grey-listen").className =
          "button--grey-listen";
      },
      canMatching() {
        if (this.name === "") {
          alert("No name entered");
          console.log("No name entered");
          return;
        } else if (this.type === "") {
          alert("No type selected");
          console.log("No type selected");
          return;
        } else {
          var link = "matching?type=" + this.type + "&name=" + this.name;
          window.open(
            link,
            "mywindow1",
            "left=240, width=1000, height=800, menubar=no, toolbar=no, scrollbars=yes"
          );
        }
      },
    },
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
</style>