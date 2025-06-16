function redirectToGameMode() {
    const select = document.getElementById('mode');
    const selectedValue = select.value;
    if (selectedValue) {
        window.location.href = selectedValue;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const gameBoard = document.querySelector('.game-board');
    const square = document.querySelector('.squre');
    const fly = document.querySelector('.fly');
    const ground = document.querySelector('.bottom-img');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const tapBtn = document.getElementById('tapBtn');
    const restartBtn = document.getElementById('restartBtn');
    const scoreValue = document.getElementById('scoreValue');
    const finalScore = document.getElementById('finalScore');
    const gameOverScreen = document.querySelector('.game-over');
    const column1 = document.querySelector('.column');
    const column2 = document.querySelector('.column2');
    
    // Ensure clones have correct classes
    const column1Clone = column1.cloneNode(true);
    const column2Clone = column2.cloneNode(true);
    column1Clone.classList.remove('column2');
    column1Clone.classList.add('column');
    column2Clone.classList.remove('column');
    column2Clone.classList.add('column2');

    const columnWidth = 85;
    const fixedGap = 500;
    column1.style.left = '1251px';
    column2.style.left = (1251 + fixedGap) + 'px';
    column1Clone.style.left = (1251 + fixedGap * 2) + 'px';
    column2Clone.style.left = (1251 + fixedGap * 3) + 'px';
    gameBoard.appendChild(column1Clone);
    gameBoard.appendChild(column2Clone);

    let isGameRunning = false;
    let isPaused = false;
    let animationId;
    const scrollSpeed = 2;
    let currentNumber = 1;
    let squareNumber = 1;
    let score = 0;
    let velocity = 0;
    const gravity = 0.5;
    const jumpForce = -12;
    let position = 151;
    const groundHeight = ground.offsetHeight;
    const columnSequence = [1, 2, 4, 8, 16, 32, 64, 128];
    let sequenceIndex = 0;

    const numberDisplay = square.querySelector('.no');
    numberDisplay.textContent = squareNumber;
    scoreValue.textContent = score;

    function assignNumbers(column) {
        const middleDivs = column.classList.contains('column') ? 
            [column.querySelector('.div2'), column.querySelector('.div3'), 
             column.querySelector('.div4'), column.querySelector('.div5')] :
            [column.querySelector('.div9'), column.querySelector('.div10'), 
             column.querySelector('.div12'), column.querySelector('.div13')];
        
        middleDivs.forEach(div => div.textContent = '');
        const randomIndex = Math.floor(Math.random() * 4);
        const number = columnSequence[sequenceIndex];
        middleDivs[randomIndex].textContent = number;
        console.log(`Assigned ${number} to ${column.classList.contains('column') ? 'column' : 'column2'} at index ${randomIndex}, sequenceIndex: ${sequenceIndex}`);
        sequenceIndex = (sequenceIndex + 1) % columnSequence.length;
    }

    function initializeNumbers() {
        console.log('Initializing numbers...');
        sequenceIndex = 0;
        assignNumbers(column1); // Assigns 1
        assignNumbers(column2); // Assigns 2
        assignNumbers(column1Clone); // Assigns 4
        assignNumbers(column2Clone); // Assigns 8
    }

    initializeNumbers();

    function jump() {
        if (isGameRunning && !isPaused) {
            velocity = jumpForce;
            console.log('Jump triggered');
        }
    }

    function checkCollision(square, column) {
        const squareRect = square.getBoundingClientRect();
        const middleDivs = column.classList.contains('column') ?
            [column.querySelector('.div2'), column.querySelector('.div3'), 
             column.querySelector('.div4'), column.querySelector('.div5')] :
            [column.querySelector('.div9'), column.querySelector('.div10'), 
             column.querySelector('.div12'), column.querySelector('.div13')];
        
        for (const div of middleDivs) {
            if (div.textContent !== '') {
                const divRect = div.getBoundingClientRect();
                const collision = !(
                    squareRect.right < divRect.left ||
                    squareRect.left > divRect.right ||
                    squareRect.bottom < divRect.top ||
                    squareRect.top > divRect.bottom
                );
                if (collision) {
                    const divNumber = parseInt(div.textContent);
                    if (divNumber === squareNumber) {
                        squareNumber *= 2;
                        score += squareNumber;
                        numberDisplay.textContent = squareNumber;
                        scoreValue.textContent = score;
                        div.textContent = '';
                        square.classList.add('success');
                        setTimeout(() => square.classList.remove('success'), 200);
                    } else {
                        endGame('Collected number does not match.');
                    }
                    break;
                }
            }
        }
    }

    function gameLoop() {
        if (!isGameRunning || isPaused) return;
        velocity += gravity;
        position += velocity;
        square.style.top = position + 'px';
        if (position < 0) {
            position = 0;
            velocity = 0;
        }
        const squareBottom = position + square.offsetHeight;
        const groundTop = gameBoard.offsetHeight - groundHeight;
        if (squareBottom > groundTop) {
            position = groundTop - square.offsetHeight;
            velocity = 0;
            square.classList.add('on-ground');
            endGame('Hit the ground.');
        } else {
            square.classList.remove('on-ground');
        }
        const rotation = Math.min(Math.max(velocity * 3, -30), 30);
        fly.style.transform = `rotate(${rotation}deg)`;
        const columns = [column1, column2, column1Clone, column2Clone];
        let maxLeft = -Infinity;
        let rightmostColumn = null;
        columns.forEach(col => {
            const currentLeft = parseInt(col.style.left) || parseInt(getComputedStyle(col).left);
            if (currentLeft > maxLeft) {
                maxLeft = currentLeft;
                rightmostColumn = col;
            }
        });
        columns.forEach((col) => {
            const currentLeft = parseInt(col.style.left) || parseInt(getComputedStyle(col).left);
            col.style.left = (currentLeft - scrollSpeed) + 'px';
            checkCollision(square, col);
            if (currentLeft + columnWidth < 0) {
                col.style.left = (maxLeft + columnWidth + fixedGap) + 'px';
                col.classList.add('fade-in');
                setTimeout(() => col.classList.remove('fade-in'), 300);
                assignNumbers(col);
                console.log(`Column reset, new left: ${col.style.left}, next number: ${columnSequence[sequenceIndex]}`);
            }
        });
        animationId = requestAnimationFrame(gameLoop);
    }

    function startGame() {
        if (!isGameRunning) {
            console.log('Starting game...');
            isGameRunning = true;
            isPaused = false;
            startBtn.style.display = 'none';
            gameOverScreen.style.display = 'none';
            squareNumber = 1;
            score = 0;
            sequenceIndex = 0;
            numberDisplay.textContent = squareNumber;
            scoreValue.textContent = score;
            position = 151;
            velocity = 0;
            square.style.top = position + 'px';
            column1.style.left = '1251px';
            column2.style.left = (1251 + fixedGap) + 'px';
            column1Clone.style.left = (1251 + fixedGap * 2) + 'px';
            column2Clone.style.left = (1251 + fixedGap * 3) + 'px';
            initializeNumbers();
            gameLoop();
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            tapBtn.disabled = false;
            pauseBtn.textContent = 'Pause';
        }
    }

    function endGame(message) {
        console.log(`Game over: ${message}`);
        isGameRunning = false;
        cancelAnimationFrame(animationId);
        gameOverScreen.style.display = 'flex';
        finalScore.textContent = score;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        tapBtn.disabled = true;
    }

    function togglePause() {
        if (isGameRunning) {
            if (isPaused) {
                isPaused = false;
                pauseBtn.textContent = 'Pause';
                tapBtn.disabled = false;
                gameLoop();
            } else {
                isPaused = true;
                pauseBtn.textContent = 'Resume';
                tapBtn.disabled = true;
                cancelAnimationFrame(animationId);
            }
        }
    }

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    tapBtn.addEventListener('click', jump);
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            event.preventDefault();
            jump();
        }
    });

    tapBtn.disabled = true;
});