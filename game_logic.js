import { Deck } from "./piles_of_cards.js";
import { Player } from "./players.js";

class Game {
  constructor(playerNames) {
    this.players = playerNames.map((name) => new Player(name)); // Create players
    this.deck = new Deck(playerNames.length); // Initialize the deck
    this.turnOrder = []; // Holds the order of turns
    this.currentPlayerIndex = 0; // Track whose turn it is
    this.gameOver = false; // Check if the game is over
  }

  // Initialize the game
  setupGame() {
    console.log("Setting up the game...");

    // Each player draws 7 cards from the deck
    this.players.forEach((player) => {
      for (let i = 0; i < 7; i++) {
        player.drawCard(this.deck);
      }
    });

    // Randomize turn order
    this.turnOrder = this.shuffle([...this.players]);

    console.log("Players have drawn their cards. The turn order is:");
    this.turnOrder.forEach((player, index) => {
      console.log(`${index + 1}: ${player.name}`);
    });
  }

  // Shuffle an array (used to randomize turn order)
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Get the current player
  getCurrentPlayer() {
    return this.turnOrder[this.currentPlayerIndex];
  }

  // Progress to the next player's turn
  nextTurn() {
    this.currentPlayerIndex =
      (this.currentPlayerIndex + 1) % this.players.length;
  }

  // Handle a player's turn
  takeTurn() {
    const player = this.getCurrentPlayer();
    console.log(`It is now ${player.name}'s turn.`);

    // Step 1: Player draws two cards (either from the deck, discard piles, or a combination)
    this.drawTwoCards(player);

    // Step 2: Player places one card
    this.placeCard(player);

    // Step 3: Player discards one card
    this.discardCard(player);

    // Proceed to the next player
    this.nextTurn();
  }

  drawTwoCards(player) {
    let cardsDrawn = 0;

    while (cardsDrawn < 2) {
      // Step 1: Determine what can be drawn from (deck or discard piles with cards)
      let availableSources = [];

      // Check if the deck has cards
      if (this.deck.cards.length > 0) {
        availableSources.push("deck");
      }

      // Collect all discard piles from players and filter out empty discard piles
      const discardPilesWithCards = this.players
        .map((p) => p.discardPile)
        .filter((pile) => pile.cards.length > 0);

      if (discardPilesWithCards.length > 0) {
        availableSources.push("discard");
      }

      // If no available sources, break the loop
      if (availableSources.length === 0) {
        console.log("No available cards to draw from deck or discard piles.");
        break;
      }

      // Step 2: Randomly choose an available source (deck or discard pile)
      const source =
        availableSources[Math.floor(Math.random() * availableSources.length)];

      if (source === "deck") {
        // Draw from the deck
        player.drawCard(this.deck);
        cardsDrawn++;
      } else if (source === "discard") {
        // Randomly choose a discard pile that has cards
        const discardPile =
          discardPilesWithCards[
            Math.floor(Math.random() * discardPilesWithCards.length)
          ];
        const card = discardPile.drawCard();
        console.log(`${player.name} drew a card from a discard pile:`, card);
        player.hand.push(card);
        cardsDrawn++;
      }
    }
  }

  // Simulate choosing a discard pile (this could be extended for specific pile logic)
  chooseDiscardPile() {
    // For now, we just return the current player's discard pile
    return this.getCurrentPlayer().discardPile;
  }

  // Method to place a card from the player's hand
  placeCard(player) {
    if (player.hand.length > 0) {
      // Choose the first card in hand for simplicity
      const cardIndex = 0;
      const legalPlacements = player.playArea.getLegalPlacements();

      // Choose a random legal placement for now (you can improve this by taking user input)
      const [x, y] =
        legalPlacements[Math.floor(Math.random() * legalPlacements.length)];
      player.placeCard(cardIndex, x, y);
    } else {
      console.log(`${player.name} has no cards to place.`);
    }
  }

  // Display each player's play area at the end of the game
  showPlayAreas() {
    console.log("Final Play Areas:");
    this.players.forEach((player) => {
      console.log(`${player.name}'s Play Area:`);
      player.playArea.viewGrid(); // Calls viewGrid method from PlayArea class
    });
  }

  showGameState() {
    console.log("Game State:");
    this.players.forEach((player) => {
      console.log(`${player.name}'s Hand:`, player.hand);
      player.playArea.viewGrid();
      console.log(`${player.name}'s Discard Pile:`, player.discardPile.cards);
    });
  }

  // Method to discard a card from the player's hand
  discardCard(player) {
    if (player.hand.length > 0) {
      // Choose the first card in hand to discard
      player.discardCard(0);
    } else {
      console.log(`${player.name} has no cards to discard.`);
    }
  }

