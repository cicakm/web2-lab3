var myGamePaddle, myBall;
var bricks = [];

const brickWidth = 180;
const brickHeight = 60;
const brickWidthPadding = 60;
const brickHeightPadding = 40;
const brickOffsetTop = 40;
const brickOffsetLeft = 40;

const rows = 3;
const columns = 6;

function startGame() {
  fillBricks();
  myGameArea.start();
  myGamePaddle = new paddle(
    300,
    10,
    "red",
    myGameArea.canvas.width / 2 - 150,
    myGameArea.canvas.height - 20
  );
  myBall = new ball(
    10,
    "blue",
    myGamePaddle.x + myGamePaddle.width / 2,
    myGamePaddle.y - myGamePaddle.height
  );
  // RANDOMLY START THE BALL
  myRandom = Math.random() * 2 * Math.PI;
  myBall.speedY = Math.sin(myRandom) * 5;
  myBall.speedX = Math.cos(myRandom) * 5;
}

// INITIAL SET FOR THE ARRAY OF BRICKS
function fillBricks() {
  for (let i = 0; i < columns; i++) {
    bricks[i] = [];
    for (let j = 0; j < rows; j++) {
      bricks[i][j] = { x: 0, y: 0, alive: true };
    }
  }
}

function drawBricks() {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      if (bricks[i][j].alive) {
        // SPLIT BRICKS WITH PADDING AND OFFSET
        const brickX = i * (brickWidth + brickWidthPadding) + brickOffsetLeft;
        const brickY = j * (brickHeight + brickHeightPadding) + brickOffsetTop;
        bricks[i][j].x = brickX;
        bricks[i][j].y = brickY;
        new brick(brickWidth, brickHeight, "green", brickX, brickY);
      }
    }
  }
}

// PADDLE
function paddle(width, height, color, x, y) {
  this.width = width;
  this.height = height;
  this.speedX = 0;
  this.x = x;
  this.y = y;
  this.update = function () {
    ctx = myGameArea.context;
    ctx.beginPath();
    ctx.shadowBlur = 20;
    ctx.shadowColor = "black";
    ctx.fillStyle = color;
    ctx.roundRect(this.x, this.y, this.width, this.height, [20]);
    ctx.fill();
    ctx.closePath();
  };
  this.newPos = function () {
    this.x += this.speedX;
  };
  this.bounce = function () {
    const paddleLeft = this.x;
    const paddleRight = this.x + this.width;
    const paddleTop = this.y;

    const ballLeft = myBall.x;
    const ballRight = myBall.x + myBall.radius;
    const ballBottom = myBall.y + myBall.radius;

    if (
      ballLeft < paddleRight &&
      ballRight > paddleLeft &&
      ballBottom > paddleTop
    ) {
      // BOUNCE THE BALL FROM PADDLE
      myBall.speedY = -myBall.speedY;
    }
  };
}

// BALL
function ball(radius, color, x, y) {
  this.radius = radius;
  this.speedX = 0;
  this.speedY = 0;
  this.breakcount = 0;
  this.x = x;
  this.y = y;
  this.update = function () {
    ctx = myGameArea.context;
    ctx.beginPath();
    ctx.shadowBlur = 0;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
  };
  this.newPos = function () {
    this.x += this.speedX;
    this.y += this.speedY;
  };
  this.break = function () {
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        if (bricks[i][j].alive) {
          const brickLeft = bricks[i][j].x;
          const brickRight = bricks[i][j].x + brickWidth;
          const brickTop = bricks[i][j].y;
          const brickBottom = bricks[i][j].y + brickHeight;

          const ballLeft = this.x - this.radius;
          const ballRight = this.x + this.radius;
          const ballTop = this.y - this.radius;
          const ballBottom = this.y + this.radius;

          if (
            // FROM THE BOTTOM
            ballLeft >= brickLeft &&
            ballRight <= brickRight &&
            ballTop >= brickTop &&
            ballTop <= brickBottom
          ) {
            bricks[i][j].alive = false;
            this.speedY = -this.speedY;
            this.breakcount += 1;
          } else if (
            // FROM THE RIGHT
            ballLeft <= brickRight &&
            ballLeft >= brickLeft &&
            ballTop >= brickTop &&
            ballBottom <= brickBottom
          ) {
            bricks[i][j].alive = false;
            this.speedX = -this.speedX;
            this.breakcount += 1;
          } else if (
            // FROM THE TOP
            ballLeft >= brickLeft &&
            ballRight <= brickRight &&
            ballBottom <= brickBottom &&
            ballBottom >= brickTop
          ) {
            bricks[i][j].alive = false;
            this.speedY = -this.speedY;
            this.breakcount += 1;
          } else if (
            // FROM THE LEFT
            ballRight <= brickRight &&
            ballRight >= brickLeft &&
            ballTop >= brickTop &&
            ballBottom <= brickBottom
          ) {
            bricks[i][j].alive = false;
            this.speedX = -this.speedX;
            this.breakcount += 1;
          }
        }
      }
    }
  };
  this.edges = function () {
    const ballLeft = this.x - this.radius;
    const ballRight = this.x + this.radius;
    const ballTop = this.y - this.radius;
    const ballBottom = this.y + this.radius;

    if (ballLeft <= 0 || ballRight >= myGameArea.canvas.width) {
      // BOUNCE FROM THE SIDES
      this.speedX = -this.speedX;
    } else if (ballTop <= 0) {
      // BOUNCE FROM THE TOP
      this.speedY = -this.speedY;
    } else if (ballBottom > myGameArea.canvas.height + this.radius * 2) {
      // BALL WENT OUT OF THE BOUNDS
      myGameArea.gameplay = false;
    }
  };
}

