const square = document.getElementById("square");
const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");
const restartBtn = document.getElementById("restart-btn");
const popSound = document.getElementById("pop-sound");
const gameoverSound = document.getElementById("gameover-sound");
const missesText = document.getElementById("misses");
const msgRight = document.getElementById("message-right");
const msgLeft = document.getElementById("message-left");
const gameContainer = document.getElementById("game-container");
const bestScoreValue = document.getElementById("best-score-value");
const introScreen = document.getElementById("intro-screen");
const gameScreen = document.getElementById("game-screen");
const startBtn = document.getElementById("start-btn");
const startBestScore = document.getElementById("start-best-score");
const resetRecordBtn = document.getElementById("reset-record");

// Game variables
let bestScore = parseInt(localStorage.getItem("bestScore")) || 0;
let score = 0;
let timeLeft = 30;
let misses = 0;
let timerInterval;
let sizeInterval;
let gameStarted = false;
let canClick = true;
let squareSize = 50;
let isShrinking = true;

// Initialize game
bestScoreValue.textContent = bestScore;
startBestScore.textContent = bestScore;

function moveSquare() {
  const gameWidth = gameContainer.clientWidth - squareSize;
  const gameHeight = gameContainer.clientHeight - squareSize;
  const x = Math.random() * gameWidth;
  const y = Math.random() * gameHeight;

  square.style.width = squareSize + "px";
  square.style.height = squareSize + "px";
  square.style.left = x + "px";
  square.style.top = y + "px";

  const hue = (score * 10) % 360;
  square.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
}

function changeSquareSize() {
  squareSize = isShrinking 
    ? 30 + Math.floor(Math.random() * 11)
    : 50 + Math.floor(Math.random() * 21);

  isShrinking = !isShrinking;
  square.classList.add("size-change");
  setTimeout(() => {
    moveSquare();
    square.classList.remove("size-change");
  }, 250);
}

function playPopEffect() {
  popSound.currentTime = 0;
  popSound.play();
  square.classList.add("pop");
  setTimeout(() => square.classList.remove("pop"), 200);
}

square.addEventListener("click", (event) => {
  if (!gameStarted || !canClick) return;

  canClick = false;
  setTimeout(() => canClick = true, 200);

  event.stopPropagation();
  score++;
  scoreText.textContent = "Score: " + score;
  playPopEffect();
  moveSquare();
});

gameContainer.addEventListener("click", () => {
    if (!gameStarted) return;
  
    misses++;
    missesText.textContent = `Misses: ${misses} / 3`;
  
    gameContainer.classList.remove("shake");
    void gameContainer.offsetWidth; // форсируем перезапуск анимации
    gameContainer.classList.add("shake");
  
    gameContainer.classList.add("crack");
    setTimeout(() => gameContainer.classList.remove("crack"), 500);
  
    if (misses === 1) {
      msgRight.style.opacity = 1;
      setTimeout(() => msgRight.style.opacity = 0, 1000);
    } else if (misses === 2) {
      msgLeft.style.opacity = 1;
      setTimeout(() => msgLeft.style.opacity = 0, 1000);
    }
  
    if (misses >= 3) {
      endGame(true);
      return;
    }
  });

function startTimer() {
  sizeInterval = setInterval(changeSquareSize, 5000);

  timerInterval = setInterval(() => {
    timeLeft--;
    timerText.textContent = "Time: " + timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame(false);
    }
  }, 1000);
}

function endGame(tooManyMisses) {
  clearInterval(timerInterval);
  clearInterval(sizeInterval);
  gameoverSound.play();
  square.style.display = "none";
  gameStarted = false;

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
    bestScoreValue.textContent = bestScore;
    startBestScore.textContent = bestScore;
    timerText.textContent = tooManyMisses 
      ? "Game Over — New Record!" 
      : "Time's up — New Record!";
  } else {
    timerText.textContent = tooManyMisses 
      ? "Game Over — Too many misses!" 
      : "Time's up!";
  }

  scoreText.textContent = `Score: ${score} — Game Over!`;
  restartBtn.style.display = "inline-block";
}

function resetGame() {
  clearInterval(timerInterval);
  clearInterval(sizeInterval);

  score = 0;
  timeLeft = 30;
  misses = 0;
  squareSize = 50;
  isShrinking = true;

  scoreText.textContent = "Score: 0";
  timerText.textContent = "Time: 30";
  missesText.textContent = "Misses: 0 / 3";
  restartBtn.style.display = "none";
  square.style.removeProperty("display");
  square.style.width = "50px";
  square.style.height = "50px";
  msgRight.style.opacity = 0;
  msgLeft.style.opacity = 0;
  gameContainer.style.backgroundColor = "#333";

  moveSquare();
}

startBtn.addEventListener("click", () => {
  introScreen.style.opacity = 0;
  setTimeout(() => {
    introScreen.style.display = "none";
    gameScreen.style.display = "block";
    resetGame();
    gameStarted = true;
    startTimer();
  }, 800);
});

restartBtn.addEventListener("click", () => {
  resetGame();
  gameStarted = true;
  startTimer();
});

resetRecordBtn.addEventListener("click", () => {
  localStorage.removeItem("bestScore");
  bestScore = 0;
  bestScoreValue.textContent = "0";
  startBestScore.textContent = "0";
});

moveSquare();
