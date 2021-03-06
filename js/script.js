//canvas & ctx allows us to draw on the canvas=======================================================================================================
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

//score and level will allow us to update values using the DOM=======================================================================================================
const score = document.querySelector('#score');
const level = document.querySelector('#level');

//the Modal will display the start button, end score and a restart button =======================================================================================================
const modal = document.querySelector('#modal');
const modalScore = document.querySelector('#modal-score');
const startBtn = document.querySelector('#start-btn');
const restartBtn = document.querySelector('#restart-btn');
const modalText = document.querySelector('#modal-text')

//once game is over or game is won instr will be set to hide =======================================================================================================
const instr = document.querySelector('#instuctions')

//game level will increment over the course of the game letting the player know what level they are on during the course of gameplay
let gameLevel = 1;
level.innerText = gameLevel;

//game audio
//main game song theme
const gameSound = new Audio('/assets/theme.mp3');
const eatSound = new Audio('/assets/eat.mp3');
const lvlSound = new Audio('/assets/lvl.mp3');
const gameOverSound = new Audio('/assets/gameover.mp3');
const btnclick = new Audio('/assets/btn.mp3');

//this controls the width and height of the canvas window======================================================================================
canvas.width = 360;
canvas.height = 480;

//class to add segments to snake body===========================================================================================================
class SnakeSegment {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

//control functions for for mobile===============================================================================================================
function moveUp() {
	if (game.yVelocity === 1) {
		return;
	}
	game.yVelocity = -1;
	game.xVelocity = 0;
	btnclick.play();
}

function moveDown() {
	if (game.yVelocity === -1) {
		return;
	}
	game.yVelocity = 1;
	game.xVelocity = 0;
	btnclick.play();
}

function moveLeft() {
	if (game.xVelocity === 1) {
		return;
	}
	game.yVelocity = 0;
	game.xVelocity = -1;
	btnclick.play();
}

function moveRight() {
	if (game.xVelocity === -1) {
		return;
	}
	game.yVelocity = 0;
	game.xVelocity = 1;
	btnclick.play();
}
//GAME OBJECT=======================================================================================================
//this is where we will store the majority of our game content and values
const game = {
	//this will set the initial value for our score through the DOM
	gameScore: 0,
	//speed key will determine the speed of the game and the refresh rate of the animation
	speed: 4,

	//blockSize will determine the size of our blocks along the game grid
	blockSize: 18,
	
	//gameGridArea will control how our snake and fruit object appear on the canvas in a grid
	gameGridArea: 20,

	//headX and headY will be the initial value for the snake spawn location on our canvas
	headX: 10,
	headY: 10,

	//snakeBody will hold the segments added to the snake head in an array
	snakeBody: [],
	//tailLength will control the length of the snake tail upon start
	tailLength: 0,

	//fruitX and fruitY will be the initial value for the snake spawn location on our canvas
	fruitX: 5,
	fruitY: 5,

	//fruitRandomizer will ensure that our fruit spawns within the grid of the canvas at all times albiet randomly
	fruitRandomizerX: 17,
	fruitRandomizerY: 23,

	//our velocity will determine the directional velocity of our snake once input is given
	xVelocity: 0,
	yVelocity: 0,
	
	gameOver: false,

	//this method will draw our snake on the canvas ======================================================================================================
	drawSnake() {
		//all Snakesegments are drawn using this for lop that checks the snake body array for its length
		ctx.fillStyle = '#308AA7';
		for (let i = 0; i < game.snakeBody.length; i++) {
			let part = game.snakeBody[i];
			ctx.fillRect(
				part.x * game.gameGridArea,
				part.y * game.gameGridArea,
				game.blockSize,
				game.blockSize
			);
		}
		//upon collision with the fruit a new link to the snake is created using our snake segment class and pushed into our snake body array
		game.snakeBody.push(new SnakeSegment(game.headX, game.headY));
		if (game.snakeBody.length > game.tailLength) {
			game.snakeBody.shift();
		}
		//This controls the drawing of the snake head
		ctx.fillStyle = '#A7304E';
		ctx.fillRect(
			game.headX * game.gameGridArea,
			game.headY * game.gameGridArea,
			game.blockSize,
			game.blockSize
		);
	},
	//this method controls the snakes continous movement along the grid ======================================================================================================
	changeSnakePosition() {
		game.headX += game.xVelocity;
		game.headY += game.yVelocity;
	},
	//the draw fruit method places our fruit in our initial location in our grid ======================================================================================================
	drawFruit() {
		ctx.fillStyle = 'orange';
		//add array of fruit colors later
		// let fruitColors = ['#ff0000','#ffa500','#ffff00','#008000','#0000ff','#4b0082','#ee82ee']
		// for(let i = 0; i < fruitColors.length; i++){
		// 	ctx.fillStyle = fruitColors[i]
		// }
		ctx.fillRect(
			game.fruitX * game.gameGridArea,
			game.fruitY * game.gameGridArea,
			game.blockSize,
			game.blockSize
		);
	},
	//the isGameOver checks for gameOver scenarios listed in the conditions below ======================================================================================================
	isGameOver() {
		//walls lose case along X- Axis
		if (game.headX < 0 || game.headX > game.fruitRandomizerX) {
			game.gameOver = true;
		}
		//walls lose case along Y- Axis
		if (game.headY < 0 || game.headY > game.fruitRandomizerY) {
			game.gameOver = true;
		}
		//body touch lose case
		for (let i = 0; i < game.snakeBody.length; i++) {
			let part = game.snakeBody[i];
			if (part.x === game.headX && part.y === game.headY) {
				game.gameOver = true;
				break;
			}
		}	
	},
	//fruit collision ======================================================================================================
	checkFruitCollision() {
		if (game.fruitX === game.headX && game.fruitY === game.headY) {
			//here we have our randomizer that selects where our fruit will appear next along out 17 by 23 grid
			game.fruitX = Math.floor(Math.random() * game.fruitRandomizerX);
			game.fruitY = Math.floor(Math.random() * game.fruitRandomizerY);
			game.tailLength++;
			game.gameScore += 100;
			score.innerText = game.gameScore;
			modalScore.innerText = game.gameScore;
			//upon fruit collision this eat sound will play
			eatSound.play();


			//here are the conditions to increase the level in-game everytime 5 fruit have been eaten in a row to a total of 6 levels
			if (game.gameScore === 500) {
				game.speed += 2;
				lvlSound.play();
				gameLevel++;
				level.innerText = gameLevel;
			}
			if (game.gameScore === 1000) {
				game.speed += 3;
				lvlSound.play();
				gameLevel++;
				level.innerText = gameLevel;
			}
			if (game.gameScore === 1500) {
				game.speed += 4;
				lvlSound.play();
				gameLevel++;
				level.innerText = gameLevel;
			}
			if (game.gameScore === 2000) {
				game.speed += 5;
				lvlSound.play();
				gameLevel++;
				level.innerText = gameLevel;
			}
			if (game.gameScore === 2500) {
				game.speed += 5;
				lvlSound.play();
				gameLevel++;
				level.innerText = gameLevel;
			}
			if (game.gameScore === 3000) {
				game.speed += 15;
				lvlSound.play();
				level.innerText = 'Final Level';
			}
		}
	},
	// The moveSnake method is tied to event listeners to direct the snake to its next position ======================================================================================================
	moveSnake(event) {
		if (event.key === 'ArrowUp' || event.key === 'w') {
			//the nested conditional if statement prevents our snake from turning in on itself
			if (game.yVelocity === 1) {
				return;
			}
			game.yVelocity = -1;
			game.xVelocity = 0;
		}
		if (event.key === 'ArrowDown' || event.key === 's') {
			if (game.yVelocity === -1) {
				return;
			}
			game.yVelocity = 1;
			game.xVelocity = 0;
		}
		if (event.key === 'ArrowLeft' || event.key === 'a') {
			if (game.xVelocity === 1) {
				return;
			}
			game.yVelocity = 0;
			game.xVelocity = -1;
		}
		if (event.key === 'ArrowRight' || event.key === 'd') {
			if (game.xVelocity === -1) {
				return;
			}
			game.yVelocity = 0;
			game.xVelocity = 1;
		}
	},
	init() {
		game.gameScore = 0;
		game.speed = 5;
		game.blockSize = 18;
		game.gameGridArea = 20;
		game.headX = 10;
		game.headY = 10;
		game.snakeBody = [];
		game.tailLength = 0;
		game.fruitX = 5;
		game.fruitY = 5;
		game.fruitRandomizerX = 17;
		game.fruitRandomizerY = 23;
		game.xVelocity = 0;
		game.yVelocity = 0;

		score.innerText = 0;
		modalScore.innerText = 0;
		gameLevel = 1;
		level.innerText = gameLevel;
		game.gameOver = false;
		game.runGame()
	},
	//here is where the game will run all the methods listed above.
	runGame() {
		gameSound.play();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		game.changeSnakePosition();
		game.isGameOver();
		//using a truthy statement to end the loop
		if (game.gameOver) {
			gameOverSound.play();
			modal.classList.toggle('hide');
			modalText.classList.remove('hide')
			restartBtn.classList.remove('hide');
			startBtn.classList.add('hide')
			return;
		}
		//the only win state
		if (game.gameScore === 3100) {
			modal.classList.remove('hide')
			modalText.innerText = 'You Win!'
			modalText.classList.remove('hide')
			return;
		}
		modal.classList.add('hide');
		game.checkFruitCollision();
		game.drawSnake();
		game.drawFruit();
		setTimeout(game.runGame, 1000 / game.speed);
	},
};

document.body.addEventListener('keydown', game.moveSnake);
