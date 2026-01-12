let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let wrongQuestions = []; // Array per tracciare le domande sbagliate
const totalQuestions = 30; // Numero totale di domande per quiz

// Funzione per mescolare un array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Carica il file JSON con logica di selezione 22 + 8
fetch('question.json')
    .then(response => response.json())
    .then(data => {
        // 1. Separiamo le domande in due pool (gruppi)
        const poolVecchio = data.filter(q => q.id >= 1 && q.id <= 159);
        const poolNuovo = data.filter(q => q.id >= 160 && q.id <= 186);

        // 2. Mescoliamo entrambi i pool
        shuffle(poolVecchio);
        shuffle(poolNuovo);

        // 3. Selezioniamo 22 domande dal vecchio e 8 dal nuovo
        const selectedVecchio = poolVecchio.slice(0, 22);
        const selectedNuovo = poolNuovo.slice(0, 8);

        // 4. Uniamo le selezioni e mescoliamo il risultato finale
        const combinedSelection = [...selectedVecchio, ...selectedNuovo];
        questions = shuffle(combinedSelection);

        startQuiz();
    })
    .catch(error => console.error('Errore nel caricamento del file JSON:', error));

// Avvia il quiz
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    wrongQuestions = []; // Resetta le domande sbagliate
    document.getElementById('final-score').textContent = '';
    document.getElementById('result').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');
    document.getElementById('feedback').textContent = ''; // Resetta il feedback
    
    // Rimuove eventuali riepiloghi di errori precedenti
    const existingSummary = document.querySelector('#result div');
    if (existingSummary) existingSummary.remove();
    
    showQuestion();
}

// Mostra la domanda corrente
function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }

    const question = questions[currentQuestionIndex];
    document.getElementById('question').textContent = question.question;
    const answersElement = document.getElementById('answers');
    answersElement.innerHTML = ''; // Reset delle risposte
    document.getElementById('feedback').textContent = ''; 
    document.getElementById('next-question').classList.add('hidden'); 

    // Visualizza le risposte senza lettere
    Object.entries(question.options).forEach(([key, answer]) => {
        const button = document.createElement('button');
        button.textContent = `${answer}`; 
        button.addEventListener('click', () => checkAnswer(key));
        answersElement.appendChild(button);
    });

    document.getElementById('question-counter').textContent = `Domanda ${currentQuestionIndex + 1} di ${questions.length}`;
}

// Controlla se la risposta selezionata è corretta
function checkAnswer(selectedKey) {
    const question = questions[currentQuestionIndex];
    // Supporta sia 'correct_answer' che 'answer' per compatibilità
    const correctKey = question.correct_answer || question.answer; 

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
        // Aggiunge la domanda sbagliata all'elenco
        wrongQuestions.push(
            `<strong>${question.question}</strong>: Risposta corretta - ${question.options[correctKey]}`
        );
    }

    // Mostra la spiegazione
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.innerHTML = question.feedback ? `<em>Spiegazione:</em> ${question.feedback}` : '';

    // Mostra il pulsante per proseguire
    document.getElementById('next-question').classList.remove('hidden');
}

// Passa alla domanda successiva
document.getElementById('next-question').addEventListener('click', () => {
    currentQuestionIndex++;
    showQuestion();
});

// Mostra i risultati finali
function endGame() {
    document.getElementById('quiz-container').classList.add('hidden');
    const resultElement = document.getElementById('result');
    resultElement.classList.remove('hidden');

    // Mostra il punteggio finale
    document.getElementById('final-score').textContent = `Hai totalizzato ${score} punti su ${questions.length}!`;

    // Mostra le domande sbagliate in modo pulito
    if (wrongQuestions.length > 0) {
        const wrongQuestionsContainer = document.createElement('div');
        wrongQuestionsContainer.innerHTML = `
            <h3>Domande da ripassare:</h3>
            <ul style="text-align: left; display: inline-block;">
                ${wrongQuestions.map(q => `<li style="margin-bottom: 10px;">${q}</li>`).join('')}
            </ul>
        `;
        resultElement.appendChild(wrongQuestionsContainer);
    }
}
