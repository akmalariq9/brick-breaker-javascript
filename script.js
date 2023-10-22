const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let gameStarted = false;
let lives = 3;
let score = 0;
let gameInterval;
let gameOverFlag = false;
const ballRadius = 5;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

let brickRowCount;
let brickColumnCount;
const brickPadding = 10;
let brickOffsetTop = 30;
let brickWidth;
let brickHeight;
let brickOffsetLeft;

let bricks = [];

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("mousemove", mouseMoveHandler);

const levelButtons = document.querySelectorAll(".level-button");
levelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const level = parseInt(button.getAttribute("data-level"));
    startGame(level);
  });
});

function initializeBricks(selectedLevel) {
  bricks = [];
  brickOffsetTop = 30;

  if (selectedLevel === 1) {
    brickRowCount = 1;
    brickColumnCount = 3;
  } else if (selectedLevel === 2) {
    brickRowCount = 4;
    brickColumnCount = 6;
  } else if (selectedLevel === 3) {
    brickRowCount = 8;
    brickColumnCount = 10;
  }

  brickWidth =
    (canvas.width - brickPadding * (brickColumnCount - 1)) / brickColumnCount;
  brickHeight = 20;
  brickOffsetLeft =
    (canvas.width -
      brickWidth * brickColumnCount -
      brickPadding * (brickColumnCount - 1)) /
    2;

  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
      const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
      bricks[c][r] = { x: brickX, y: brickY, status: 1 };
    }
  }
}

const levelSelection = document.getElementById("levelSelection");

function startGame(selectedLevel) {
  if (!gameStarted) {
    const home = document.getElementById("home");
    home.style.display = "none"; // Hide the home div
    canvas.style.display = "block"; // Show the canvas
    gameStarted = true;

    initializeBricks(selectedLevel);
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 2;
    dy = -2;
    paddleX = (canvas.width - paddleWidth) / 2;

    clearInterval(gameInterval);
    gameInterval = setInterval(draw, 10);

    // Get the token from localStorage
    const usertoken = localStorage.getItem("token");

    // Add an event listener to the "Level" button to send the token to the API
    levelSelection.addEventListener("click", () => {
      fetch("https://ets-pemrograman-web-f.cyclic.app/users/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${usertoken}`, // Send the token in the Authorization header
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          localStorage.setItem("nama", data.data.nama);
        })
        .catch((error) => {
          console.error("Error sending token to the API:", error);
        });
    });
  }
}

function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (
    relativeX > paddleWidth / 2 &&
    relativeX < canvas.width - paddleWidth / 2
  ) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

function keyDownHandler(e) {
  if (e.keyCode === 39) {
    rightPressed = true;
  } else if (e.keyCode === 37) {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.keyCode === 39) {
    rightPressed = false;
  } else if (e.keyCode === 37) {
    leftPressed = false;
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function increaseLevel() {
  alert("Congratulations! You've completed the level.");
  document.location.reload();
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const brick = bricks[c][r];
      if (brick.status === 1) {
        if (
          x > brick.x &&
          x < brick.x + brickWidth &&
          y > brick.y &&
          y < brick.y + brickHeight
        ) {
          dy = -dy;
          brick.status = 0;
          score += 1;

          if (score === brickRowCount * brickColumnCount) {
            increaseLevel();
          }
        }
      }
    }
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Score: " + score, 8, 20);
}

function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

function gameOver() {
  clearInterval(gameInterval);
  const playAgain = confirm("Game Over! Want to play again?");
  if (playAgain) {
    document.location.reload();
  } else {
    const menu = document.getElementById("menu");
    menu.style.display = "block";
    canvas.style.display = "none";
    gameStarted = false;
  }
}

function draw() {
  if (!gameStarted) {
    return;
  }

  if (lives <= 0 && !gameOverFlag) {
    gameOver();
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();
  collisionDetection();

  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    } else {
      lives--;
      if (lives === 0) {
        gameOver();
      } else {
        x = canvas.width / 2;
        y = canvas.height - 30;
        dx = 2;
        dy = -2;
        paddleX = (canvas.width - paddleWidth) / 2;
      }
    }
  }

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  x += dx;
  y += dy;
}

const registrationForm = document.getElementById("registrationForm");
const loginForm = document.getElementById("loginForm");

registrationForm.style.display = "block";
loginForm.style.display = "none";

// Switch between Registration and Login forms
const switchToLogin = document.getElementById("switchToLogin");
const switchToRegistration = document.getElementById("switchToRegistration");

switchToLogin.addEventListener("click", () => {
  registrationForm.style.display = "none";
  loginForm.style.display = "block";
});

switchToRegistration.addEventListener("click", () => {
  registrationForm.style.display = "block";
  loginForm.style.display = "none";
});

// Add event listeners for Register and Login buttons
const registerButton = document.getElementById("registerButton");
const loginButton = document.getElementById("loginButton");

registerButton.addEventListener("click", () => {
  registerUser();
});

loginButton.addEventListener("click", () => {
  loginUser();
});

