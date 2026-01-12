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
    .then(response => response.json())
    .then(data => {
        // 1. Dividiamo le domande in base agli ID richiesti
        const poolVecchio = data.filter(q => q.id >= 1 && q.id <= 159);
        const poolNuovo = data.filter(q => q.id >= 160 && q.id <= 186);

        // 2. Mescoliamo i due gruppi separatamente
        shuffle(poolVecchio);
        shuffle(poolNuovo);

        // 3. Prendiamo esattamente 22 domande dal vecchio e 8 dal nuovo
        // Usiamo .slice per estrarre la quantità desiderata
        const selectedVecchio = poolVecchio.slice(0, 22);
        const selectedNuovo = poolNuovo.slice(0, 8);

        // 4. Uniamo i due gruppi per formare il quiz da 30
        const combinedSelection = [...selectedVecchio, ...selectedNuovo];

        // 5. Mescoliamo la selezione finale affinché l'ordine delle domande 
        // durante il quiz sia casuale (non tutte le nuove alla fine)
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
    showQuestion();
}

// Mostra la domanda corrente
function showQuestion() {
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.textContent = ''; // Resetta il feedback
    document.getElementById('next-question').classList.add('hidden'); // Nasconde il tasto "Prossima"

    const question = questions[currentQuestionIndex];
    document.getElementById('question-counter').textContent = `Domanda ${currentQuestionIndex + 1} di ${questions.length}`;
    document.getElementById('question').textContent = question.question;

    const answersElement = document.getElementById('answers');
    answersElement.innerHTML = ''; // Pulisce le risposte precedenti

    // Crea i pulsanti per le opzioni
    Object.keys(question.options).forEach(key => {
        const button = document.createElement('button');
        button.textContent = `${key.toUpperCase()}: ${question.options[key]}`;
        button.classList.add('answer-btn');
        button.addEventListener('click', () => selectAnswer(key, question));
        answersElement.appendChild(button);
    });
}

// Gestisce la selezione della risposta
function selectAnswer(selectedKey, question) {
    // Determina la chiave corretta (gestisce sia "answer" che "correct_answer")
    const correctKey = question.answer || question.correct_answer;
    
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => btn.disabled = true); // Disabilita i pulsanti dopo la scelta

    if (selectedKey === correctKey) {
        score++;
    } else {
        // Aggiunge la domanda sbagliata all'elenco per il riepilogo finale
        wrongQuestions.push(
            `<strong>${question.question}</strong><br>Risposta corretta: ${correctKey.toUpperCase()} - ${question.options[correctKey]}`
        );
    }

    // Mostra il feedback (spiegazione) se presente
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.innerHTML = question.feedback ? `<em>Spiegazione:</em> ${question.feedback}` : '';

    // Mostra il pulsante per proseguire
    document.getElementById('next-question').classList.remove('hidden');
}

// Passa alla domanda successiva
document.getElementById('next-question').addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        endGame();
    }
});

// Mostra i risultati finali
function endGame() {
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('question-counter').classList.add('hidden');
    const resultElement = document.getElementById('result');
    resultElement.classList.remove('hidden');

    // Mostra il punteggio finale
    document.getElementById('final-score').textContent = `${score} su ${questions.length}`;

    // Mostra il riepilogo delle domande sbagliate
    if (wrongQuestions.length > 0) {
        let wrongHtml = '<h3>Domande da ripassare:</h3><ul>';
        wrongQuestions.forEach(q => {
            wrongHtml += `<li style="margin-bottom: 10px;">${q}</li>`;
        });
        wrongHtml += '</ul>';
        
        // Evita di duplicare il contenitore se si rigioca
        const existingWrong = document.getElementById('wrong-summary');
        if (existingWrong) existingWrong.remove();
        
        const summaryDiv = document.createElement('div');
        summaryDiv.id = 'wrong-summary';
        summaryDiv.innerHTML = wrongHtml;
        resultElement.appendChild(summaryDiv);
    }
}
