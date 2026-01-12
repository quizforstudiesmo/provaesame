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

// Caricamento con gestione errori di caratteri speciali (Escape)
fetch('question.json')
    .then(response => response.text()) // Leggiamo prima come testo grezzo
    .then(text => {
        try {
            // Proviamo a pulire il testo se ci sono backslash singoli errati
            // (Molto comune in domande su LaTeX o percorsi file)
            const cleanText = text.replace(/\\(?!"|\\|\/|b|f|n|r|t|u)/g, "\\\\");
            const data = JSON.parse(cleanText);
            
            // Logica di selezione 22 + 8
            const poolVecchio = data.filter(q => q.id >= 1 && q.id <= 159);
            const poolNuovo = data.filter(q => q.id >= 160 && q.id <= 186);

            shuffle(poolVecchio);
            shuffle(poolNuovo);

            const combinedSelection = [
                ...poolVecchio.slice(0, 22),
                ...poolNuovo.slice(0, 8)
            ];

            questions = shuffle(combinedSelection);
            startQuiz();
        } catch (e) {
            console.error("Errore critico nel formato del file JSON:", e);
            document.getElementById('question').innerHTML = 
                "<span style='color:red'>Errore nel file question.json: Carattere non valido alla posizione " + e.message.split(' ').pop() + "</span>";
        }
    })
    .catch(error => console.error('Errore caricamento:', error));

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    wrongQuestions = [];
    document.getElementById('result').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');
    document.getElementById('question-counter').classList.remove('hidden');
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

    const buttons = document.querySelectorAll('#answers button');
    buttons.forEach(button => {
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
        wrongQuestions.push(
            `<strong>${question.question}</strong><br>Risposta corretta: ${question.options[correctKey]}`
        );
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
    document.getElementById('question-counter').classList.add('hidden');
    const resultElement = document.getElementById('result');
    resultElement.classList.remove('hidden');
    document.getElementById('final-score').textContent = score;

    if (wrongQuestions.length > 0) {
        const summary = document.createElement('div');
        summary.id = 'wrong-summary';
        summary.innerHTML = `<h3>Riepilogo errori:</h3><ul>${wrongQuestions.map(q => `<li>${q}</li>`).join('')}</ul>`;
        resultElement.appendChild(summary);
    }
}
