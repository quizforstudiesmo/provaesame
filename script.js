let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let wrongQuestions = []; // Array per tracciare le domande sbagliate
const totalQuestions = 30; // Numero totale di domande per quiz

// Funzione per mescolare un array (Fisher-Yates Shuffle)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Carica il file JSON e gestisce la selezione 22 + 8
fetch('question.json')
    .then(response => {
        if (!response.ok) throw new Error("Errore nel caricamento del file JSON");
        return response.json();
    })
    .then(data => {
        // 1. Dividiamo le domande in due pool basandoci sugli ID
        const poolA = data.filter(q => q.id >= 1 && q.id <= 159);
        const poolB = data.filter(q => q.id >= 160 && q.id <= 186);

        // 2. Mescoliamo i due gruppi separatamente
        shuffle(poolA);
        shuffle(poolB);

        // 3. Selezioniamo 22 dal vecchio blocco e 8 dal nuovo blocco
        const selectedA = poolA.slice(0, 22);
        const selectedB = poolB.slice(0, 8);

        // 4. Uniamo le due selezioni e rimescoliamo il tutto
        const combinedSelection = [...selectedA, ...selectedB];
        questions = shuffle(combinedSelection);

        startQuiz();
    })
    .catch(error => {
        console.error(error);
        document.getElementById('question').textContent = "Errore nel caricamento delle domande. Assicurati che il file question.json sia corretto.";
    });

// Avvia il quiz
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    wrongQuestions = []; // Resetta le domande sbagliate
    document.getElementById('final-score').textContent = '';
    document.getElementById('result').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');
    document.getElementById('feedback').textContent = ''; // Resetta il feedback
    
    // Rimuove eventuali riepiloghi di errori da partite precedenti
    const existingSummary = document.getElementById('wrong-summary');
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
    document.getElementById('feedback').textContent = ''; // Nasconde feedback precedente
    document.getElementById('next-question').classList.add('hidden'); // Nasconde tasto "Prossima"

    // Visualizza le risposte senza lettere (come richiesto)
    Object.entries(question.options).forEach(([key, answer]) => {
        const button = document.createElement('button');
        button.textContent = `${answer}`; // Mostra solo il testo della risposta
        button.addEventListener('click', () => checkAnswer(key));
        answersElement.appendChild(button);
    });

    document.getElementById('question-counter').textContent = `Domanda ${currentQuestionIndex + 1} di ${questions.length}`;
}

// Controlla se la risposta selezionata è corretta
function checkAnswer(selectedKey) {
    const question = questions[currentQuestionIndex];
    const correctKey = question.correct_answer; 

    // Selettore pulsanti tramite ID #answers (più preciso)
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
        // Aggiunge la domanda sbagliata all'elenco per il riepilogo finale
        wrongQuestions.push(
            `<strong>${question.question}</strong>: Risposta corretta - ${question.options[correctKey]}`
        );
    }

    // Mostra la spiegazione come feedback (usando innerHTML per supportare grassetto/corsivo)
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

    // Mostra il riepilogo delle domande sbagliate
    if (wrongQuestions.length > 0) {
        const wrongSummary = document.createElement('div');
        wrongSummary.id = 'wrong-summary';
        wrongSummary.innerHTML = `
            <h3>Domande da ripassare:</h3>
            <ul style="text-align: left; display: inline-block;">
                ${wrongQuestions.map(q => `<li style="margin-bottom: 10px;">${q}</li>`).join('')}
            </ul>
        `;
        resultElement.appendChild(wrongSummary);
    }
}
