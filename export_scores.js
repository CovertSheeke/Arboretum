import { Game } from "./game_logic2.js"; // Import the Game class
import fs from "fs";

// Function to run multiple games
function runMultipleGames(playerNames, numberOfGames) {
  const allScores = []; // Store the scores for each game

  for (let i = 0; i < numberOfGames; i++) {
    const game = new Game(playerNames, false); // Initialize a new game for each run
    const scores = game.startGame(); // Start the game and get final scores
    allScores.push(scores); // Store the scores
  }

  return allScores; // Return all the scores after all games
}

// Run 100 games with 3 players and export scores to a JSON file
const playerNames = ["Alice", "Bob", "Charlie"];
const numberOfGames = 100;
const allScores = runMultipleGames(playerNames, numberOfGames);

// Export the scores to a JSON file
fs.writeFileSync("scores.json", JSON.stringify(allScores, null, 2));

console.log("Scores saved to scores.json.");
