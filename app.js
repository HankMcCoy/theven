// Make the board visually
const BOARD_SIZE = 8
const SQUARE_SIZE = 200

// Player 1 plays exclusively on black
const PLAYER_1 = 'X'
const PLAYER_2 = 'O'

function createBoard() {
	const board = new Array(BOARD_SIZE).fill('').map(() => [])

	for (let i = 0; i < BOARD_SIZE; i++) {
		for (let j = 0; j < BOARD_SIZE; j++) {
			board[i][j] = undefined
		}
	}

	for (let col = 2; col < BOARD_SIZE - 2; col++) {
		board[col % 2][col] = PLAYER_2
	}
	for (let col = 2; col < BOARD_SIZE - 2; col++) {
		board[BOARD_SIZE - (col % 2 ? 1 : 2)][col] = PLAYER_2
	}
	for (let row = 2; row < BOARD_SIZE - 2; row++) {
		board[row][row % 2 ? 0 : 1] = PLAYER_1
	}
	for (let row = 2; row < BOARD_SIZE - 2; row++) {
		board[row][BOARD_SIZE - (row % 2 ? 2 : 1)] = PLAYER_1
	}
	return board
}

function isBlack(row, col) {
	return (row % 2) !== (col % 2)
}

function render({ board, targetEl, selectedCell, isAvailableMove }) {
	let html = ''
	const square = ({ isBlack }) => (row, col) => {
		const token = isBlack ? 'X' : 'O'
		const isSelected = selectedCell && selectedCell.row === row && selectedCell.col === col

		return `
			<div
				class="cell ${isBlack ? 'cell--black' : ''}
					${isSelected ? 'cell--selected' : ''}
					${isAvailableMove(row, col) ? 'cell--available' : ''}"
				data-row="${row}"
				data-col="${col}"
			>
				${board[row][col] ? token : ''}
			</div>
		`
	}
	const blackSquare = square({ isBlack: true })
	const whiteSquare = square({ isBlack: false })

	for (let row = 0; row < BOARD_SIZE; row++) {
		html += '<div class="row">'
		for (let col = 0; col < BOARD_SIZE; col++) {
			html += isBlack(row, col) ?
				blackSquare(row, col) :
				whiteSquare(row, col)
		}
		html += "</div>"
	}

	targetEl.innerHTML = html
}

const isWithinBoard = ({ row, col }) => (
	row >= 0 && row < BOARD_SIZE &&
	col >= 0 && col < BOARD_SIZE
)
function getAvailableMoveCells(board, selectedRow, selectedCol) {
	const isUnoccupied = ({ row, col }) => !board[row][col]
	const offsets = [[-1, -1], [1, -1], [-1, 1], [1, 1]]
	const translateOffsetToCell = ([rowOffset, colOffset]) => ({
		row: selectedRow + rowOffset,
		col: selectedCol + colOffset,
	})

	const availableMoveCells = offsets
		.map(translateOffsetToCell)
		.filter(isWithinBoard)
		.filter(isUnoccupied)

	return availableMoveCells
}

function play() {
	let board = createBoard()
	const targetEl = document.querySelector('#main')
	let selectedCell = undefined
	let availableMoveCells = []
	let curPlayer = PLAYER_1

	const isCurPlayerCell = (row, col) =>
		(curPlayer === PLAYER_1 && isBlack(row, col)) ||
		(curPlayer === PLAYER_2 && !isBlack(row, col))
	const isAvailableMove = (row, col) => {
		return availableMoveCells.filter(move => move.row === row && move.col === col).length
	}

	render({ board, targetEl, isAvailableMove })
	targetEl.addEventListener('click', (event) => {
		/*
		 * Check 4 potentional move squares (-1,-1) (-1,1) (1,1) (-1,-1) for occupation, make unoccupied green highlight
		 * on click, check that move is valid and, if so, remove piece from original space
		 * and replace in new space
		 */
		const row = parseInt(event.target.dataset.row)
		const col = parseInt(event.target.dataset.col)
		if (isCurPlayerCell(row, col)) {
			if (board[row][col]) {
				selectedCell = {
					row,
					col,
				}

				availableMoveCells = getAvailableMoveCells(board, row, col)
			} else {
				if (isAvailableMove(row, col)) {
					board = makeMove({ board, row, col, curPlayer, selectedCell })
					curPlayer = curPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1
				}

				selectedCell = undefined
				availableMoveCells = []
			}
		} else {
			selectedCell = undefined
			availableMoveCells = []
		}

		render({ board, targetEl, selectedCell, isAvailableMove })
	})

	window.board = board
}

const get = (val, path) => {
	let result = val
	for (var i = 0; i < path.length; i++) {
		result = result[path[i]]

		if (!result) {
			return undefined
		}
	}

	return result
}

function makeMove({ board, row, col, selectedCell, curPlayer }) {
	// Move the piece
	board[selectedCell.row][selectedCell.col] = undefined
	board[row][col] = curPlayer

	// Check for a capture
	const offsets = [[-1, 0], [1, 0], [0, -1], [0, 1]]
	offsets.forEach(([rowOffset, colOffset]) => {
console.log([rowOffset, colOffset])
		const nextPiece = get(board, [row + rowOffset, col + colOffset])
console.log('next', nextPiece)
		const nextNextPiece = get(board, [row + 2 * rowOffset, col + 2 * colOffset])
console.log('nextNEXT', nextNextPiece)

		if (nextPiece && nextPiece !== curPlayer && nextNextPiece === curPlayer) {
console.log('CAPTURE')
			board[row + rowOffset][col + colOffset] = undefined
		}
	})

	return board
}

play()
