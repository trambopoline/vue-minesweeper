<template>
	<div id="board" :class="[{active: !gameWon && !gameLost}, 'has-text-centered']">
		<!-- <h1>{{statusMessage}}</h1> -->
		<p>Flags: {{numMines - numFlags}}</p>
		<!-- <div v-for="" -->
		<div class="board-row" v-for="row in cells" :key="row[0].rowIndex+row[0].columnIndex">
			<button v-for="cell in row" :key="cell.columnIndex" v-if="cell.value != null" :class="[cell.flagState, cell.revealed ? 'revealed' :'', cell === safestCell ? 'safest' : '', 'cell']"
  @click='handlePrimaryCellClick(cell)' @contextmenu.prevent="handleFlagToggle(cell)" :title="cell === safestCell ? 'This is a safe cell to click!' : ''">
				<!-- <span v-if="!cell.revealed">{{cell.value}}</span> -->
				<span v-if="cell.revealed && cell.value != 0">{{cell.value}}</span>
			</button>
		</div>
	</div>
</template>

<script>
import { Globals } from "../globals.js";

export default {
	name: "Board",
	props: ["initialNumRows", "initialNumColumns", "initialNumMines"],
	data() {
		return {
			numRows: this.initialNumRows,
			numColumns: this.initialNumColumns,
			numMines: this.initialNumMines,
			numFlags: 0,
			cells: [],
			gameWon: false,
			gameLost: false,
			statusMessage: "I believe in you!",
			totalCellsRevealed: 0,
			safestCell: {}
		};
	},
	//   components: { Cell },
	methods: {
		getCellClasses(cell) {
			return `${
				cell.revealed
					? cell.value === Globals.MINE_VALUE
						? "revealed mine "
						: "revealed "
					: cell.flagState + " "
			}cell`;
		},
		handleMineClick() {
			console.log("Mine clicked!");
		},
		handlePrimaryCellClick(currentCell) {
			let rowIndex = currentCell.rowIndex;
			let columnIndex = currentCell.columnIndex;
			let cells = this.cells;
			console.log(" --- Board Handling Primary Click --- ");

			//   Don't take action if the game is over; if a null or already revealed cell is clicked; or if the cell is flagged
			if (
				this.gameWon ||
				this.gameLost ||
				currentCell.value === null ||
				currentCell.flagState !== Globals.BLANK ||
				currentCell.revealed === true
			) {
				console.log("Click denied");

				return;
			}
			if (currentCell.value === Globals.MINE_VALUE) {
				// Globals.$emit("mineClick");

				currentCell.revealed = true;
				this.totalCellsRevealed++;
				this.statusMessage = "Oh no you actually did bad and lost!";
				this.gameLost = true;
				return;
			}

			//If we get down here, the cell must contain a number value, and we can simply make it visible
			currentCell.revealed = true;
			this.totalCellsRevealed++;

			//Handle revealing of multiple cells ( adjacent 0-values )
			if (currentCell.value === 0) {
				let cellsToProcess = [];

				// Get this started by adding the current location to the set
				cellsToProcess.push(currentCell);
				let index = 1;
				while (cellsToProcess.length !== 0) {
					console.log(`---------- Pass #${index++} ------------`);

					let cellToProcess = cellsToProcess.pop();
					// console.log(cells[rowIndex][columnIndex])
					cellToProcess.processed = true;

					const rowIndex = cellToProcess.rowIndex;
					const columnIndex = cellToProcess.columnIndex;

					const adjacentCells = [
						currentCell, //The current cell
						cells[rowIndex - 1][columnIndex - 1], //topLeft
						cells[rowIndex - 1][columnIndex], //top
						cells[rowIndex - 1][columnIndex + 1], //topRight
						cells[rowIndex][columnIndex + 1], //right
						cells[rowIndex + 1][columnIndex + 1], //bottomRight
						cells[rowIndex + 1][columnIndex], //bottom
						cells[rowIndex + 1][columnIndex - 1], //bottomLeft
						cells[rowIndex][columnIndex - 1] //left
					];
					// console.log(adjacentCells);
					for (let adjacentCell of adjacentCells) {
						if (adjacentCell.value === null) continue;
						if (adjacentCell.revealed === false) {
							adjacentCell.revealed = true;
							this.totalCellsRevealed++;

							//If the cell is flagged and is '0', unflag it
							if (adjacentCell.flagState === Globals.FLAGGED) {
								adjacentCell.flagState = Globals.BLANK;
								this.numFlags--;
							}
							if (adjacentCell.flagState === Globals.UNSURE) {
								adjacentCell.flagState = Globals.BLANK;
							}
							//   this.numFlags--;
							//   console.log("adjacent cell: ", adjacentCell);
						}
						if (
							adjacentCell.value === 0 &&
							adjacentCell.processed === false
						) {
							cellsToProcess.push(adjacentCell);
						}
					}
				}
			}

			// See if we've won
			if (
				this.totalCellsRevealed >=
					this.numRows * this.numColumns - this.numMines &&
				this.gameLost !== true
			) {
				this.gameWon = true;
				this.statusMessage = "YAY YOU WON I ALWAYS BELIEVED IN YOU";
			}
		},
		handleFlagToggle(cell) {
			if (cell.revealed === true) return;

			if (cell.flagState === Globals.BLANK) {
				cell.flagState = Globals.FLAGGED;
				this.numFlags++;
			} else if (cell.flagState === Globals.FLAGGED) {
				this.numFlags--;
				cell.flagState = Globals.UNSURE;
			} else cell.flagState = Globals.BLANK;
			//   this.$set(this.cells[cell.rowIndex], cell.columnIndex, cell);
		}
	},
	created: function() {
		let cells;
		const cellStartState = {
			revealed: false,
			processed: false,
			flagState: Globals.BLANK,
			value: null
		};

		// Creating a matrix of cells with an extra margin around the edges to prevent index-out-of-bounds exceptions
		cells = generateMatrix(
			this.initialNumRows + 2,
			this.initialNumColumns + 2,
			cellStartState
		);

		// console.log(this.initialNumRows, this.initialNumColumns, this.cells);
		for (let rowIndex = 1; rowIndex < this.numRows + 1; rowIndex++) {
			for (
				let columnIndex = 1;
				columnIndex < this.numColumns + 1;
				columnIndex++
			) {
				let currentCell = cells[rowIndex][columnIndex];
				currentCell.value = 0;
				currentCell.rowIndex = rowIndex;
				currentCell.columnIndex = columnIndex;
			}
		}

		// Populate the cells with mines, and increment adjacent values
		for (let i = 0; i < this.numMines; i++) {
			let mineRowIndex = generateRandomNumberInRange(1, this.numRows),
				mineColumnIndex = generateRandomNumberInRange(
					1,
					this.numColumns
				);

			//Ensure we don't put mines on mines
			while (
				cells[mineRowIndex][mineColumnIndex].value ===
				Globals.MINE_VALUE
			) {
				mineRowIndex = generateRandomNumberInRange(1, this.numRows);
				mineColumnIndex = generateRandomNumberInRange(
					1,
					this.numColumns
				);
			}

			cells[mineRowIndex][mineColumnIndex].value = Globals.MINE_VALUE; // Place mines

			const adjacentCells = [
				cells[mineRowIndex][mineColumnIndex], //The current cell
				cells[mineRowIndex - 1][mineColumnIndex - 1], //topLeft
				cells[mineRowIndex - 1][mineColumnIndex], //top
				cells[mineRowIndex - 1][mineColumnIndex + 1], //topRight
				cells[mineRowIndex][mineColumnIndex + 1], //right
				cells[mineRowIndex + 1][mineColumnIndex + 1], //bottomRight
				cells[mineRowIndex + 1][mineColumnIndex], //bottom
				cells[mineRowIndex + 1][mineColumnIndex - 1], //bottomLeft
				cells[mineRowIndex][mineColumnIndex - 1] //left
			];

			// console.log( `Mine at row ${rowLocation}, column ${columnIndex}` );
			for (let adjacentCell of adjacentCells) {
				if (
					adjacentCell.value !== Globals.MINE_VALUE &&
					adjacentCell.value !== null
				) {
					adjacentCell.value++;
				}
			}
		}

		//Determine the largest cleared area for the player to first click on
		let safestCell;
    let largestSafeArea = 0;

		/* TODO: Come up with a way to check for the safest starting point without iterating over ALL the cells */
		for (let row of cells) {
			// console.log("Handling row: ", row);

			for (let currentCell of row) {
				// console.log("Handling cell: ", currentCell);

				if (currentCell.value === 0) {
					if (currentCell.processed) continue;
					let cellsToProcess = [];

					// Get this started by adding the current location to the set
					cellsToProcess.push(currentCell);
					let index = 1;
					while (cellsToProcess.length !== 0) {

						// console.log(`---------- Pass #${index} ------------`);

						let cellToProcess = cellsToProcess.pop();
						// console.log(cells[rowIndex][columnIndex])
						cellToProcess.processed = true;

            if( cellToProcess.value === 0 ) index++;

						const rowIndex = cellToProcess.rowIndex;
						const columnIndex = cellToProcess.columnIndex;

						const adjacentCells = [
							currentCell, //The current cell
							cells[rowIndex - 1][columnIndex - 1], //topLeft
							cells[rowIndex - 1][columnIndex], //top
							cells[rowIndex - 1][columnIndex + 1], //topRight
							cells[rowIndex][columnIndex + 1], //right
							cells[rowIndex + 1][columnIndex + 1], //bottomRight
							cells[rowIndex + 1][columnIndex], //bottom
							cells[rowIndex + 1][columnIndex - 1], //bottomLeft
							cells[rowIndex][columnIndex - 1] //left
						];
						// console.log(adjacentCells);
						for (let adjacentCell of adjacentCells) {
							if (adjacentCell.value === null) continue;
							if (
								adjacentCell.value === 0 &&
								adjacentCell.processed === false
							) {
								cellsToProcess.push(adjacentCell);
							}
						}
					}

					if (largestSafeArea < index) {
						console.log("New safest cell found!");
						largestSafeArea = index;
						safestCell = currentCell;
					}
				}
			}
		}
		console.log(
			"Safest cell found at ",
			safestCell.rowIndex,
			safestCell.columnIndex
		);
		//Now reset all the 'processed' cells
		cells.map((row, rowIndex, array) => {
			row.map((cell, columnIndex) => (cell.processed = false));
		});
		this.cells = cells;
    this.safestCell = safestCell;

		function generateMatrix(numrows, numcols, initial) {
			let arr = [];
			for (let i = 0; i < numrows; ++i) {
				let columns = [];
				for (let j = 0; j < numcols; ++j) {
					columns[j] = Object.assign({}, initial);
					columns[j].rowIndex = i;
					columns[j].columnIndex = j;
					// console.log(columns[j].position);
				}
				arr[i] = columns;
			}
			return arr;
		}

		function generateRandomNumberInRange(min, max) {
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
	}
};
</script>

<style lang="scss">
$color_1: #79d995;
// $color_2: #bdbdbd;
$color_2: #79a4d9;
$color_3: #3e606f;

$color_basefont: #3c3c3c;
.board-row {
	display: flex;
}
body {
	margin: 0;
	padding: 0;
	font-family: sans-serif;
	color: $color_basefont;

	background: linear-gradient(123deg, #79d995, #79a4d9, #7cf2ff);
	background-size: 600% 600%;
	animation: GradientAnimation 180s ease-in-out infinite;

	@keyframes GradientAnimation {
		0% {
			background-position: 0% 53%;
			// filter:hue-rotate(0deg)
		}
		50% {
			background-position: 100% 48%;
			// filter:hue-rotate(100deg);
		}
		100% {
			background-position: 0% 53%;
			// filter:hue-rotate(0deg);
		}
	}
}
.cell {
	// flex: 1 1 1em;
	background: rgba(255, 255, 255, 0.6);
	padding: 0;
	// background: none;
	height: 2rem;
	width: 2rem;
	line-height: 2rem;
	border-radius: 2px;
	// flex: 1 1 auto;
	border: none;
	margin: 4px;
	font-size: 1.5rem;
	color: $color_basefont;
	// overflow: visible;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);

	transition: background 0.25s ease-in-out,
		box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

	&:focus {
		outline: none;
	}

	&.revealed {
		background: none;
		box-shadow: none;
	}

	&.unsure {
		background: #f8ed9b;
	}
	&.flagged {
		background: #ff9393;
	}

  &.safest:not(.revealed) {
    background:#79d995;
  }
}

.active .cell.blank:not(.revealed):hover {
	box-shadow: 0 14px 12px rgba(0, 0, 0, 0.25), 0 5px 10px rgba(0, 0, 0, 0.22);
}
</style>
