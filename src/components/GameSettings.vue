<template>
  <div class="game-settings">
    <div>
      <label htmlFor="numRows">Rows: </label>
      <input class="input" id="numRows" v-model.number="numRows" type="number" min="5" />
    </div>
    <div>
      <label htmlFor="numColumns">Columns: </label>
      <input class="input" id="numColumns" v-model.number="numColumns" type="number" min="5" />
    </div>
    <div>
      <label htmlFor="numMines">Mines: </label>
      <input class="input" id="numMines" v-model.number="numMines" type="number" min="5" />
    </div>
    <button class="new-game button" @click="$emit('newGameClicked', numRows, numColumns, numMines)" >New Game</button>
  </div>
</template>

<script>
export default {
  name: "GameSettings",
  props: ["initialNumRows", "initialNumColumns", "initialNumMines"],
  data() {
    return {
      numRows: this.initialNumRows,
      numColumns: this.initialNumColumns,
      numMines: this.initialNumMines
    };
  },
  methods:{
    // newGameClicked(){
    //   console.log(`new game with size ${this.numRows} by ${this.numColumns} and ${this.numMines} mines`)
    // }
  },
  created()
  {
    
  }
};
// if( numRows < 4 )numRows = 4;
</script>

<style lang="scss">
@import "node_modules/bulma/sass/utilities/_all";
@import "node_modules/bulma/sass/elements/button.sass";


.invalid {
  background-color: red;
}
</style>
