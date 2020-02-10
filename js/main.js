const web = {
	init: function() {
		const startScreen = document.getElementById('startScreen');
		const boardScreen = document.getElementById('gameBoard');
		const boardContainer = document.getElementById('gameGrid');
		const board = document.querySelector('.grid-container');
		const boardFields = document.querySelectorAll('.item');
		const avatars1 = document.querySelectorAll('.avatars1 .avatar');
		const avatars2 = document.querySelectorAll('.avatars2 .avatar');
		const player1OnBoard = document.querySelector('.player1-container');
		const player2OnBoard = document.querySelector('.player2-container');
		const scoreTurnInfo = document.querySelector('.score-turn');
		const score = document.querySelector('#score');

		const soundPlayer1 = document.querySelector('audio.whoomp');
		const soundPlayer2 = document.querySelector('audio.wheemp');
		const soundEnd = document.querySelector('audio.tada');

		const p1inp = document.getElementById('player1Name');
		const p2inp = document.getElementById('player2Name');

		const play = document.getElementById('play');
		const newGameBtn = document.getElementById('newGame');
		const restartGameBtn = document.getElementById('restartGame');

		const turn = document.getElementById('turn');
		const name1 = document.querySelector('.player-1-name');
		const name2 = document.querySelector('.player-2-name');
		const player1scoreTxt = document.getElementById('player-1-score');
		const player2scoreTxt = document.getElementById('player-2-score');

		let currentTurn;
		let stamp = 0;
		let player1score = 0;
		let player2score = 0;

		const randomStamp = function() {
			let radom13chars = () => Math.random().toString(16).substring(2, 15);
			let loops = Math.ceil(8 / 13);
			return new Array(loops)
				.fill(radom13chars)
				.reduce((string, func) => {return string + func()}, '')
				.substring(0, 8);
		};

		const renderLastGames = function() {
			const lastGames =
				JSON.parse(localStorage.getItem('last games')) || [];
			if (!lastGames.length) return;
			const infoBlock = document.querySelector('.info-block');
			infoBlock.innerHTML = '<p>Last games:</p>';
			lastGames.map(game => {
				const info = document.createElement('p');
				info.textContent = game.info;
				infoBlock.appendChild(info);
			});
		};

		const saveGame = function() {
			const lastGames = JSON.parse(localStorage.getItem('last games')) || [];
			const gameInfo = `${name1.textContent} (${player1scoreTxt.textContent} pts) : (${player2scoreTxt.textContent} pts) ${name2.textContent}`;
			if (lastGames.length > 0 && lastGames[0].stamp === stamp) {
				lastGames[0].info = gameInfo;
				localStorage.setItem('last games', JSON.stringify(lastGames));
				return;
			}
			lastGames.unshift({stamp, info: gameInfo});
			if (lastGames.length > 3) lastGames.pop();
			localStorage.setItem('last games', JSON.stringify(lastGames));
		};

		const validName = function(name) {
			return name && name.length >= 3 && name.length <= 10;
		};

		const showNameAlert = function(nameInput) {
			const playerBox = nameInput.parentNode.parentNode;
			if (playerBox.querySelector('.alert')) return;

			const alertBox = document.createElement('div');
			alertBox.innerHTML =
				'<p>Enter valid name between 3 and 10 characters.</p>';
			alertBox.className = 'alert';
			playerBox.appendChild(alertBox);
		};

		const clearNameAlert = function(nameInput) {
			const playerBox = nameInput.parentNode.parentNode;
			const alertBox = playerBox.querySelector('.alert');
			if (alertBox) playerBox.removeChild(alertBox);
		};

		const validField = function(field) {
			return (
				!field.classList.contains('icon-x') &&
				!field.classList.contains('icon-o')
			);
		};

		const lockBoard = function() {
			boardFields.forEach(field =>
				field.removeEventListener('click', pickField)
			);
			boardFields.forEach(field => field.classList.remove('unlocked'));
		};

		const restartBoard = function() {
			board.style.display = 'grid';
			boardFields.forEach(field => {
				field.classList.remove('icon-o');
				field.classList.remove('icon-x');
			});
			player1OnBoard.style.display = 'grid';
			player2OnBoard.style.display = 'grid';
			scoreTurnInfo.style.display = 'flex';
			const winAlert = document.querySelector('.winnerScreen');
			if (winAlert) winAlert.remove();
			const drawAlert = document.querySelector('.drawScreen');
			if (drawAlert) drawAlert.remove();
		};

		const unlockBoard = function() {
			boardFields.forEach(field =>
				field.addEventListener('click', pickField)
			);
			boardFields.forEach(field => field.classList.add('unlocked'));
		};

		const switchToBoard = function() {
			startScreen.style.display = 'none';
			boardScreen.style.display = 'flex';
		};

		const switchToStart = function() {
			startScreen.style.display = 'flex';
			boardScreen.style.display = 'none';
		};

		const drawTurn = function() {
			currentTurn = Boolean(Math.floor(Math.random() * 2));
			turn.innerHTML = `${
				currentTurn ? p2inp.value : p1inp.value
			}'s turn.`;
			score.style.color = currentTurn ? '#b5ead3' : '#FD8328';
		};

		const changeTurn = function() {
			currentTurn = !currentTurn;
			turn.innerHTML = `${
				currentTurn ? p2inp.value : p1inp.value
			}'s turn.`;
			score.style.color = currentTurn ? '#b5ead3' : '#FD8328';
		};

		const pickAvatar1 = function(e) {
			const imgSrc = getComputedStyle(e.target).backgroundImage;
			const userAvatar = document.getElementById('player-1-avatar');
			userAvatar.style.backgroundImage = imgSrc;
		};

		const pickAvatar2 = function(e) {
			const imgSrc = getComputedStyle(e.target).backgroundImage;
			const userAvatar = document.getElementById('player-2-avatar');
			userAvatar.style.backgroundImage = imgSrc;
		};

		const run = function() {
			if (!validName(p1inp.value)) {
				showNameAlert(p1inp);
				return;
			}
			clearNameAlert(p1inp);

			if (!validName(p2inp.value)) {
				showNameAlert(p2inp);
				return;
			}
			clearNameAlert(p2inp);

			name1.innerText = p1inp.value;
			name2.innerText = p2inp.value;
			player1scoreTxt.innerText = player1score;
			player2scoreTxt.innerText = player2score;
			stamp = randomStamp();
			drawTurn();
			switchToBoard();
			unlockBoard();
		};

		const drawLine = function(combination) {
			const combClass = `combination-${combination}`;
			const line = document.createElement('div');
			line.classList.add('winning-line');
			line.classList.add(combClass);
			boardContainer.appendChild(line);

			setTimeout(() => {
				boardContainer.removeChild(line);
			}, 2000);
		};

		const winOrDraw = function() {
			const winningCombinations = [
				[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
				[1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6],
			];
			const xMoves = [];
			const oMoves = [];
			let result = null;

			boardFields.forEach((field, index) => {
				if (field.classList.contains('icon-x')) {
					xMoves.push(index);
				} else if (field.classList.contains('icon-o')) {
					oMoves.push(index);
				}
			});

			winningCombinations.map(combination => {
				if (combination.every(index => xMoves.includes(index))) {
					result = ['win-X', combination.join('')];
				} else if (combination.every(index => oMoves.includes(index))) {
					result = ['win-O', combination.join('')];
				}
			});
			if (xMoves.length + oMoves.length == boardFields.length) {
				result = 'draw';
			}
			return result;
		};

		function showWinner(winner) {
			board.style.display = 'none';
			scoreTurnInfo.style.display = 'none';
			winner === 'win-X'
				? (player2OnBoard.style.display = 'none')
				: (player1OnBoard.style.display = 'none');
			const winnerScreen = document.createElement('div');
			winnerScreen.className = 'winnerScreen';
			winnerScreen.innerHTML = 'Winner!';
			boardContainer.insertBefore(
				winnerScreen,
				boardContainer.firstChild
			);
		}

		function showDraw() {
			board.style.display = 'none';
			const drawScreen = document.createElement('div');
			drawScreen.className = 'winnerScreen';
			drawScreen.innerHTML = 'Draw!';
			boardContainer.insertBefore(drawScreen, boardContainer.firstChild);
		}

		const newGame = function() {
			restartBoard();
			renderLastGames();
			switchToStart();
			player1score = 0;
			player2score = 0;
			name1.innerText = 0;
			name2.innerText = 0;
			p1inp.value = '';
			p2inp.value = '';
		};

		const restartGame = function() {
			restartBoard();
			unlockBoard();
			drawTurn();
		};

		const pickField = function(e) {
			if (!validField(e.target)) return;
			currentTurn ? soundPlayer2.play() : soundPlayer1.play();
			soundPlayer1.currentTime = 0;
			soundPlayer2.currentTime = 0;
			e.target.classList.add(currentTurn ? 'icon-o' : 'icon-x');
			e.target.classList.remove('unlocked');

			const result = winOrDraw();
			if (Array.isArray(result)) {
				lockBoard();
				drawLine(result[1]);
				soundEnd.play();
				if (result[0] === 'win-X') {
					player1score++;
					player1scoreTxt.innerText = player1score;
				} else {
					player2score++;
					player2scoreTxt.innerText = player2score;
				}
				saveGame();
				setTimeout(() => {
					showWinner(result[0]);
				}, 2000);
				return;
			} else if (result) {
				lockBoard();
				saveGame();
				setTimeout(() => {
					showDraw();
				}, 1000);
				return;
			}
			changeTurn();
		};

		renderLastGames();
		avatars1.forEach(avatar =>
			avatar.addEventListener('click', pickAvatar1)
		);
		avatars2.forEach(avatar =>
			avatar.addEventListener('click', pickAvatar2)
		);
		play.addEventListener('click', run);
		newGameBtn.addEventListener('click', newGame);
		restartGameBtn.addEventListener('click', restartGame);
	},
};