  // Start the game and manage turns
  startGame() {
    this.setupGame(); // Setup the game

    // Run the game loop until the deck is empty
    while (!this.gameOver) {
      this.takeTurn();

      // Check if the deck is empty after each player's turn
      if (this.deck.cards.length === 0) {
        console.log("The deck is empty. The game is over.");
        this.gameOver = true;
      } else {
        // Proceed to the next player's turn
        this.nextTurn();
      }
    }

    console.log("Game Over!");
    this.showGameState(); // Display the final state of the game
    this.scoreGame(); // Calculate and display the scores
    const finalScores = this.players.map((player) => player.score);
    return finalScores;
  }

  compareHands(players, deck) {
    const selectedSuits = deck.selectedSuits;

    if (!selectedSuits || selectedSuits.length === 0) {
      console.error("No suits selected for the game.");
      return;
    }

    console.log("Comparing hands...");
    console.log("Selected suits:", selectedSuits);

    // Loop through each suit in selectedSuits
    selectedSuits.forEach((suit) => {
      let maxRankValue = -Infinity;
      let highestRankPlayers = []; // To store players who have the highest cumulative rank for this suit

      // Object to track if any player holds an 8 or a 1 of the current suit
      let eightHolders = new Set();
      let oneHolders = new Set();

      // Track each player's cumulative rank for the current suit
      const playerRankTotals = players.map((player) => {
        let total = 0;
        player.hand.forEach((card) => {
          if (card.suit === suit.name) {
            // Track if a player has the 8 or the 1
            if (card.rank === 8) {
              eightHolders.add(player);
            }
            if (card.rank === 1) {
              oneHolders.add(player);
            }
            total += card.rank;
          }
        });
        return total;
      });

      // Adjust for the rule: if any player holds the 8 and another holds the 1 of the same suit,
      // the 8 is counted as 0 for players holding the 8
      players.forEach((player, index) => {
        if (eightHolders.has(player) && oneHolders.size > 0) {
          playerRankTotals[index] -= 8; // Subtract 8 since the 8 counts as 0
        }
      });

      // Find the highest cumulative rank for the current suit
      playerRankTotals.forEach((total, index) => {
        if (total > maxRankValue) {
          maxRankValue = total;
          highestRankPlayers = [players[index]]; // Reset and set the new highest player
        } else if (total === maxRankValue) {
          highestRankPlayers.push(players[index]); // Handle ties
        }
      });

      // Call scoreCardsInPlayArea for the player(s) who have the highest cumulative value
      highestRankPlayers.forEach((player) => {
        this.scoreCardsInPlayArea(player, suit.name);
      });
    });
  }

