// main.js
import { Deck } from "../piles_of_cards.js"; // Assuming the Deck class is in piles_of_cards.js
import { Player } from "../players.js"; // Import the Player class

// Create a deck for 2 players
const deck = new Deck(2);

// Create a player named "Alice"
const player1 = new Player("Alice");

// Player draws a card
player1.drawCard(deck);
console.log(player1.hand); // The player's hand should now contain one card

// Player draws another card
player1.drawCard(deck);
console.log(player1.hand); // The player's hand should now contain two cards

player1.discardCard(0);
console.log("Hand: ", player1.hand);
console.log("Discard pile: ", player1.discardPile);

for (let i = 0; i < 7; i++) {
  player1.drawCard(deck); // Draw a card from the deck into the player's hand
}

player1.placeCard(0, 0, 0);
player1.placeCard(0, 0, 0);
player1.placeCard(0, 0, 3);
player1.placeCard(0, 0, 1);
player1.placeCard(0, 1, 0);
player1.placeCard(0, -1, -1);
player1.placeCard(0, -1, 0);
player1.placeCard(0, -1, -1);

player1.playArea.viewGrid();
