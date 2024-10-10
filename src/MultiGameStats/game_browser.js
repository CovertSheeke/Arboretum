import { Game } from "./game_logic.js"; // Import the Game class

// Function to run multiple games
function runMultipleGames(playerNames, numberOfGames) {
  const allScores = []; // Store the scores for each game

  for (let i = 0; i < numberOfGames; i++) {
    const game = new Game(playerNames); // Initialize a new game for each run
    const scores = game.startGame(); // Start the game and get final scores
    allScores.push(scores); // Store the scores
  }

  return allScores; // Return all the scores after all games
}

// Function to plot scores using Chart.js
function plotScores(allScores) {
  const gameNumbers = allScores.map((_, index) => `Game ${index + 1}`);
  const playerScores = transposeScores(allScores);

  const data = {
    labels: gameNumbers, // Game numbers on x-axis
    datasets: [
      {
        label: "Player 1",
        data: playerScores[0], // Scores for Player 1
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: false,
      },
      {
        label: "Player 2",
        data: playerScores[1], // Scores for Player 2
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: false,
      },
      {
        label: "Player 3",
        data: playerScores[2], // Scores for Player 3
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
      },
    ],
  };

  const config = {
    type: "line", // Line graph
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Scores over Multiple Games",
        },
      },
    },
  };

  // Render the chart in the browser
  const ctx = document.getElementById("scoresChart").getContext("2d");
  new Chart(ctx, config);
}

// Helper function to transpose scores for easy plotting
function transposeScores(allScores) {
  const playerCount = allScores[0].length;
  const playerScores = Array.from({ length: playerCount }, () => []);

  allScores.forEach((gameScores) => {
    gameScores.forEach((score, playerIndex) => {
      playerScores[playerIndex].push(score);
    });
  });

  return playerScores;
}

// Run 100 games with 3 players
const playerNames = ["Alice", "Bob", "Charlie"];
const numberOfGames = 2;

const allScores = runMultipleGames(playerNames, numberOfGames); // Run the games
plotScores(allScores); // Plot the scores
