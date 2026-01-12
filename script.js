let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let wrongQuestions = []; 
const totalQuestions = 30; 

// Funzione per mescolare l'ordine (Fisher-Yates Shuffle)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Carica il file JSON con gestione errori migliorata
fetch('question.json')
    .then(response => {
        if (!response.ok) throw new Error("File question.json non trovato o errore server.");
        return response.text(); // Carichiamo come testo per pulirlo prima del parsing
    })
    .then(text => {
        try {
            // Ripara eventuali backslash LaTeX non correttamente raddoppiati nel JSON
            const cleanedText = text.replace(/\\(?!"|\\|\/|b|f|n|r|t|u)/g, "\\\\");
            const data = JSON.parse(cleanedText);

            // Logica 22 domande (ID 1-159) + 8 domande (ID 160-186)
            const poolVecchio = data.filter(q => q.id >= 1 && q.id <= 159);
            const poolNuovo = data.filter(q => q.id >= 160 && q.id <= 186);

            shuffle(poolVecchio);
            shuffle(poolNuovo);

            // Unione dei due gruppi
            questions = shuffle([...poolVecchio.slice(0, 22), ...poolNuovo.slice(0, 8)]);

            startQuiz();
        } catch (e) {
            throw new Error("Errore nel formato dei dati JSON: " + e.message);
        }
    })
    .catch(error => {
        console.error(error);
        document.getElementById('question').innerHTML = `<span style="color:red">${error.message}</span>`;
    });

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    wrongQuestions = [];
    document.getElementById('result').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');
    showQuestion();
}

function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }

    const question = questions[currentQuestionIndex];
    document.getElementById('question-counter').textContent = `Domanda ${currentQuestionIndex + 1} di ${questions.length}`;
    document.getElementById('question').textContent = question.question;
    
    const answersElement = document.getElementById('answers');
    answersElement.innerHTML = '';
    document.getElementById('feedback').innerHTML = '';
    document.getElementById('next-question').classList.add('hidden');

    Object.entries(question.options).forEach(([key, answer]) => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.onclick = () => checkAnswer(key, button);
        answersElement.appendChild(button);
    });
}

function checkAnswer(selectedKey, clickedButton) {
    const question = questions[currentQuestionIndex];
    const correctKey = question.correct_answer;
    const buttons = document.querySelectorAll('#answers button');

    buttons.forEach(btn => {
        btn.disabled = true;
        // Se il testo del bottone corrisponde alla risposta corretta nel JSON
        if (btn.textContent === question.options[correctKey]) {
            btn.classList.add('correct');
        }
    });

    if (selectedKey === correctKey) {
        score++;
    } else {
        clickedButton.classList.add('incorrect');
        wrongQuestions.push(`<strong>${question.question}</strong><br>Risposta corretta: ${question.options[correctKey]}`);
    }

    const feedbackElement = document.getElementById('feedback');
    feedbackElement.innerHTML = question.feedback ? `<em>Spiegazione:</em> ${question.feedback}` : '';
    document.getElementById('next-question').classList.remove('hidden');
}

document.getElementById('next-question').onclick = () => {
    currentQuestionIndex++;
    showQuestion();
};

function endGame() {
    document.getElementById('quiz-container').classList.add('hidden');
    const resultElement = document.getElementById('result');
    resultElement.classList.remove('hidden');
    document.getElementById('final-score').textContent = score;

    if (wrongQuestions.length > 0) {
        const div = document.createElement('div');
        div.id = 'wrong-summary';
        div.innerHTML = `<h3>Domande da ripassare:</h3><ul>${wrongQuestions.map(q => `<li>${q}</li>`).join('')}</ul>`;
        resultElement.appendChild(div);
    }
}
