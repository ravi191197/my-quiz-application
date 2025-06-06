// script.js
const startBtn = document.getElementById("start-btn");
const categorySelect = document.getElementById("category");
const difficultySelect = document.getElementById("difficulty");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("next-btn");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("time");
const quizContainer = document.getElementById("quiz-container");
const settings = document.getElementById("settings");

let questions = [];
let currentIndex = 0;
let score = 0;
let timer;
let timeLeft = 30;

startBtn.addEventListener("click", () => {
  const category = categorySelect.value;
  const difficulty = difficultySelect.value;
  fetchQuestions(category, difficulty);
});

async function fetchQuestions(category, difficulty) {
  let url = `https://opentdb.com/api.php?amount=10&type=multiple`;
  if (category) url += `&category=${category}`;
  if (difficulty) url += `&difficulty=${difficulty}`;

  const res = await fetch(url);
  const data = await res.json();
  questions = data.results;
  currentIndex = 0;
  score = 0;
  scoreEl.innerText = `Score: 0`;
  settings.classList.add("d-none");
  quizContainer.classList.remove("d-none");
  showQuestion();
}

function showQuestion() {
  resetState();
  startTimer();

  const questionData = questions[currentIndex];
  questionEl.innerHTML = decodeHTMLEntities(questionData.question);

  const answers = shuffle([
    ...questionData.incorrect_answers,
    questionData.correct_answer,
  ]);

  answers.forEach((answer) => {
    const button = document.createElement("button");
    button.innerText = decodeHTMLEntities(answer);
    button.classList.add("answer-btn", "btn", "btn-outline-secondary");
    button.addEventListener("click", () => selectAnswer(button, answer === questionData.correct_answer));
    answersEl.appendChild(button);
  });
}

function resetState() {
  clearInterval(timer);
  timeLeft = 30;
  timerEl.innerText = timeLeft;
  answersEl.innerHTML = "";
  nextBtn.disabled = true;
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerEl.innerText = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      autoSelect();
    }
  }, 1000);
}

function autoSelect() {
  const buttons = document.querySelectorAll(".answer-btn");
  buttons.forEach(btn => btn.disabled = true);
  const correct = [...buttons].find(btn =>
    btn.innerText === decodeHTMLEntities(questions[currentIndex].correct_answer)
  );
  if (correct) correct.classList.add("correct");
  nextBtn.disabled = false;
}

function selectAnswer(button, isCorrect) {
  clearInterval(timer);
  const buttons = document.querySelectorAll(".answer-btn");
  buttons.forEach(btn => btn.disabled = true);

  if (isCorrect) {
    button.classList.add("correct");
    score++;
    scoreEl.innerText = `Score: ${score}`;
  } else {
    button.classList.add("wrong");
    buttons.forEach(btn => {
      if (btn.innerText === decodeHTMLEntities(questions[currentIndex].correct_answer)) {
        btn.classList.add("correct");
      }
    });
  }
  nextBtn.disabled = false;
}

nextBtn.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
});

function endQuiz() {
  questionEl.innerText = `Quiz Completed! Final Score: ${score}/10`;
  answersEl.innerHTML = "";
  nextBtn.style.display = "none";
  timerEl.innerText = "0";
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function decodeHTMLEntities(text) {
  const txt = document.createElement("textarea");
  txt.innerHTML = text;
  return txt.value;
}