  // Function to score the play area for a specific player and suit
  scoreCardsInPlayArea(player, suit) {
    console.log(`Scoring ${player.name}'s play area for the suit ${suit}...`);
    let paths = []; // A list to store valid paths in the player's play area for the given suit
    let maxPoints = 0; // To track the highest score for any path in the suit

    // Find all valid paths in the play area for the given suit
    for (let positionKey in player.playArea.grid) {
      let card = player.playArea.grid[positionKey]; // Access card via the grid
      if (card.suit === suit) {
        // Only evaluate paths that start or end with the correct suit
        let foundPaths = this.findPathStartingFromCard(card, player.playArea); // Call findPathStartingFromCard
        if (foundPaths.length > 0) {
          paths.push(...foundPaths); // Add all found paths to the paths list
        }
      }
    }

    // Score each path and retain the highest score
    for (let path of paths) {
      let pathLength = path.length;
      let sameColor = this.checkIfAllSameColor(path); // Check if all cards in the path are the same color
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
    player.score += maxPoints; // Update the player's score
    return maxPoints; // Return the highest score for the best path
  }

  // Helper function to check if all cards in the path are the same color
  checkIfAllSameColor(path) {
    let firstColor = path[0].color; // Get the color of the first card
    for (let card of path) {
      if (card.color !== firstColor) {
        return false; // If any card has a different color, return false
      }
    }
    return true; // All cards have the same color
  }

  // Function to get all cards of the same suit from the play area grid
  getCardsOfSuit(suit, playAreaGrid) {
    return Object.values(playAreaGrid).filter((card) => card.suit === suit);
  }

  // Function to find valid paths starting from a given card
  findPathStartingFromCard(card, playArea) {
    // Step 1: Get all cards of the same suit as the starting card
    let playAreaGrid = playArea.grid;
    let sameSuitCards = this.getCardsOfSuit(card.suit, playAreaGrid);

    // Step 2: Sanity check - if only one card of this suit exists, no valid paths
    if (sameSuitCards.length <= 1) {
      return []; // No valid path can be formed with only one card
    }

    // Step 3: Initialize variables for tracking paths
    let paths = []; // A list to store valid paths

    // Step 4: Recursively build paths using DFS (Depth-First Search)
    let visited = new Set(); // To track visited cards and avoid loops
    let initialPath = [card]; // Start the path with the given card

    // Call the recursive path-building function
    this.explorePaths(card, initialPath, visited, paths, playArea);

    // Step 5: Return the list of valid paths found starting from the card
    return paths;
  }

  // Recursive helper function to explore valid paths using DFS
  explorePaths(currentCard, currentPath, visited, paths, playArea) {
    let playAreaGrid = playArea.grid;
    visited.add(currentCard); // Mark the current card as visited

    const directions = [
      [1, 0], // Right
      [-1, 0], // Left
      [0, 1], // Up
      [0, -1], // Down
    ];

    for (let direction of directions) {
      let adjacentCard = null;

      try {
        adjacentCard = this.getCardAt(
          currentCard.x + direction[0],
          currentCard.y + direction[1],
          playAreaGrid
        );
      } catch (error) {
        console.log(
          `Error accessing position: (${currentCard.x + direction[0]}, ${
            currentCard.y + direction[1]
          })`
        );
        continue; // If an error occurs, skip this direction
      }

      // Check if the adjacent card exists and hasn't been visited
      if (adjacentCard && !visited.has(adjacentCard)) {
        // Ensure that the adjacent card has a higher rank than the current card
        if (adjacentCard.rank > currentCard.rank) {
          // Add the adjacent card to the current path
          let newPath = [...currentPath, adjacentCard];

          // If the adjacent card has the same suit as the starting card, it's a valid ending card
          if (adjacentCard.suit === currentPath[0].suit) {
            paths.push(newPath); // Add this path to the list of valid paths

            // Highlight the current path and display it on the grid
            this.highlightAndShowPath(newPath, playArea);
          }

          // Recursively explore further from the adjacent card
          this.explorePaths(
            adjacentCard,
            newPath,
            visited,
            paths,
            playAreaGrid
          );
        }
      }
    }

    visited.delete(currentCard); // Unmark the card as visited when backtracking
  }

  // Helper function to get the card at a specific position in the play area
  getCardAt(x, y, playAreaGrid) {
    const positionKey = `${x},${y}`;
    return playAreaGrid[positionKey] || null;
  }

  // Function to highlight and show the path in the play area grid
  highlightAndShowPath(path, playArea) {
    console.log("Path found:");

    // Log the path as text in the console
    let pathDescription = path
      .map((card) => `(${card.rank} of ${card.suit} at ${card.x},${card.y})`)
      .join(" -> ");
    console.log("Path as text:", pathDescription);

    playArea.viewGrid(path); // Call viewGrid and pass the path to highlight it
  }

  // Function to declare the winner after scoring
  declareWinner(players) {
    let maxScore = -Infinity;
    let potentialWinners = [];

    // Step 1: Find the players with the highest score
    players.forEach((player) => {
      if (player.score > maxScore) {
        maxScore = player.score;
        potentialWinners = [player]; // Reset the potential winners list
      } else if (player.score === maxScore) {
        potentialWinners.push(player); // Add player to the list in case of a tie
      }
    });

    // Step 2: Handle tie by checking who has the most unique suits in their play area
    if (potentialWinners.length > 1) {
      let maxSuits = -Infinity;
      let finalWinners = [];

      potentialWinners.forEach((player) => {
        let uniqueSuits = this.getUniqueSuitsInPlayArea(player.playArea);
        if (uniqueSuits > maxSuits) {
          maxSuits = uniqueSuits;
          finalWinners = [player]; // Reset the final winners list
        } else if (uniqueSuits === maxSuits) {
          finalWinners.push(player); // Add player to the list in case of a tie
        }
      });

      // Step 3: If there's still a tie, declare a draw
      if (finalWinners.length > 1) {
        console.log("It's a tie!");
        finalWinners.forEach((winner) => {
          console.log(
            `Player ${winner.name} tied with a score of ${winner.score} and ${maxSuits} suits.`
          );
        });
      } else {
        console.log(
          `The winner is ${finalWinners[0].name} with a score of ${finalWinners[0].score} and ${maxSuits} suits.`
        );
      }
    } else {
      console.log(
        `The winner is ${potentialWinners[0].name} with a score of ${potentialWinners[0].score}.`
      );
    }
  }

  // Helper function to get the number of unique suits in a player's play area
  getUniqueSuitsInPlayArea(playArea) {
    let suits = new Set();
    for (let key in playArea.grid) {
      let card = playArea.grid[key];
      suits.add(card.suit); // Add the card's suit to the set
    }
    return suits.size; // The size of the set represents the number of unique suits
  }

  // Method to calculate scores at end of the game
  scoreGame() {
    // Calculate scores
    console.log("Calculating scores...");
    this.compareHands(this.players, this.deck);
    this.declareWinner(this.players);
  }
}

export { Game };
