<template>
	<button v-if="value != null" :class="[flagState, revealed]" @click="handlePrimaryClick" @contextmenu.prevent="handleSecondaryClick">
		<!-- {{revealed}} -->
		<span v-if="!revealed">{{value}}</span>
	</button>
</template>

<script>
import { Globals } from "../globals.js";

export default {
	name: "Cell",
	props: [
		"initialRevealed",
		"initialProcessed",
		"initialFlagState",
		"value",
		"rowIndex",
		"columnIndex"
	],
	// props: ["cell"],
	data() {
		return {
			//   cellContents: this.cell,
			revealed: this.initialRevealed,
			processed: this.initialProcessed,
			flagState: this.initialFlagState
			// value: this.value,
			// rowIndex: this.rowIndex,
			// columnIndex: this.columnIndex
		};
	},
	methods: {
		handlePrimaryClick() {
			console.log(" --- Cell handling primary click --- ");

			//   Don't take action if the game is over; if a null or already revealed cell is clicked; or if the cell is flagged
			if (
				// this.state.gameWon ||
				// this.state.gameLost ||
				this.value === null ||
				this.flagState !== Globals.BLANK ||
				this.revealed === true
			) {
				console.log("Click denied");

				return;
			}
			// If the value is 0, then send this event up the chain
			if (this.value === 0) {
				console.log("Cell with value of '0' clicked, passing logic upward");
				Globals.$emit("primaryCellClick", this);
				return;
			}
			if (this.value === Globals.MINE_VALUE) {
				Globals.$emit("mineClick");
				this.revealed = true;
				return;
			}
			//If we get down here, the cell must contain a number value, and we can simply make it visible
			this.revealed = true;
		},

		handleSecondaryClick() {
			Globals.$emit("flagToggle", this);
		}
	},
	created: function() {}
};
</script>

<style scoped>
button {
	height: 2rem;
	width: 2rem;
	line-height: 2rem;
	/* border-radius: 2px; */
	border: solid 1px gray;
}

.flagged {
	background-color: red;
}

.unsure {
	background-color: yellow;
}
</style>
