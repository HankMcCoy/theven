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

	// Put player 1's top pieces down
	for (let col = 2; col < BOARD_SIZE - 2; col++) {
		board[col % 2][col] = PLAYER_1
	}
	// Put player 1's bottom pieces down
	for (let col = 2; col < BOARD_SIZE - 2; col++) {
		board[BOARD_SIZE - (col % 2 ? 1 : 2)][col] = PLAYER_1
	}
	// Put player 2's left pieces down
	for (let row = 2; row < BOARD_SIZE - 2; row++) {
		board[row][row % 2 ? 0 : 1] = PLAYER_1
	}
	// Put player 2's right pieces down
	for (let row = 2; row < BOARD_SIZE - 2; row++) {
		board[row][BOARD_SIZE - (row % 2 ? 2 : 1)] = PLAYER_1
	}
	return board
}

function isBlack(row, col) {
	return (row % 2) !== (col % 2)
}

function render({ board, targetEl, selectedCell, availableMoveCells }) {
	let html = ''
	const square = ({ isBlack }) => (row, col) => {
		const token = isBlack ? 'X' : 'O'
		const isSelected = selectedCell && selectedCell.row === row && selectedCell.col === col
		const isAvailableMove = availableMoveCells && availableMoveCells
			.filter(availableMove => availableMove.row === row && availableMove.col === col)
			.length

		return `
			<div
				class="cell ${isBlack ? 'cell--black' : ''}
					${isSelected ? 'cell--selected' : ''}
					${isAvailableMove ? 'cell--available' : ''}"
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

function getAvailableMoveCells(board, selectedRow, selectedCol) {
	const isWithinBoard = ({ row, col }) => (
		row >= 0 && row < BOARD_SIZE &&
		col >= 0 && col < BOARD_SIZE
	)
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
	const board = createBoard()
	const targetEl = document.querySelector('#main')
	let selectedCell = undefined
	let availableMoveCells
	let curPlayer = PLAYER_1

	const isCurPlayerCell = (row, col) =>
		(curPlayer === PLAYER_1 && isBlack(row, col)) ||
		(curPlayer === PLAYER_2 && !isBlack(row, col))

	render({ board, targetEl, selectedCell })
	targetEl.addEventListener('click', (event) => {
		/*
		 * Check 4 potentional move squares (-1,-1) (-1,1) (1,1) (-1,-1) for occupation, make unoccupied green highlight
		 * on click, check that move is valid and, if so, remove piece from original space
		 * and replace in new space
		 */
		const row = parseInt(event.target.dataset.row)
		const col = parseInt(event.target.dataset.col)
		if (isCurPlayerCell(row, col) && board[row][col]) {
			selectedCell = {
				row,
				col,
			}

			availableMoveCells = getAvailableMoveCells(board, row, col)
		}

		render({ board, targetEl, selectedCell, availableMoveCells })
	})

	window.board = board
}

play()

// Put some pieces down
//
// Eventually like… let you click and shit
//
