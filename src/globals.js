import Vue from 'vue';
export let Globals = new Vue();

let extend = {
	MINE_VALUE: "💣",
	FLAGGED: "flagged",
	BLANK: "blank",
	UNSURE: "unsure"
	
};

Object.assign(Globals, extend);
