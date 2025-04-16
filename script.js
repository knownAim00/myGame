const square = document.getElementById("square");
const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");
const restartBtn = document.getElementById("restart-btn");
const popSound = document.getElementById("pop-sound");
const gameoverSound = document.getElementById("gameover-sound");
const missSound = document.getElementById("miss-sound");
const winSound = document.getElementById("win-sound");
const livesContainer = document.getElementById("lives-container");
const heartIcons = livesContainer.querySelectorAll(".heart-icon");
const msgRight = document.getElementById("message-right");
const msgLeft = document.getElementById("message-left");
const gameContainer = document.getElementById("game-container");
const bestScoreValue = document.getElementById("best-score-value");
const introScreen = document.getElementById("intro-screen");
const gameScreen = document.getElementById("game-screen");
const startBtn = document.getElementById("start-btn");
const startBestScore = document.getElementById("start-best-score");

const resultsScreen = document.getElementById("results-screen");
const finalScore = document.getElementById("final-score");
const resultsBestScore = document.getElementById("results-best-score");
const newRecordMessage = document.getElementById("new-record-message");
const menuBtn = document.getElementById("menu-btn");
const resultsPlayAgainBtn = document.getElementById("results-play-again-btn");
const resultsResetRecordBtn = document.getElementById("results-reset-record-btn");

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

bestScoreValue.textContent = bestScore;
startBestScore.textContent = bestScore;

function isMobileDevice() {
  return window.innerWidth <= 768;
}

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
  square.style.background = `linear-gradient(135deg, hsl(${hue}, 100%, 50%), hsl(${(hue + 60) % 360}, 100%, 50%))`;
  square.style.boxShadow = `0 0 15px hsl(${hue}, 100%, 60%)`;
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

const rightMessages = ["Stay sharp!", "You got this!", "Don't blink!", "Focus!"];
const leftMessages = ["Try again!", "Keep going!", "Missed it!", "React faster!"];
const colors = ["#ff4444", "#ffaa00", "#00ddff", "#ff66cc"];

function showMotivation(side) {
  if (isMobileDevice()) return;
  const msg = side === "right" ? msgRight : msgLeft;
  const messageList = side === "right" ? rightMessages : leftMessages;
  msg.textContent = messageList[Math.floor(Math.random() * messageList.length)];
  msg.style.color = colors[Math.floor(Math.random() * colors.length)];
  const gameRect = gameContainer.getBoundingClientRect();
  const margin = 20;
  const verticalRange = window.innerHeight - 100;
  const top = Math.max(margin, Math.random() * verticalRange);
  msg.style.top = `${top}px`;
  const sideOffset = side === "right"
    ? gameRect.right + margin
    : gameRect.left - msg.offsetWidth - margin;
  msg.style.left = side === "right" ? `${sideOffset}px` : "";
  msg.style.right = side === "left" ? `${window.innerWidth - sideOffset}px` : "";
  msg.classList.remove("show");
  void msg.offsetWidth;
  msg.classList.add("show");
  setTimeout(() => msg.classList.remove("show"), 1000);
}

gameContainer.addEventListener("click", () => {
  if (!gameStarted) return;
  misses++;
  if (missSound) {
    missSound.currentTime = 0;
    missSound.play();
  }
  if (misses <= heartIcons.length) {
    const heartToLose = heartIcons[misses - 1];
    heartToLose.classList.add("heart-animation");
    setTimeout(() => {
      heartToLose.classList.remove("heart-animation");
      heartToLose.classList.add("heart-lost");
    }, 500);
  }
  gameContainer.classList.remove("shake");
  void gameContainer.offsetWidth;
  gameContainer.classList.add("shake");
  gameContainer.classList.add("crack");
  setTimeout(() => gameContainer.classList.remove("crack"), 500);
  if (misses === 1) showMotivation("right");
  else if (misses === 2) showMotivation("left");
  if (misses >= 3) {
    endGame(true);
    return;
  }
});

function startTimer() {
  setInterval(() => {
    let intensity = Math.min(misses, 3);
    square.style.animationDuration = `${0.4 - intensity * 0.05}s`;
    square.classList.remove("shake");
    void square.offsetWidth;
    square.classList.add("shake");
    setTimeout(() => square.classList.remove("shake"), 500);
  }, 5000);
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
  square.style.display = "none";
  gameStarted = false;
  gameScreen.style.display = "none";
  resultsScreen.style.display = "flex";
  finalScore.textContent = score;

  if (score > bestScore) {
    winSound.play();
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
    bestScoreValue.textContent = bestScore;
    startBestScore.textContent = bestScore;
    resultsBestScore.textContent = bestScore;
    newRecordMessage.style.display = "block";
  } else {
    gameoverSound.play();
    resultsBestScore.textContent = bestScore;
    newRecordMessage.style.display = "none";
  }
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
  heartIcons.forEach(heart => {
    heart.classList.remove("heart-lost");
    heart.classList.remove("heart-animation");
  });
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

resultsPlayAgainBtn.addEventListener("click", () => {
  resultsScreen.style.display = "none";
  gameScreen.style.display = "block";
  resetGame();
  gameStarted = true;
  startTimer();
});

menuBtn.addEventListener("click", () => {
  resultsScreen.style.display = "none";
  introScreen.style.display = "flex";
  introScreen.style.opacity = 1;
});

resultsResetRecordBtn.addEventListener("click", () => {
  localStorage.removeItem("bestScore");
  bestScore = 0;
  bestScoreValue.textContent = "0";
  startBestScore.textContent = "0";
  resultsBestScore.textContent = "0";
  newRecordMessage.style.display = "none";
});

window.addEventListener("resize", () => {
  if (isMobileDevice()) {
    msgRight.classList.remove("show");
    msgLeft.classList.remove("show");
  }
});

moveSquare();
