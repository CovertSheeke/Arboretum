import { Deck } from "./piles_of_cards.js";
import { Player } from "./players.js";

class Game {
  constructor(playerNames, verbose = true) {
    this.players = playerNames.map((name) => new Player(name)); // Create players
    this.deck = new Deck(playerNames.length); // Initialize the deck
    this.turnOrder = []; // Holds the order of turns
    this.currentPlayerIndex = 0; // Track whose turn it is
    this.gameOver = false; // Check if the game is over
    this.verbose = verbose; // Set to false to hide logs
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
    let bestPath = null; // To store the best path found

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

      // Check if this is the best path
      if (pathPoints > maxPoints) {
        maxPoints = pathPoints;
        bestPath = path; // Track the best path
      }
    }

    // Highlight and display the best path
    if (bestPath) {
      console.log(`Best path found with score ${maxPoints}:`);
      this.highlightAndShowPath(bestPath, player.playArea);
    }

    // Update the player's score
    player.score += maxPoints;
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

  // Brute-force pathfinding function with verbosity
  findPathStartingFromCard(startCard, playArea) {
    let possibleEnds = []; // To store cards that are valid end points
    let possiblePaths = []; // To store all possible paths
    let playAreaGrid = playArea.grid;
    if (this.verbose) {
      console.log(
        `Finding paths starting from (${startCard.x}, ${startCard.y})`
      );
    }
    // Step 1: Find all possible end cards in the play area that match the suit and have a higher rank
    for (let positionKey in playAreaGrid) {
      if (this.verbose) {
        console.log(`Checking position: ${positionKey}`);
      }
      let card = playAreaGrid[positionKey];
      if (card.suit === startCard.suit && card.rank > startCard.rank) {
        possibleEnds.push(card);
        if (this.verbose) {
          console.log(
            `Found possible end card at (${card.x}, ${card.y}) with rank ${card.rank}.`
          );
        }
      }
    }

    if (this.verbose) {
      console.log(`Total possible end cards: ${possibleEnds.length}`);
    }

    // Step 2: For each card in possibleEnds, find all possible paths from the startCard
    for (let endCard of possibleEnds) {
      let pathsToEnd = this.findAllPaths(startCard, endCard, playAreaGrid);
      possiblePaths.push(...pathsToEnd);
    }

    if (this.verbose) {
      console.log(`Total possible paths found: ${possiblePaths.length}`);
    }

    // Step 3: Filter out illegal paths (paths where rank does not increase as you move)
    let legalPaths = possiblePaths.filter((path) =>
      this.checkPathLegality(path)
    );

    if (this.verbose) {
      console.log(`Total legal paths: ${legalPaths.length}`);
    }

    return legalPaths;
  }

  // Function to find all possible paths from startCard to endCard (with verbosity)
  findAllPaths(startCard, endCard, playAreaGrid) {
    const directions = [
      [1, 0], // Right
      [-1, 0], // Left
      [0, 1], // Up
      [0, -1], // Down
    ];

    let allPaths = []; // Store all possible paths

    // Recursive function to explore paths
    const explore = (currentCard, currentPath, visited) => {
      // If we've reached the endCard, add the current path to allPaths
      if (currentCard === endCard) {
        currentPath.push(currentCard);
        allPaths.push([...currentPath]);
        if (this.verbose) {
          console.log(
            `Found path to end card at (${endCard.x}, ${endCard.y}). Path length: ${currentPath.length}`
          );
        }
        return;
      }

      visited.add(currentCard); // Mark the current card as visited
      currentPath.push(currentCard); // Add the current card to the path

      // Explore all adjacent cards
      for (let [dx, dy] of directions) {
        const nextCard = this.getCardAt(
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
    };

    // Start exploring from the startCard
    explore(startCard, [], new Set());

    return allPaths;
  }

  // Function to check if a path is legal (with verbosity)
  checkPathLegality(path) {
    for (let i = 0; i < path.length - 1; i++) {
      if (path[i + 1].rank <= path[i].rank) {
        if (this.verbose) {
          console.log(
            `Path is illegal: card at (${path[i].x}, ${path[i].y}) has rank ${
              path[i].rank
            }, next card has rank ${path[i + 1].rank}`
          );
        }
        return false; // Path is illegal if the rank doesn't strictly increase
      }
    }
    if (this.verbose) {
      console.log(`Path is legal: Length = ${path.length}`);
    }
    return true;
  }

  // Helper function to get the card at a specific position in the play area grid (with verbosity)
  getCardAt(x, y, playAreaGrid) {
    const positionKey = `${x},${y}`;
    const card = playAreaGrid[positionKey] || null;
    if (this.verbose && card) {
      console.log(`Card found at (${x}, ${y}) with rank ${card.rank}.`);
    }
    return card;
  }

  // Recursive helper function to explore valid paths using DFS (with verbosity)
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

            if (this.verbose) {
              console.log(
                `Valid path found: ${newPath
                  .map((c) => `(${c.x}, ${c.y})`)
                  .join(" -> ")}`
              );
            }
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
