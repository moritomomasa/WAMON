<template>
  <ul class="col3">
    <li id="listen-img-unselect"></li>
    <li class="container"><Nuxt /></li>
    <li id="talk-img-unselect"></li>
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
  background: rgb(228, 228, 228);
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
  background-color: darkorange;
}

#talk-img-unselect {
  background-image: url("../img/talk.png");
  background-size: 100% 100%;
}
.talk-img-select {
  background-image: url("../img/talk.png");
  background-size: 100% 100%;
  background-color: darkorange;
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

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

.button-talk {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #ffffff;
  text-decoration: none;
}
.button-talk:hover {
  color: #fff;
  background-color: #ffa500;
}

.button-listen {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #ffffff;
  text-decoration: none;
}
.button-listen:hover {
  color: #fff;
  background-color: #ffa500;
}
.button-push {
  color: #fff;
  background-color: #ffa500;

}
.button {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #ffffff;
  color: #ffa500;
  text-decoration: none;
}
.button:hover {
  color: #fff;
  background-color: #ffa500;
}
</style>
