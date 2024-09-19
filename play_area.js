import chalk from "chalk"; // Import chalk for colored output

class PlayArea {
  constructor() {
    this.grid = {}; // Use an object to store cards at grid positions
  }

  // Method to place a card at a specific position (x, y)
  placeCard(card, x, y) {
    const positionKey = `${x},${y}`; // Create a unique key for the grid position
    if (!this.grid[positionKey]) {
      this.grid[positionKey] = { ...card, x, y }; // Store card details along with position
      console.log(`Card placed at (${x}, ${y}):`, this.grid[positionKey]);
    } else {
      console.log(`Position (${x}, ${y}) is already occupied!`);
    }
  }

  // Method to get all legal placements based on the current state of the grid
  getLegalPlacements() {
    if (Object.keys(this.grid).length === 0) {
      // If the grid is empty, the first card can be placed anywhere (let's allow (0, 0))
      return [[0, 0]];
    }

    const legalPlacements = new Set(); // To store unique legal placements
    const directions = [
      [1, 0], // Right
      [-1, 0], // Left
      [0, 1], // Up
      [0, -1], // Down
    ];

    // Loop through all cards already on the grid
    Object.keys(this.grid).forEach((key) => {
      const [x, y] = key.split(",").map(Number);

      // For each card, check the four adjacent positions (horizontal and vertical)
      directions.forEach(([dx, dy]) => {
        const newX = x + dx;
        const newY = y + dy;
        const newKey = `${newX},${newY}`;

        // Only add to legal placements if the position is not already occupied
        if (!this.grid[newKey]) {
          legalPlacements.add(`${newX},${newY}`);
        }
      });
    });
    return Array.from(legalPlacements).map((position) =>
      position.split(",").map(Number)
    );
  }

  // Method to get the card at a specific position (x, y)
  getCard(x, y) {
    const positionKey = `${x},${y}`;
    return this.grid[positionKey] ? this.grid[positionKey] : null; // Return card or null if not found
  }

  // Method to display the current state of the grid
  viewGrid() {
    console.log("Current Play Area Grid:");
    Object.keys(this.grid).forEach((key) => {
      const card = this.grid[key];
      console.log(`Position (${card.x}, ${card.y}):`, card);
    });
  }

  // Method to display the current state of the grid, dynamically sized +1 in all directions
  viewGrid() {
    if (Object.keys(this.grid).length === 0) {
      console.log("The grid is empty.");
      return;
    }

    // Get min and max x and y values from the grid
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    Object.keys(this.grid).forEach((key) => {
      const [x, y] = key.split(",").map(Number);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    // Add a buffer of 1 on all sides
    minX -= 1;
    maxX += 1;
    minY -= 1;
    maxY += 1;

    // Print the grid with coordinates
    console.log("Current Play Area Grid:");

    // Print the top row of x-coordinates
    let headerRow = "    "; // Start with some padding for y-coordinates on the left
    for (let x = minX; x <= maxX; x++) {
      headerRow += `${x >= 0 ? " " : ""}${x} `; // Format x-coordinates with padding for positive/negative
    }
    console.log(headerRow);

    // Print each row, including y-coordinates and cards/empty cells
    for (let y = maxY; y >= minY; y--) {
      let row = `${y >= 0 ? " " : ""}${y} `; // Print y-coordinate on the left with padding
      for (let x = minX; x <= maxX; x++) {
        const card = this.getCard(x, y);
        if (card) {
          row += this.formatCard(card);
        } else {
          row += " . "; // Empty cell
        }
      }
      console.log(row); // Print the row
    }
  }

  // Helper method to format a card for the grid display with color
  formatCard(card) {
    const suitLetter = card.suit[0]; // First letter of the suit
    const rank = card.rank;
    const color = card.color.toLowerCase();

    let coloredCard = `${rank}${suitLetter}`;
    switch (color) {
      case "yellow":
        return chalk.yellow(coloredCard);
      case "pink":
        return chalk.hex("#FFC0CB")(coloredCard); // Chalk doesn't have default pink
      case "white":
        return chalk.white(coloredCard);
      case "orange":
        return chalk.hex("#FFA500")(coloredCard); // Chalk doesn't have default orange
      case "purple":
        return chalk.magenta(coloredCard);
      case "red":
        return chalk.red(coloredCard);
      case "dark grey":
        return chalk.gray(coloredCard);
      case "brown":
        return chalk.hex("#A52A2A")(coloredCard); // Custom brown
      case "blue":
        return chalk.blue(coloredCard);
      case "dark green":
        return chalk.green(coloredCard);
      default:
        return coloredCard;
    }
  }
}

export { PlayArea };
