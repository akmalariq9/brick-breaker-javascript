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

function startGame(selectedLevel) {
  if (!gameStarted) {
    const menu = document.getElementById("menu");
    menu.style.display = "none";
    canvas.style.display = "block";
    gameStarted = true;

    initializeBricks(selectedLevel);
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 2;
    dy = -2;
    paddleX = (canvas.width - paddleWidth) / 2;

    clearInterval(gameInterval);
    gameInterval = setInterval(draw, 10);
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