// Function to register the user
function registerUser() {
  const userName = document.getElementById("userName").value;
  const userEmail = document.getElementById("userEmail").value;
  const userPassword = document.getElementById("userPassword").value;

  if (!userName || !userEmail || !userPassword) {
    alert("Please fill in all registration fields.");
    return;
  }
  const registerUrl = "https://ets-pemrograman-web-f.cyclic.app/users/register";

  const xhr = new XMLHttpRequest();
  xhr.open("POST", registerUrl, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 400) {
        alert("Registration failed. Please try again.");
      } else {
        const response = JSON.parse(this.responseText);
        if (response.data && response.data.access_token) {
          const accessToken = response.data.access_token;
          console.log("Token:", accessToken);
          localStorage.setItem("token", accessToken);
        } else {
          console.log("Token not found in the response data.");
        }
        alert("Registration successful. You can now log in.");
        registrationForm.style.display = "none";
        levelSelection.style.display = "block";
      }
    }
  };

  const userData = {
    nama: userName,
    email: userEmail,
    password: userPassword,
  };

  xhr.send(JSON.stringify(userData));
}

// Function to log in the user
function loginUser() {
  const loginEmail = document.getElementById("loginEmail").value;
  const loginPassword = document.getElementById("loginPassword").value;

  if (!loginEmail || !loginPassword) {
    alert("Please fill in all login fields.");
    return;
  }

  const loginUrl = "https://ets-pemrograman-web-f.cyclic.app/users/login";

  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        const response = JSON.parse(this.responseText);
        if (response.data && response.data.access_token) {
          const accessToken = response.data.access_token;
          localStorage.setItem("token", accessToken);
        } else {
          console.log("Token not found in the response data.");
        }
        alert("Login successful. You can now choose a game level.");
        registrationForm.style.display = "none";
        loginForm.style.display = "none";
        levelSelection.style.display = "block";
      } else {
        alert("Login failed. Please try again.");
      }
    }
  };

  xhttp.open("POST", loginUrl, true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(
    JSON.stringify({
      email: loginEmail,
      password: loginPassword,
    })
  );
}

function checkLoginStatus() {
  const token = localStorage.getItem("token");

  if (token) {
    // Token exists in local storage, user is logged in
    registrationForm.style.display = "none";
    loginForm.style.display = "none";
    levelSelection.style.display = "block";
  } else {
    // Token doesn't exist, show login and registration forms
    registrationForm.style.display = "block";
    loginForm.style.display = "none"; // You may want to show the login form here if necessary
  }
}

// Call checkLoginStatus when the page loads
window.addEventListener("load", checkLoginStatus);

// Add an event listener to the "Leaderboard" button
const leaderboardButton = document.getElementById("leaderboardButton");
leaderboardButton.addEventListener("click", () => {
  // Fetch the leaderboard data from the API
  fetch("https://ets-pemrograman-web-f.cyclic.app/scores/score")
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        const leaderboardData = data.data;
        displayLeaderboard(leaderboardData);
      } else {
        alert("Failed to retrieve the leaderboard data.");
      }
    })
    .catch((error) => {
      console.error("Error fetching leaderboard data:", error);
    });
});

// Function to display the leaderboard data
function displayLeaderboard(leaderboardData) {
  // Menghapus ID dari data leaderboard
  const dataWithoutId = leaderboardData.map((entry) => ({
    nama: entry.nama,
    score: entry.score,
  }));

  // Mengurutkan data leaderboard berdasarkan skor secara menurun
  const sortedData = dataWithoutId.sort((a, b) => b.score - a.score);

  // Memotong data untuk menampilkan hanya 3 skor tertinggi
  const top3Entries = sortedData.slice(0, 3);

  // Membuat kontainer untuk leaderboard
  const leaderboardContainer = document.createElement("div");
  leaderboardContainer.classList.add("leaderboard-container");

  // Membuat judul untuk leaderboard
  const leaderboardHeading = document.createElement("h2");
  leaderboardHeading.textContent = "Top 3 Leaderboard Scores";
  leaderboardContainer.appendChild(leaderboardHeading);

  // Membuat tabel untuk menampilkan data leaderboard
  const leaderboardTable = document.createElement("table");
  leaderboardTable.classList.add("leaderboard-table");

  // Membuat header tabel
  const tableHeader = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const nameHeader = document.createElement("th");
  nameHeader.textContent = "Name";
  const scoreHeader = document.createElement("th");
  scoreHeader.textContent = "Score";
  headerRow.appendChild(nameHeader);
  headerRow.appendChild(scoreHeader);
  tableHeader.appendChild(headerRow);
  leaderboardTable.appendChild(tableHeader);

  // Menampilkan 3 skor tertinggi
  top3Entries.forEach((entry) => {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.textContent = entry.nama;
    const scoreCell = document.createElement("td");
    scoreCell.textContent = entry.score;
    row.appendChild(nameCell);
    row.appendChild(scoreCell);
    leaderboardTable.appendChild(row);
  });

  leaderboardContainer.appendChild(leaderboardTable);

  // Menambahkan leaderboard ke halaman
  const home = document.getElementById("home");
  home.style.display = "none"; // Sembunyikan konten home
  canvas.style.display = "none"; // Sembunyikan game canvas
  document.body.appendChild(leaderboardContainer);
}