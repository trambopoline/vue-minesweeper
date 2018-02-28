<template>
  <div class="section" id="app">
    <!-- <GameSettings :initialNumRows="10" :initialNumColumns="10" :initialNumMines="15" :maxSize="100" @newGameClicked="(numRows, numColumns, numMines )=>handleNewGameClicked(numRows, numColumns, numMines)"/> -->
    <Board  :initialNumRows="10" :initialNumColumns="10" :initialNumMines="15"/>
    <footer class="footer">
      </footer>
  </div>
</template>

<script>
import GameSettings from "./components/GameSettings";
import Board from "./components/Board";

export default {
  name: "App",
  components: {
    GameSettings, Board
  },
  methods:{
    handleNewGameClicked(numRows, numColumns, numMines )
    {
      console.log( numRows, numColumns, numMines)
    }
  }
};
</script>

<style lang="scss">
$footer-background-color: none;
html, body{
display: flex;
    height: 100%;
    width: 100%;
    align-items: center;
    justify-content: center;}
/* #app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
@import "node_modules/bulma/bulma.sass";
</style>
