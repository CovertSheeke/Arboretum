// player.js
import { DiscardPile } from "./piles_of_cards.js"; // Importing DiscardPile from the external file
import { PlayArea } from "./play_area.js";

class Player {
  constructor(name) {
    this.name = name;
    this.discardPile = new DiscardPile(); // Each player has their own discard pile
    this.hand = []; // Player's hand (a list of cards)
    this.playArea = new PlayArea(); // Placeholder for the play area
    this.score = 0; // Player's score (starts at 0)
  }

  // Method to draw a card from a deck and add it to the player's hand
  drawCard(pile) {
    const card = pile.drawCard(); // Draw a card from the deck
    if (card !== "No cards left!") {
      this.hand.push(card); // Add the card to the player's hand
      console.log(`${this.name} drew a card:`, card);
    } else {
      console.log(`${this.name} tried to draw a card, but the deck is empty.`);
    }
  }

  discardCard(cardIndex) {
    if (cardIndex >= 0 && cardIndex < this.hand.length) {
      const discardedCard = this.hand.splice(cardIndex, 1)[0]; // Remove the card from hand
      this.discardPile.addCard(discardedCard); // Add the card to the discard pile
      console.log(`${this.name} discarded a card:`, discardedCard);
    } else {
      console.log(
        `${this.name} tried to discard a card, but the index is invalid.`
      );
    }
  }

  // Method to place a card from the hand into the play area at specific coordinates
  placeCard(cardIndex, x, y) {
    if (cardIndex >= 0 && cardIndex < this.hand.length) {
      const card = this.hand[cardIndex]; // Get the card from the player's hand

      // Get the legal placements from the play area
      const legalPlacements = this.playArea.getLegalPlacements();

      // Check if the provided coordinates are legal
      const isLegal = legalPlacements.some(([px, py]) => px === x && py === y);

      if (isLegal) {
        // Place the card in the play area
        this.playArea.placeCard(card, x, y);

        // Remove the card from the player's hand after placing it
        this.hand.splice(cardIndex, 1);

        console.log(`${this.name} placed the card at (${x}, ${y}):`, card);
      } else {
        console.log(`Invalid move: (${x}, ${y}) is not a legal placement.`);
      }
    } else {
      console.log(
        `${this.name} tried to place a card, but the index is invalid.`
      );
    }
  }
}

export { Player };
