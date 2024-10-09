import { Game } from "./game_logic2.js";
import { Player } from "./players.js";
import { PlayArea } from "./play_area.js";

const playerNames = ["Alice", "Victor"];
const game = new Game(playerNames, false);
const [scores, snapshots, actions] = game.startGame();
console.log("Results");
console.log("Final scores:", scores);

console.log("Snapshots:", snapshots);
// console.log(JSON.stringify(snapshots[0], null, 2));
console.log(JSON.stringify(actions[1], null, 2));
