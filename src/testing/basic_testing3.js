// Import necessary classes from your project
import { Game } from "../game_logic.js";
import { Player } from "../../players.js";
import { PlayArea } from "../../play_area.js";

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

// Brute-force pathfinding function
function findPathStartingFromCard(startCard, playAreaGrid) {
  let possibleEnds = []; // To store cards that are valid end points
  let possiblePaths = []; // To store all possible paths

  // Step 1: Find all possible end cards in the play area that match the suit and have a higher rank
  for (let positionKey in playAreaGrid) {
    let card = playAreaGrid[positionKey];
    if (card.suit === startCard.suit && card.rank > startCard.rank) {
      possibleEnds.push(card);
    }
  }

  // Step 2: For each card in possibleEnds, find all possible paths from the startCard
  for (let endCard of possibleEnds) {
    let pathsToEnd = findAllPaths(startCard, endCard, playAreaGrid);
    possiblePaths.push(...pathsToEnd);
  }

  // Step 3: Filter out illegal paths (paths where rank does not increase as you move)
  let legalPaths = possiblePaths.filter((path) => checkPathLegality(path));

  return legalPaths;
}

// Function to find all possible paths from startCard to endCard
// This function uses DFS (Depth-First Search) and returns all possible paths
function findAllPaths(startCard, endCard, playAreaGrid) {
  const directions = [
    [1, 0], // Right
    [-1, 0], // Left
    [0, 1], // Up
    [0, -1], // Down
  ];

  let allPaths = []; // Store all possible paths

  // Recursive function to explore paths
  function explore(currentCard, currentPath, visited) {
    // If we've reached the endCard, add the current path to allPaths
    if (currentCard === endCard) {
      allPaths.push([...currentPath]);
      return;
    }

    visited.add(currentCard); // Mark the current card as visited
    currentPath.push(currentCard); // Add the current card to the path

    // Explore all adjacent cards
    for (let [dx, dy] of directions) {
      const nextCard = getCardAt(
        currentCard.x + dx,
        currentCard.y + dy,
        playAreaGrid
      );
      if (nextCard && !visited.has(nextCard)) {
        explore(nextCard, [...currentPath], new Set(visited)); // Recursively explore the next card
      }
    }

    // Backtrack: remove the current card from the path and visited set
    currentPath.pop();
    visited.delete(currentCard);
  }

  // Start exploring from the startCard
  explore(startCard, [], new Set());

  return allPaths;
}

// Function to check if a path is legal
// A path is legal if each subsequent card has a higher rank than the previous one
function checkPathLegality(path) {
  for (let i = 0; i < path.length - 1; i++) {
    if (path[i + 1].rank <= path[i].rank) {
      return false; // Path is illegal if the rank doesn't strictly increase
    }
  }
  return true;
}

// Helper function to get the card at a specific position in the play area grid
function getCardAt(x, y, playAreaGrid) {
  const positionKey = `${x},${y}`;
  return playAreaGrid[positionKey] || null;
}

function scoreCardsInPlayArea(player, suit) {
  let paths = []; // A list to store valid paths in the player's play area for the given suit
  let maxPoints = 0; // To track the highest score for any path in the suit

  // Find all valid paths in the play area for the given suit
  for (let positionKey in player.playArea.grid) {
    let card = player.playArea.grid[positionKey]; // Access card via the grid
    if (card.suit === suit) {
      // Only evaluate paths that start with the correct suit
      let foundPaths = findPathStartingFromCard(card, player.playArea.grid); // Call findPathStartingFromCard
      if (foundPaths.length > 0) {
        paths.push(...foundPaths); // Add all found paths to the paths list
      }
    }
  }

  // Score each path and retain the highest score
  for (let path of paths) {
    let pathLength = path.length;
    let sameColor = checkIfAllSameColor(path); // Check if all cards in the path are the same color
    let startCard = path[0];
    let endCard = path[path.length - 1];

    // Calculate score for this path
    let pathPoints = 0;

    // A) 1 point per card in the path
    pathPoints += pathLength;

    // B) If the path has at least 4 cards and all are the same color, add 1 point per card
    if (pathLength >= 4 && sameColor) {
      pathPoints += pathLength;
    }

    // C) Add 1 additional point if the path starts with a 1
    if (startCard.rank === 1) {
      pathPoints += 1;
    }

    // D) Add 2 additional points if the path ends with an 8
    if (endCard.rank === 8) {
      pathPoints += 2;
    }

    // Update maxPoints if this path has the highest score
    if (pathPoints > maxPoints) {
      maxPoints = pathPoints;
    }
  }

  return maxPoints; // Return the highest score for the best path
}

// Run the test case
function testLongPathScoring() {
  // Step 1: Instantiate the game and player
  const playerNames = ["Alice", "Brux"]; // Create one player for the test
  const game = new Game(playerNames); // Create a new game instance
  const player = game.players[0]; // Get the player object from the game

  // Step 2: Set up the play area with a horizontal line of Olive cards (ranks 1 to 6)
  setupTestPlayArea(player);

  // Step 3: Run the scoring algorithm for the suit 'Olive'
  const maxScore = scoreCardsInPlayArea(player, "Olive");

  console.log("Max score for Olive path:", maxScore);

  // Step 4: View the play area to visually confirm the cards are placed correctly
  player.playArea.viewGrid();
}

// Call the test
testLongPathScoring();