// BRICKS AT THE TOP
function brick(width, height, color, x, y) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  ctx = myGameArea.context;
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.shadowBlur = 20;
  ctx.shadowColor = "black";
  ctx.fillRect(this.x, this.y, this.width, this.height);
  ctx.closePath();
}

// GAME SCREEN
var myGameArea = {
  canvas: document.createElement("canvas"),
  start: function () {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.gameplay = true;
    window.addEventListener(
      "keydown",
      function (e) {
        myGameArea.keys = myGameArea.keys || [];
        myGameArea.keys[e.key] = e.type == "keydown";
      },
      false
    );
    window.addEventListener(
      "keyup",
      function (e) {
        myGameArea.keys[e.key] = e.type == "keydown";
      },
      false
    );
  },
  clear: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  stop: function () {
    // STOP THE GAME AND SET SCORE
    localStorage.setItem("score", myBall.breakcount);
    this.gameplay = false;
  },
};

function movePaddle() {
  if (myGameArea.keys && myGameArea.keys["ArrowLeft"] && myGamePaddle.x >= 0) {
    // MOVE LEFT IF NOT OUT OF THE BOUNDS
    myGamePaddle.speedX = -10;
  } else if (
    myGameArea.keys &&
    myGameArea.keys["ArrowRight"] &&
    myGamePaddle.x + myGamePaddle.width < myGameArea.canvas.width
  ) {
    // MOVE RIGHT IF NOT OUT OF THE BOUNDS
    myGamePaddle.speedX = 10;
  } else {
    // STOP MOVING ON KEY UP
    myGamePaddle.speedX = 0;
  }
}

function gameText(
  font,
  textAlign,
  textBaseline,
  textMessage,
  positionX,
  positionY
) {
  ctx = myGameArea.context;
  ctx.beginPath();
  ctx.font = font;
  ctx.shadowBlur = 0;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.fillText(textMessage, positionX, positionY);
  ctx.closePath();
}

function updateGameArea() {
  // CLEAR SCREEN
  myGameArea.clear();
  movePaddle();

  // PADDLE
  myGamePaddle.bounce();
  myGamePaddle.newPos();
  myGamePaddle.update();

  // BALL
  myBall.newPos();
  myBall.update();
  myBall.edges();
  myBall.break();

  // BRICKS
  drawBricks();

  // SCOREBOARD
  gameText(
    "40px Arial",
    "right",
    "bottom",
    myBall.breakcount + "/" + rows * columns,
    myGameArea.canvas.width - 50,
    50
  );

  if (!myGameArea.gameplay || myBall.breakcount == rows * columns) {
    myGameArea.clear();
    gameText(
      "80px Arial",
      "center",
      "middle",
      "GAME OVER",
      myGameArea.canvas.width / 2,
      myGameArea.canvas.height / 2
    );
  } else {
    requestAnimationFrame(updateGameArea);
  }
}

requestAnimationFrame(updateGameArea);
