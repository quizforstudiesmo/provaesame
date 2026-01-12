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

// Carica il file JSON e gestisce la selezione 22 (vecchie) + 8 (nuove)
fetch('question.json')
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento del file JSON");
        return response.json();
    })
    .then(data => {
        // 1. Dividiamo le domande in due gruppi (pool) basandoci sugli ID
        const poolVecchio = data.filter(q => q.id >= 1 && q.id <= 159);
        const poolNuovo = data.filter(q => q.id >= 160 && q.id <= 186);

        // 2. Mescoliamo i due gruppi separatamente per pescare ogni volta domande diverse
        shuffle(poolVecchio);
        shuffle(poolNuovo);

        // 3. Selezioniamo 22 domande dal vecchio blocco e 8 dal nuovo blocco
        const selectedVecchio = poolVecchio.slice(0, 22);
        const selectedNuovo = poolNuovo.slice(0, 8);

        // 4. Uniamo le due selezioni e rimescoliamo il tutto (così l'ordine nel quiz è casuale)
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
    document.getElementById('feedback').textContent = ''; // Nasconde feedback precedente

    // Visualizza le risposte senza lettere precedenti
    Object.entries(question.options).forEach(([key, answer]) => {
        const button = document.createElement('button');
        button.textContent = `${answer}`; // Mostra solo la risposta
        button.addEventListener('click', () => checkAnswer(key));
        answersElement.appendChild(button);
    });

    document.getElementById('question-counter').textContent = `Domanda ${currentQuestionIndex + 1} di ${totalQuestions}`;
}

// Controlla se la risposta selezionata è corretta
function checkAnswer(selectedKey) {
    const question = questions[currentQuestionIndex];
    const correctKey = question.correct_answer; // Allineamento alla chiave del file JSON

    const answers = document.querySelectorAll('.answers button');
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

    // Mostra solo la spiegazione come feedback
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.textContent = question.feedback;

    // Mostra il pulsante per proseguire
    document.getElementById('next-question').classList.remove('hidden');
}

// Passa alla domanda successiva manualmente
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
    document.getElementById('final-score').textContent = `Hai totalizzato ${score} punti su ${totalQuestions}!`;

    // Mostra le domande sbagliate
    if (wrongQuestions.length > 0) {
        const wrongQuestionsContainer = document.createElement('div');
        wrongQuestionsContainer.innerHTML = `
            <h3>Domande sbagliate:</h3>
            <ul>
                ${wrongQuestions.map(q => `<li>${q}</li>`).join('')}
            </ul>
        `;
        resultElement.appendChild(wrongQuestionsContainer);
    }
}
