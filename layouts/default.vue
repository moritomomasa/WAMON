<template>
  <div class="container">
    <Nuxt />
  </div>
</template>

<style>
html {
  font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  color: #2E495E;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

.container {
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.button--grey-talk {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #ffffff;
  color: #ffa500;
  text-decoration: none;
  padding: 10px 30px;
}
.button--grey-talk:hover {
  color: #fff;
  background-color: #ffa500;
}

.button--grey-listen {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #ffffff;
  color: #ffa500;
  text-decoration: none;
  padding: 10px 30px;
}
.button--grey-listen:hover {
  color: #fff;
  background-color: #ffa500;
}
.button--grey-push {
  color: #fff;
  background-color: #ffa500;
  padding: 10px 30px;
}
.button {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #ffffff;
  color: #ffa500;
  text-decoration: none;
  padding: 10px 30px;
}
.button:hover {
  color: #fff;
  background-color: #ffa500;
}
</style>
