"use strict";

$(() => {
    game.initializeGame();
    console.log('jQuery is up and the DOM is loaded!');
});

const game = {
    title:          'Picture Perfect',
    isRunning:      false,
    currentScreen:  'Splash Screen',

    //Card variables
    cardFront:      ['photos/pic0', 'photos/pic1', 'photos/pic2', 'photos/pic3', 'photos/pic4', 'photos/pic5', 'photos/pic6', 'photos/pic7', 'photos/pic8', 'photos/pic9', 'photos/pic10', 'photos/pic11', 'photos/pic12', 'photos/pic13', 'photos/pic14', 'photos/pic15', 'photos/pic16', 'photos/pic17', 'photos/pic18', 'photos/pic19', 'photos/pic20', 'photos/pic21', 'photos/pic22', 'photos/pic23', 'photos/pic24', 'photos/pic25', 'photos/pic26', 'photos/pic27', 'photos/pic28', 'photos/pic29', 'photos/pic30', 'photos/pic31', 'photos/pic32', 'photos/pic33', 'photos/pic34'],
    cardBack:   'photos/card',
    fullDeck:       [],
    cardsSelected:  [],
    gameBoard:      $('#card-grid'),

    //Player variables
    scoreBoard:         $('#score-board'),
    playerNameInput:    $('.player-name-input'),
    isNameValid:        false,
    isModeSelected:     [false, false, false],
    numberOfPlayers:    0,
    playersTurn:        1,
    players:            [],
    tiedPlayers:        [],
    playerNamesArray:   [],

    //Time variables
    loopDuration:           100,
    gameTotalTime:          45000,
    gameTimeRemaining:      45000,
    percentTimeRemaining:   100,
    intervalID:             null,
    $numericDisplay:        $('#numericDisplay'),
    $timeBar:               $('#timeBar'),
    $mins:                  $('#mins'),
    $secs:                  $('#secs'),
    $tens:                  $('#tens'),
    
    initializeGame: () => {

        // These buttons were updated thoughout bug testing to reflect intended behaviour.

        // Button "on clicks"
        $('#play-now-button').on('click', ()       => { game.switchScreen('#mode-screen')});

        $('#play-game-button').on('click', ()      => { game.makePlayers();
                                                        game.activeMode(null)});

        $('#play-again-button').on('click', ()     => { game.switchScreen('#game-screen');
                                                        game.resetBoard();
                                                        game.resetTimer();
                                                        game.tiedPlayers = [];
                                                        $('#start-the-game-button').show()});

        $('#mode-quit-button').on('click', ()      => { game.switchScreen('#splash-screen');
                                                        game.resetName();
                                                        game.clearWarnings()});

        $('#game-quit-button').on('click', ()      => { game.switchScreen('#splash-screen');
                                                        game.resetTimer();
                                                        game.resetName();
                                                        $('#start-the-game-button').show();
                                                        game.isModeSelected = [false, false, false];
                                                        game.playerNamesArray = [];
                                                        game.clearWarnings()
                                                        $('button').removeClass('selected')});

        $('.game-help-button').on('click', ()      => { game.pauseTimer()}); 

        $('#end-quit-button').on('click', ()       => { game.switchScreen('#splash-screen');
                                                        game.resetName();
                                                        game.tiedPlayers = [];
                                                        game.isModeSelected = [false, false, false];
                                                        $('button').removeClass('selected')});

        $('#reset-button').on('click', ()          => { game.resetBoard();
                                                        game.resetTimer();
                                                        $('#start-the-game-button').show()});

        $('#start-the-game-button').on('click', () => { game.startTimer();
                                                        game.isRunning=true;
                                                        $('#start-the-game-button').hide();
                                                        game.clearWarnings();
                                                        game.activePlayer()});

        // Player name inputs showing on click of buttons.
        $('#single-player-button').on('click', ()  => { game.addPlayerName(1)});
        $('#double-player-button').on('click', ()  => { game.addPlayerName(2)});
        $('#triple-player-button').on('click', ()  => { game.addPlayerName(3)});
        $('#four-player-button').on('click', ()    => { game.addPlayerName(4)});

        // Deciding what size of deck, and what timer to run based on mode selection.
        $('#easy-button').on('click', ()           => { game.generateDeck(4);
                                                        game.setTimer('#easy-button');
                                                        game.activeMode(1)});

        $('#medium-button').on('click', ()         => { game.generateDeck(6);
                                                        game.setTimer('#medium-button');
                                                        game.activeMode(2)});

        $('#hard-button').on('click', ()           => { game.generateDeck(8);
                                                        game.setTimer('#hard-button');
                                                        game.activeMode(3)});

        $('#helpGameModal').on('hidden.bs.modal', function (e) {game.startTimer()});

        // Initializing the first screen to show is the splash screen.
        game.switchScreen('#splash-screen');
    },

    /**
     * Changes the screen based on the given string
     * If on the game screen it will add the generated deck of cards
     * @param {string} screen 
     */
    switchScreen(screen) {
        // console.log(screen);
        $('.screen').hide();
        $(screen).show();

        if (screen === '#splash-screen') {
            game.currentScreen= 'Splash Screen';

            $('#play-now-button').show();
            $('.how-to-button').show();

        } else if (screen === '#mode-screen') {
            game.currentScreen= 'Mode Screen';

            $('.mode-help-button').show();
            $('#mode-quit-button').show();

        } else if (screen === '#game-screen') {
            game.currentScreen= 'Game Screen';

            $('#game-over-button').show();
            $('.game-help-button').show();
            $('#game-quit-button').show();
            $('#reset-button').show();

            game.addDeck();

        } else if (screen === '#end-screen') {
            game.currentScreen= 'End Screen';

            $('#play-again-button').show();
            $('#end-quit-button').show();
        }
    },

    /**
     * Generates the deck of cards and puts them into the game parameter cardDeck.
     * @param {integer} size 
     */
    generateDeck (size) {
        const cardDeck = [];
        for (let i = 0; i < size; i++) {
            const card = new Card(game.cardFront[i], game.cardBack);
            cardDeck.push(card);
        }

        game.fullDeck = cardDeck.concat(cardDeck);
        game.shuffleCards();
    },
 
    /**
     * Shuffles the full deck of cards from the game parameter
     */
    shuffleCards () {
        const shuffledCards = [];
        while (game.fullDeck.length > 0) {
            const randomIndex = Math.floor(Math.random() * game.fullDeck.length);
            const cardReady = game.fullDeck.splice(randomIndex, 1);
            shuffledCards.push(cardReady[0]);
            // console.log('Cards shuffled');
        }
        game.fullDeck = shuffledCards;   
    },

    // Adds the deck of cards to the game screen
    addDeck () {
        game.gameBoard.html('');
        // Empties out the grid before adding in current set of cards!
        for (let i = 0; i < game.fullDeck.length; i++) {
            game.gameBoard.append(game.fullDeck[i].card);
        };
        game.hideCards(".cardFront");

        $('.card').on('click', (event) => {
            // console.log(event);
            game.flipCards(event.currentTarget);
        });
    },

    //Used to start the game with all cards flipped over.
    hideCards (card) {
        $(card).hide();
    },

    //Adds a new deck of shuffled cards and resets the score to 0.
    resetBoard () {
        game.addDeck();
        game.shuffleCards();

        for (let i = 0; i < game.players.length; i++) {
            game.players[i].score = 0;
            $(`#player-${i + 1}-score`).html(0);
        }
    },


    //  PLAYER METHODS  //

    
    /**
     * Generates the player objects and polls the html for the names the player input
     */
    makePlayers () {
        // console.log('Players made');
        
        game.scoreBoard.html('');
        for (let i = 1; i <= game.numberOfPlayers; i++) {

            const value = $(`#player-${i}-name`).val();
            game.playerNamesArray.push(value);
            // console.log(`${value}`);
            const player = new Player(value, 0, i);

            if (value <= 0 || value === undefined) {
                $('.player-name-alert').html(`Sorry... You need to fill in your name(s) first!`);
                game.players = [];
                game.playerNamesArray = [];

            } else if (value >= 0 && !(game.isModeSelected[0] === false && game.isModeSelected[1] === false && game.isModeSelected[2] === false)) {
                game.switchScreen('#game-screen');
            }
        }
    },

    /**
     * A helper method to get that checks whether there are valid names entered when the user tries to change to the game screen 
     * @returns 
     */
    areNamesValid () {
        if (game.players.length === 0) {
            return false; 
        }
        for (let i = 0; i < game.playerNamesArray.length; i++) {
            if(game.playerNamesArray[i] === undefined) {
                return false;
            }
        } return true; 
    },

    //Clears out the HTML if either alerts were previously shown
    clearWarnings () {
        $('.player-name-alert').html('');
        $('.player-mode-alert').html('');
    },

    //Adding player to the scoreboard
    addPlayer (oPlayer) {
        game.players.push(oPlayer);
        const playerNameDiv = `<div class='player-name'>${oPlayer.playerName}</div>`;
        const playerScoreDiv = `<div id="player-${oPlayer.playerNumber}-score" class='player-${oPlayer.playerNumber}-score'>${oPlayer.score}</div>`;
        const scoreBoardDiv = `<div id='player-${oPlayer.playerNumber}-${oPlayer.playerName}' class='score-board'>${playerNameDiv}${playerScoreDiv}</div>`;
        game.scoreBoard.append(scoreBoardDiv);
    },

    addPlayerName (numPlayers) {
        game.numberOfPlayers = numPlayers;
        game.playerNameInput.html('');

        //Creating players dynamically
        for (let i = 1; i <= numPlayers; i++) {
            const player = `<div id="player-${i}-name-input" class="player-${i}-name selection"><label for="player-${i}-name">Player ${i} Name:</label><input type="text" id="player-${i}-name" name="player-${i}-name" placeholder="Who is player ${i}?"></input></div>`;
            game.playerNameInput.append(player);
        }
    },

    // Used to highlight current player on the game screen.
    activePlayer () {  
        $('div.score-board').removeClass('active'); 
        const oPlayer = game.players[game.playersTurn-1];
        if (oPlayer) {
            $(`#player-${oPlayer.playerNumber}-${oPlayer.playerName}`).addClass('active');
        }
    },

    /**
     * Doesn't allow user to enter the game unless a mode has been selected, also visually highlights which mode is chosen
     * @param {integer} buttonClicked 
     */
    activeMode (buttonClicked) {
        if (buttonClicked != null) {
            for(let i = 0; i < game.isModeSelected.length; i++) {
                if (game.isModeSelected[i] === true && (buttonClicked - 1) != i) {
                    $(`.mode-select-${i + 1}`).removeClass('selected');
                    game.isModeSelected[buttonClicked - 1] = false;
                    console.log('removed');
                }   
            }
            $(`.mode-select-${buttonClicked}`).addClass('selected');
            game.isModeSelected[buttonClicked - 1] = true;
            console.log('added');
        } else if(!game.areNamesValid() && game.isModeSelected[0] === false && game.isModeSelected[1] === false && game.isModeSelected[2] === false) {
            $('.player-mode-alert').html(`Sorry... You need to select your game mode first!`);
            game.players = [];
            game.playerNamesArray = [];
        } else if (game.areNamesValid() && !(game.isModeSelected[0] === false && game.isModeSelected[1] === false && game.isModeSelected[2] === false)) {
            game.switchScreen('#game-screen');
        }
    },

    // Resets the names entered in the mode screen when players exit back to home screen, and clears out players array.
    resetName () {
        game.playerNameInput.html('');
        game.players = []; 
        game.playerNamesArray = []; 
    },

    //  GAME LOOP METHODS  //
    gameLoop () {
        game.gameTimeRemaining -= game.loopDuration;
        game.updateClock();
    },

    //Updates the time meter based on percent of time remaining
    updateMeter () {

        $('#timeBar').css('width', (game.percentTimeRemaining));

        if ((game.gameTimeRemaining / game.gameTotalTime) <= 0) {
            $('#timeBar').css('border-color', 'black');
        }

        if(game.percentTimeRemaining > 50) {
            $('#timeBar').css('background-color','#BDC696');
        } else if (game.percentTimeRemaining <= 25) {
            $('#timeBar').css('background-color','#E69B89');
        } else if (26 < game.percentTimeRemaining <= 50) {
            $('#timeBar').css('background-color','#cde6f5');
        }
    },

    //Updates the time clock to show time is remaining, if the time runs out it will end the game and take you to the end screen
    updateClock () {

        let minutesRemaining = Math.floor(game.gameTimeRemaining / 60000);
        let secondsRemaining = Math.floor ((game.gameTimeRemaining - minutesRemaining * 60000) / 1000);
        let milliRemaining = Math.floor(game.gameTimeRemaining - minutesRemaining * 60000 - secondsRemaining * 1000);

        if (minutesRemaining <10) {
            minutesRemaining = '0' + minutesRemaining;
        }

        if (secondsRemaining <10) {
            secondsRemaining = '0' + secondsRemaining;
        }

        if ((game.gameTimeRemaining / game.gameTotalTime) <= 0) {
            game.switchScreen('#end-screen');
            $('#start-the-game-button').show();
            game.decideWinner();
        }

        $('#mins').html(minutesRemaining);
        $('#secs').html(secondsRemaining);
        $('#tens').html(`${milliRemaining}`.charAt(0));
    },

    setIntervalID: () => {
        if (game.isRunning === false) {
            game.intervalID = setInterval(game.intervalFunction, game.loopDuration);
        }
    },

    intervalFunction: () => {
        game.gameTimeRemaining -= game.loopDuration;
        game.percentTimeRemaining = Math.floor(game.gameTimeRemaining / game.gameTotalTime * 100);

        if(game.gameTimeRemaining <= 0) {
            window.clearInterval(game.intervalID);
        }
        game.updateClock();
        game.updateMeter();
    },

    // Sets the amount of time based on the chosen mode
    setTimer: (button) => {
        game.gameTotalTime=45000;
        game.gameTimeRemaining=45000;
        game.isRunning=false;

        if (button === '#easy-button') {
            game.gameTotalTime = 45000;
            game.gameTimeRemaining = 45000;

        } else if (button === '#medium-button') {
            game.gameTotalTime = 60000;
            game.gameTimeRemaining = 60000;

        } else if (button === '#hard-button') {
            game.gameTotalTime = 75000;
            game.gameTimeRemaining = 75000;
        }
        game.updateClock();
        game.updateMeter();
    },

    //Starts the timer, also updates the border color to visially show timer is active
    startTimer: () => {
        // console.log('Timer Started');
        game.setIntervalID();
        game.isRunning= true;
        $('#timeBar').css('border-color', '#bc5b6c');
    },

    //Pauses timer
    pauseTimer: () => {
        // console.log('Timer Paused!');
        game.isRunning= false;
        clearInterval(game.intervalID);
        $('#timeBar').css('border-color','black');
    },

    //Resets the timer back to the amount of time based on setTimer()
    resetTimer: () => {
        // console.log('Timer Stopped!');
        game.isRunning= false;
        game.gameTimeRemaining=game.gameTotalTime;
        game.percentTimeRemaining=100;
        clearInterval(game.intervalID);
        game.updateClock();
        game.updateMeter();
        $('#timeBar').css('border-color','black');
    },


    //  GAMPLAY MECHANICS METHODS //

    //Flipping cards. If 2 have already been selected checks if the cards match.
    flipCards (target) {
        if (game.isRunning === true) {

            //Allow user to flip cards if less than 2 selected.
            if (game.cardsSelected.length < 2) {
                $(target).children('.cardBack').hide();
                $(target).children('.cardFront').show();
                if (!game.cardsSelected.includes(target)){
                    game.cardsSelected.push(target);
                    target.isFlipped = true;
                    target.isSelected = true;
                }
                
                //If 2 cards are selected, check if they match. When time is up point is scored if they match, or faces are flipped back over if they don't.
                if (game.cardsSelected.length === 2) {
                    setTimeout(game.runCheckMatch, 500); 
                }
            }
        }
    },

    /**
    * Checks if two card objects are a match
    * @param {*} oCard1 the first card object
    * @param {*} oCard2 the second card object
    */
    checkMatch (oCard1, oCard2) {

        if(oCard1.innerHTML === oCard2.innerHTML) {
            // console.log('running check match');
            $(oCard1).children('.cardBack').hide();
            $(oCard1).children('.cardFront').show(); 
            $(oCard2).children('.cardBack').hide();
            $(oCard2).children('.cardFront').show();
            game.updateScore(); 
            
        } else {
            // console.log('no match');
            $(oCard1).children('.cardBack').show();
            $(oCard1).children('.cardFront').hide(); 
            $(oCard2).children('.cardBack').show();
            $(oCard2).children('.cardFront').hide(); 

            if (game.playersTurn < game.numberOfPlayers) {
                game.playersTurn++;     
                
            } else {
                game.playersTurn = 1;
            }
            game.activePlayer();
        }
    }, 

    /**
     * Runs the checkmatch method
     */
    runCheckMatch () {
        game.checkMatch(game.cardsSelected[0], game.cardsSelected[1]);
        game.cardsSelected = [];
    },

    /**
     * Updates the score board when a point is scored
     */
    updateScore () {
        // console.log('Score update');
        game.players[game.playersTurn-1].score++;
        $(`#player-${game.playersTurn}-score`).html(game.players[game.playersTurn-1].score);

        let totalSum = 0;

            for (let i = 0; i < game.players.length; i++) {
                
                totalSum += game.players[i].score;
            }

            //If all cards are matched before time runs out, this will end the game and take to end screen.
            if (totalSum === (game.fullDeck.length / 2)) {
                game.switchScreen('#end-screen');
                game.decideWinner();
        }
    },

    getWinner(winner) {
        for (let i = 0; i < game.players.length - 1; i++) {
            if (game.players[i + 1].score > winner.score) {
                winner = game.players[i + 1];
            } 
        }
        return winner; 
    },

    decideWinner () {
        let winner =  game.players[0];
        if(game.players.length > 1) {
            winner = game.getWinner(winner);
            game.checkForTie(winner);
        }
        game.writeToEndScreen(winner);
    },

    checkForTie (winner) {
        if(winner.score === 0){
            return;
        }
        for (let i = 0; i < game.players.length; i++) {
            if (game.players[i].playerNumber != winner.playerNumber && winner.score === game.players[i].score) {
                game.tiedPlayers.push(game.players[i]); 
            } else if (game.players[i].playerNumber === winner.playerNumber) {
                game.tiedPlayers.push(winner);
            }
        }
    },

    //All the different messages to display on end screen depending on who won, lost, or tied.
    writeToEndScreen(winner) {
        if (game.tiedPlayers.length > 1) {
            let winnersNamesHTMLList = '<ul>';
            game.tiedPlayers.forEach((obj) => winnersNamesHTMLList += `<li>${obj.playerName}: ${obj.score}</li>`);
                winnersNamesHTMLList += `</ul>`;
                $('.display-winner-here').html(`<p>Tie game! The winners are:</p>${winnersNamesHTMLList}`);

        } else if (winner.score != 0 && game.players.length > 1) {
                $('.display-winner-here').html(`${winner.playerName} won with a score of ${winner.score}!`);

        } else if (game.players.length > 1) {
                $('.display-winner-here').html(`Sorry...No one matched any cards! No Winner.`);
                return;

        } else if (game.players.length === 1 && winner.score === (game.fullDeck.length / 2)) {
                $('.display-winner-here').html(`YOU WIN!`);
                return;

        } else if (game.players.length === 1 && winner.score < (game.fullDeck.length / 2)) {
                $('.display-winner-here').html(`Sorry... You lose! Your score was ${game.players[0].score}`);
                return;
            }
        
    },   
}

// A class to represent cards
class Card {
    constructor(front, back) {
        this.isFlipped = false;
        this.isSelected = false;
        this.front = front;
        this.card = `<div class="card"><div class="cardFront cardFace"><img class="photo" src="${front}.jpg"></div><div class="cardBack cardFace"><img class="coverphoto" src="${back}.jpg"></div>`
    }
};

// A class to represent players
class Player {
    constructor (name, score, playerNumber) {
        this.playerName=name;
        this.score=score;
        this.playerNumber=playerNumber;
        game.addPlayer(this);
    }

    addScore(amountToAdd) {
        this.score += amountToAdd;
        const className = 'player-' + this.playerNumber + '-score';
        const playerScoreText = document.getElementsByClassName(className);
        playerScoreText[0].innerText = this.score;
    }
};