const letterBoard = document.querySelector("#letter-board");
const tiles = document.querySelectorAll(".tile");
const CURRENT_WORD_ENDPOINT = `https://words.dev-apis.com/word-of-the-day`;
const VALIDATION_ENDPOINT = `https://words.dev-apis.com/validate-word`;
const ALLOWED_GUESSES = 6;
const WORD_LENGTH = 5;
let currentRow = 0;
let attempt = "";
let guessesRemaining = 6;

letterBoard.addEventListener("click", (e) => {
	if (e.target.classList.contains("letter")) {
		let letter = e.target.textContent;
		if (attempt.length < WORD_LENGTH) {
			attempt += letter;
			tiles[WORD_LENGTH * currentRow + attempt.length - 1].textContent = letter;
		}
	} else if (e.target.id === "enter") {
		if (guessesRemaining <= ALLOWED_GUESSES) {
			submitGuess(attempt);
		}
	} else if (e.target.id === "delete") {
		attempt = attempt.slice(0, -1);
		tiles[WORD_LENGTH * currentRow + attempt.length].textContent = "";
	} else {
		return;
	}
});

async function wordOfTheDay() {
	const res = await fetch(CURRENT_WORD_ENDPOINT);
	const data = await res.json();
	return data.word;
}

async function validateWord(word) {
	const res = await fetch(VALIDATION_ENDPOINT, {
		method: "POST",
		body: JSON.stringify({ word }),
	});
	const data = await res.json();
	return data;
}

async function submitGuess(guess) {
	const { word, validWord } = await validateWord(guess);
	const correctWord = await wordOfTheDay();

	// wait for fetch requests to resolve, and if the word is valid compare against the word of the day
	Promise.all([word, correctWord]).then(() => {
		if (!validWord) {
			alert("Invalid word, try again");
		}

		// iterate over each letter of the guessed word and color code according to match condition
		if (validWord) {
			for (let i = 0; i < WORD_LENGTH; i++) {
				// if the word of the day does NOT include a letter from the user guess, set that letter's class to absent.
				if (correctWord.indexOf(word[i]) < 0) {
					tiles[currentRow * WORD_LENGTH + i].classList.add("absent");
				}

				// if the user guess includes a letter from the word of the day, but its position does not match,
				// set that letter's class to present.
				if (word.indexOf(correctWord[i]) > 0 && word[i] !== correctWord[i]) {
					tiles[currentRow * WORD_LENGTH + word.indexOf(correctWord[i])].classList.add("present");
				}

				// if the letter in the guess matches the letter in the word of the day, set that letter's class to correct.
				if (word[i] === correctWord[i]) {
					tiles[currentRow * WORD_LENGTH + i].classList.add("correct");
				}
			}

			// increment the current row on submission to place new words on the next below line.
			currentRow++;
		}

		if (word === correctWord) {
			letterBoard.forEach((letter) => letter.setAttribute("disabled", ""));
			alert("You won!");
		}

		attempt = "";
	});
}
