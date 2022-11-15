<template>
  <ul class="col3">
    <li id="listen-img-unselect"><figcaption id="listner-name"></figcaption></li>
    <li class="container"><Nuxt /></li>
    <li id="talk-img-unselect"><figcaption id="talker-name"></figcaption></li>
  </ul>
</template>

<style>
html {
  font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 1.1vw;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  color: #2E495E;
}

.col3 {
  display: flex;
}

.col3 li {
  width: calc(100% / 3);
  height: 50vw;
}

ul,
li {
  padding-left: 0;
  margin-top: 0;
  margin-bottom: 0;
  list-style: none;
}

li {
  background: rgba(159, 176, 212, 0.205);
  text-align: center;
  padding: 20px 0;
  border: 1px solid #fff;
}

#listen-img-unselect {
  background-image: url("../img/listen.png");
  background-size: 100% 100%;
}
.listen-img-select {
  background-image: url("../img/listen.png");
  background-size: 100% 100%;
  background-color: #ff8800;
}

#talk-img-unselect {
  background-image: url("../img/talk.png");
  background-size: 100% 100%;
}
.talk-img-select {
  background-image: url("../img/talk.png");
  background-size: 100% 100%;
  background-color: #ff8800;
}

.container {
  max-height: 100%;
  max-width: 750px;
  margin-top: 3vh;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin: center;
  background-color: white;
}


#listner-name,
#talker-name {
  margin-top: -1.3vw;
  font-size: 3vw;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

.btn-push {
  color: #fff;
  background-color: #ff8800;
}

.btn {
  display: inline-block;
  border: none;
  color: #ff8800;
  background-color: rgba(240, 238, 238, 0.61);
  box-shadow   : 0.2vw 0.2vw 0.2vw #858585;
}
.btn:hover {
  color: #fff;
  background-color: #ff8800;
}
.btn:active {
  box-shadow   : 0.1vw 0.1vw 0.1vw #858585;
}
</style>
