// Assuming all functions like `scoreCardsInPlayArea` and `PlayArea` class already exist
import { Game } from "./game_logic2.js";
import { Player } from "./players.js";
import { PlayArea } from "./play_area.js";

// Function to create a horizontal line of cards from rank 1 to 6 of the same suit
function setupTestPlayArea(player) {
  const suit = "Olive";
  const color = "Green"; // Example color for Olive

  // Place cards from rank 1 to 6 in a horizontal line (x positions from 0 to 5, y = 0)
  for (let rank = 1; rank <= 6; rank++) {
    player.playArea.placeCard(
      { suit: suit, rank: rank, color: color },
      rank - 1,
      0
    );
  }
}

// Run the test case
function testLongPathScoring() {
  const playerNames = ["Alice", "Victor"];
  const game = new Game(playerNames, false);
  const player = game.players[0];

  // Set up the play area with a horizontal line of Olive cards (ranks 1 to 6)
  setupTestPlayArea(player);

  // Run the scoring algorithm for the suit 'Olive'
  const maxScore = game.scoreCardsInPlayArea(player, "Olive");

  console.log("Max score for Olive path:", maxScore);

  // View the play area to visually confirm the cards are placed correctly
  player.playArea.viewGrid();
}

// Call the test
testLongPathScoring();
