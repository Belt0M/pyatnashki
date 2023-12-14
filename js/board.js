import { TILE_SIZE } from '../variables/tile-size.js'
import board from '/matrices/board.json' assert { type: 'json' }

export class Board {
	constructor() {
		this.matrix = board
		this.elements = []
	}

	// Generate common board structure
	generateBoard() {
		const matrix = this.matrix
		for (let row = 0; row < matrix.length; row++) {
			for (let el = 0; el < matrix[row].length; el++) {
				const value = matrix[row][el]
				let newEl

				if (typeof value === 'string') {
					newEl = PIXI.Sprite.from(`/assets/sprites/${value}.png`)
					newEl.alpha = 0.5
				} else {
					switch (value) {
						case 1:
							newEl = PIXI.Sprite.from(`/assets/sprites/cell.png`)
							break
						case 0:
							newEl = PIXI.Sprite.from(`/assets/sprites/main.png`)
							newEl.alpha = 0
							break
					}
				}

				if (newEl) {
					newEl.type = value
					newEl.position.set(125 + el * TILE_SIZE, 55 + row * TILE_SIZE)
					this.elements.push(newEl)
				}
			}
		}
	}
}
