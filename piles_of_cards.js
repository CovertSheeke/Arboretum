// Base class for a pile of cards
class PileOfCards {
  constructor() {
    this.cards = []; // Common card storage for any pile
  }

  // Common method to draw the top card
  drawCard() {
    if (this.cards.length > 0) {
      return this.cards.pop(); // Remove and return the top card
    } else {
      return "No cards left!";
    }
  }
}

// Subclass for the Deck (no addCard method here)
class Deck extends PileOfCards {
  constructor(numPlayers) {
    super(); // Call the parent class constructor
    this.suitsInfo = [
      { name: "Cassia", color: "Yellow" },
      { name: "Cherry Blossom", color: "Pink" },
      { name: "Dogwood", color: "White" },
      { name: "Maple", color: "Orange" },
      { name: "Jacaranda", color: "Purple" },
      { name: "Royal Poinciana", color: "Red" },
      { name: "Olive", color: "Dark Grey" },
      { name: "Oak", color: "Brown" },
      { name: "Blue Spruce", color: "Blue" },
      { name: "Willow", color: "Dark Green" },
    ];
    this.ranks = [1, 2, 3, 4, 5, 6, 7, 8]; // Ranks from 1 to 8
    this.numPlayers = numPlayers; // Number of players
    this.cards = this.generateDeck(); // Generate and shuffle the deck
  }

  // Deck-specific shuffle method
  shuffle(cards) {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  }

  // Method to generate the deck of cards based on player count
  generateDeck() {
    // let selectedSuits;

    // Select suits based on the number of players
    if (this.numPlayers === 2) {
      this.selectedSuits = this.shuffle(this.suitsInfo).slice(0, 6); // 6 suits for 2 players
    } else if (this.numPlayers === 3) {
      this.selectedSuits = this.shuffle(this.suitsInfo).slice(0, 8); // 8 suits for 3 players
    } else if (this.numPlayers === 4) {
      this.selectedSuits = this.suitsInfo; // All 10 suits for 4 players
    } else {
      throw new Error("Game can only be played with 2, 3, or 4 players");
    }

    // Create the deck by combining all ranks with the selected suits
    let deck = [];
    for (let suit of this.selectedSuits) {
      for (let rank of this.ranks) {
        deck.push({ rank: rank, suit: suit.name, color: suit.color });
      }
    }

    // Shuffle the deck before returning
    return this.shuffle(deck);
  }
}

// Subclass for the Discard Pile (has addCard method)
class DiscardPile extends PileOfCards {
  constructor() {
    super(); // Call the parent class constructor
  }

  // Method to add a card to the top of the discard pile
  addCard(card) {
    this.cards.push(card); // Adds a card to the top of the discard pile
  }

  // Example: Add a method to view the top card without drawing it
  viewTopCard() {
    return this.cards.length > 0
      ? this.cards[this.cards.length - 1]
      : "No cards in discard pile";
  }
}

export { DiscardPile };
export { Deck };
