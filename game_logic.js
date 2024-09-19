import { Deck } from "./piles_of_cards.js";
import { Player } from "./players.js";

class Game {
  constructor(playerNames) {
    this.players = playerNames.map((name) => new Player(name)); // Create players
    this.deck = new Deck(playerNames.length); // Initialize the deck
    this.turnOrder = []; // Holds the order of turns
    this.currentPlayerIndex = 0; // Track whose turn it is
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

  // Method to draw two cards (from deck or discard piles)
  drawTwoCards(player) {
    let cardsDrawn = 0;
    while (cardsDrawn < 2) {
      // Simulating user input - you can modify this to take user input
      const source = Math.random() > 0.5 ? "deck" : "discard"; // Random for now

      if (source === "deck") {
        player.drawCard(this.deck);
        cardsDrawn++;
      } else {
        // Simulate drawing from a discard pile (could implement logic for specific discard piles)
        const discardPile = this.chooseDiscardPile();
        if (discardPile.cards.length > 0) {
          const card = discardPile.drawCard();
          console.log(`${player.name} drew a card from a discard pile:`, card);
          player.hand.push(card);
          cardsDrawn++;
        } else {
          console.log("Discard pile is empty. Cannot draw from here.");
        }
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
    while (true) {
      // This is an infinite loop for simplicity, can be ended with a game over condition
      this.takeTurn();
    }
  }
}

export { Game };
