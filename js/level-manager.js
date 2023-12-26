const BASE_URL = `${/(.*)\//.exec(window.document.location.href)[0]}`;

class LevelManager {
	constructor() {
		this.elements = [[]];
	}

	/* PUBLIC */

	// Get the exact level matrix
	getLevel(difficulty, callback) {
		const url = this.urls[difficulty];
		this.fetchLevel(`${BASE_URL}/matrices/${url}`, () => {
			this.initializeElementsArray(this.matrix.length, this.matrix[0].length);
			this.generateLevelElements(this.matrix);

			// Call the callback with the generated elements
			callback && callback(this.elements);
		});
	}

	/* PRIVATE */

	initializeElementsArray(rows, cols) {
		this.elements = new Array(rows)
			.fill([])
			.map(() => new Array(cols).fill(null));
	}

	// Generate all level elements
	generateLevelElements(matrix) {
		for (let row = 0; row < matrix.length; row++) {
			for (let el = 0; el < matrix[row].length; el++) {
				const value = matrix[row][el];
				const url = this.findUrlById(value);

				let newEl = PIXI.Sprite.from(`${BASE_URL + url}`);
				newEl.type = value;

				if (value === this.enums.border.id || value === this.enums.cell.id) {
					newEl.alpha = 0;
				}

				if (
					(row === 1 || row === matrix.length - 2) &&
					[4, 5, 6, 7].includes(value)
				) {
					newEl.alpha = 0.7;
				}

				this.elements[row][el] = newEl;
				newEl.row = row;
				newEl.col = el;
				newEl.initRow = row;
				newEl.initCol = el;
				newEl.position.set(127 + el * TILE_SIZE, 34 + row * TILE_SIZE);
			}
		}
		console.table(this.elements.map(el => el.map(el2 => el2.type)));
	}
	// Find the level element by its ID
	findUrlById(id) {
		for (const spriteType in this.enums) {
			const sprite = this.enums[spriteType];

			if (sprite.id === id) {
				return sprite.url;
			}
		}
		console.error(
			`Incorrect the element ID - ${id}. Failed to find it in enums array`
		);
		return null;
	}
	fetchLevel(path, callback) {
		var req = new XMLHttpRequest();
		req.overrideMimeType('application/json');
		req.open('GET', path, true);
		req.onload = () => {
			if (req.status === 200) {
				this.matrix = JSON.parse(req.responseText);
				callback && callback();
			} else {
				console.error(
					`Failed to fetch data from ${path}. Status: ${req.status}`
				);
			}
		};
		req.onerror = () => {
			console.error(`Network error while trying to fetch data from ${path}`);
		};
		req.send(null);
	}
}
