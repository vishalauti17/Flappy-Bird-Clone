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
            const stopBtn = document.getElementById('stopBtn');
            const column1 = document.querySelector('.column');
            const column2 = document.querySelector('.column2');
            const column1Clone = column1.cloneNode(true);
            const column2Clone = column2.cloneNode(true);
            const columnWidth = 85;
            const gapBetweenColumns = 755 - 255 - columnWidth;
            column1Clone.style.left = (755 + gapBetweenColumns + columnWidth) + 'px';
            column2Clone.style.left = (755 + gapBetweenColumns + columnWidth + 500) + 'px';
            gameBoard.appendChild(column1Clone);
            gameBoard.appendChild(column2Clone);
            let isGameRunning = false;
            let animationId;
            const scrollSpeed = 2;
            let currentNumber = 1; // Start with 1 for columns
            let squareNumber = 1; // Number on the square (bird)
            let velocity = 0;
            const gravity = 0.5;
            const jumpForce = -12;
            let position = 151;
            const groundHeight = ground.offsetHeight;

            // Update the square's number display
            const numberDisplay = square.querySelector('.no');
            numberDisplay.textContent = squareNumber;

            function assignNumbers(column, isFirstColumn, number) {
                const middleDivs = isFirstColumn ? 
                    [column.querySelector('.div2'), column.querySelector('.div3'), 
                     column.querySelector('.div4'), column.querySelector('.div5')] :
                    [column.querySelector('.div9'), column.querySelector('.div10'), 
                     column.querySelector('.div12'), column.querySelector('.div13')];
                // Explicitly clear all divs
                middleDivs.forEach(div => div.textContent = '');
                // Assign number to one random div
                const randomIndex = Math.floor(Math.random() * 4);
                middleDivs[randomIndex].textContent = number;
            }

            // Initialize numbers
            assignNumbers(column1, true, 1);
            assignNumbers(column2, false, 2);
            assignNumbers(column1Clone, true, 1);
            assignNumbers(column2Clone, false, 2);

            function jump() {
                if (isGameRunning) {
                    velocity = jumpForce;
                }
            }

            square.addEventListener('click', jump);
            document.addEventListener('keydown', function(event) {
                if (event.code === 'Space') {
                    event.preventDefault();
                    jump();
                }
            });

            function checkCollision(square, column) {
                const squareRect = square.getBoundingClientRect();
                const columnRect = column.getBoundingClientRect();
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
                                numberDisplay.textContent = squareNumber;
                                div.textContent = '';
                            } else {
                                stopGame();
                                alert('Game Over! Collected number does not match.');
                            }
                            break;
                        }
                    }
                }
            }

            function gameLoop() {
                if (!isGameRunning) return;
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
                    stopGame();
                    alert('Game Over! Hit the ground.');
                } else {
                    square.classList.remove('on-ground');
                }
                const rotation = Math.min(Math.max(velocity * 3, -30), 30);
                fly.style.transform = `rotate(${rotation}deg)`;
                const columns = [column1, column2, column1Clone, column2Clone];
                columns.forEach((col, index) => {
                    const currentLeft = parseInt(col.style.left) || parseInt(getComputedStyle(col).left);
                    col.style.left = (currentLeft - scrollSpeed) + 'px';
                    checkCollision(square, col);
                    if (currentLeft + columnWidth < 0) {
                        const isFirstColumn = col === column1 || col === column1Clone;
                        const partnerCol = isFirstColumn ? 
                            (col === column1 ? column1Clone : column1) : 
                            (col === column2 ? column2Clone : column2);
                        const partnerLeft = parseInt(partnerCol.style.left) || parseInt(getComputedStyle(partnerCol).left);
                        col.style.left = (partnerLeft + 500) + 'px';
                        const prevCol = index > 0 ? columns[index - 1] : columns[columns.length - 1];
                        const prevDivs = index % 2 === 0 ? 
                            [prevCol.querySelector('.div9'), prevCol.querySelector('.div10'), 
                             prevCol.querySelector('.div12'), prevCol.querySelector('.div13')] :
                            [prevCol.querySelector('.div2'), prevCol.querySelector('.div3'), 
                             prevCol.querySelector('.div4'), prevCol.querySelector('.div5')];
                        const prevNumber = parseInt(prevDivs.find(div => div.textContent !== '')?.textContent || currentNumber);
                        currentNumber = prevNumber * 2;
                        assignNumbers(col, isFirstColumn, currentNumber);
                    }
                });
                animationId = requestAnimationFrame(gameLoop);
            }

            function startGame() {
                if (!isGameRunning) {
                    isGameRunning = true;
                    startBtn.style.display = 'none';
                    squareNumber = 1;
                    numberDisplay.textContent = squareNumber;
                    currentNumber = 1;
                    assignNumbers(column1, true, 1);
                    assignNumbers(column2, false, 2);
                    assignNumbers(column1Clone, true, 1);
                    assignNumbers(column2Clone, false, 2);
                    gameLoop();
                    startBtn.disabled = true;
                    stopBtn.disabled = false;
                }
            }

            function stopGame() {
                isGameRunning = false;
                cancelAnimationFrame(animationId);
                startBtn.style.display = 'block';
                startBtn.disabled = false;
                stopBtn.disabled = true;
            }

            startBtn.addEventListener('click', startGame);
            stopBtn.addEventListener('click', stopGame);
            stopBtn.disabled = true;
        });