const TILE_SIZE = 70

// Init the game start
const game = new Game()
game.start()

// Mouse listeners
game.app.view.addEventListener('mousedown', game.handleMouseDown.bind(game))
game.app.view.addEventListener('mouseup', game.handleMouseUp.bind(game))
game.app.view.addEventListener('mousemove', game.handleMouseMove.bind(game))

// Menu listener
document
	.querySelector('#menu-elements')
	.addEventListener('click', game.menuController.bind(game))

// Game over listener
document.querySelector('.game-over').addEventListener('click', function () {
	this.style.display = 'none'
})

document
	.querySelector('.greeting-banner span')
	.addEventListener('click', function () {
		game.startGame()
		this.parentNode.style.display = 'none'
	})
