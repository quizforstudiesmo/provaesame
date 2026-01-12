let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let wrongQuestions = []; 
const totalQuestions = 30; 

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

fetch('question.json')
    .then(response => {
        if (!response.ok) throw new Error("File question.json non trovato sul server");
        return response.json();
    })
    .then(data => {
        // Logica 22 + 8
        const poolA = data.filter(q => q.id >= 1 && q.id <= 159);
        const poolB = data.filter(q => q.id >= 160 && q.id <= 186);

        if (poolA.length < 22 || poolB.length < 8) {
            console.warn("Attenzione: pool domande insufficiente per 22+8");
        }

        shuffle(poolA);
        shuffle(poolB);

        const selectedA = poolA.slice(0, 22);
        const selectedB = poolB.slice(0, 8);

        questions = shuffle([...selectedA, ...selectedB]);
        startQuiz();
    })
    .catch(error => {
        // Questo ti dice l'errore esatto nella console (F12)
        console.error("Errore dettagliato:", error);
        document.getElementById('question').innerHTML = 
            `<div style="color:red; font-size:16px;">
                Impossibile caricare il quiz.<br>
                1. Assicurati di usare un server locale (es. Live Server).<br>
                2. Controlla che non ci siano errori di virgole nel JSON.<br>
                <small>Errore: ${error.message}</small>
            </div>`;
    });

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    wrongQuestions = [];
    document.getElementById('result').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');
    document.getElementById('feedback').textContent = '';
    const oldSummary = document.getElementById('wrong-summary');
    if (oldSummary) oldSummary.remove();
    showQuestion();
}

function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }
    const question = questions[currentQuestionIndex];
    document.getElementById('question').textContent = question.question;
    const answersElement = document.getElementById('answers');
    answersElement.innerHTML = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('next-question').classList.add('hidden');

    Object.entries(question.options).forEach(([key, answer]) => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.addEventListener('click', () => checkAnswer(key));
        answersElement.appendChild(button);
    });
    document.getElementById('question-counter').textContent = `Domanda ${currentQuestionIndex + 1} di ${questions.length}`;
}

function checkAnswer(selectedKey) {
    const question = questions[currentQuestionIndex];
    const correctKey = question.correct_answer;
    const answers = document.querySelectorAll('#answers button');
    
    answers.forEach(button => {
        button.disabled = true;
        if (button.textContent === question.options[correctKey]) {
            button.classList.add('correct');
        } else if (question.options[selectedKey] === button.textContent) {
            button.classList.add('incorrect');
        }
    });

    if (selectedKey === correctKey) {
        score++;
    } else {
        wrongQuestions.push(`<strong>${question.question}</strong>: ${question.options[correctKey]}`);
    }

    const feedbackElement = document.getElementById('feedback');
    feedbackElement.innerHTML = question.feedback ? `<em>Spiegazione:</em> ${question.feedback}` : '';
    document.getElementById('next-question').classList.remove('hidden');
}

document.getElementById('next-question').addEventListener('click', () => {
    currentQuestionIndex++;
    showQuestion();
});

function endGame() {
    document.getElementById('quiz-container').classList.add('hidden');
    const resultElement = document.getElementById('result');
    resultElement.classList.remove('hidden');
    document.getElementById('final-score').textContent = score;

    if (wrongQuestions.length > 0) {
        const div = document.createElement('div');
        div.id = 'wrong-summary';
        div.innerHTML = `<h3>Errori:</h3><ul>${wrongQuestions.map(q => `<li>${q}</li>`).join('')}</ul>`;
        resultElement.appendChild(div);
    }
}
