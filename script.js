const canvas = document.getElementById("flappyCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 320;
canvas.height = 480;

let bird = {
  x: 50,
  y: 150,
  width: 20,
  height: 20,
  gravity: 0.6,
  lift: -10,
  velocity: 0
};

let pipes = [];
let score = 0;
let gameOver = false;

function drawBird() {
  ctx.fillStyle = "yellow";
  ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipe(pipe) {
  ctx.fillStyle = "green";
  ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
  ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);
}

function update() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Bird physics
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    endGame();
  }

  drawBird();

  // Pipes
  if (pipes.length === 0 || pipes[pipes.length - 1].x < 200) {
    let top = Math.random() * 200 + 20;
    let bottom = 320 - top;
    pipes.push({ x: canvas.width, width: 40, top: top, bottom: bottom });
  }

  pipes.forEach((pipe, index) => {
    pipe.x -= 2;
    drawPipe(pipe);

    // Collision
    if (
      bird.x < pipe.x + pipe.width &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
    ) {
      endGame();
    }

    // Scoring
    if (pipe.x + pipe.width === bird.x) {
      score++;
    }

    // Remove off-screen pipes
    if (pipe.x + pipe.width < 0) {
      pipes.splice(index, 1);
    }
  });

  // Show score
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 25);

  requestAnimationFrame(update);
}

function endGame() {
  gameOver = true;
  ctx.fillStyle = "red";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over", canvas.width / 2 - 70, canvas.height / 2);
}

function flap() {
  if (!gameOver) {
    bird.velocity = bird.lift;
  } else {
    // Reset Game
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;update();
  }
}

document.addEventListener("keydown", flap);
document.addEventListener("click", flap);
document.addEventListener("touchstart", flap);

update();
function redirectToGameMode() {
        const select = document.getElementById('mode');
        const selectedValue = select.value;
        if (selectedValue) {
            window.location.href = selectedValue;
        }
    }