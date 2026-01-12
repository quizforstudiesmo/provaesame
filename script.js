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
        // 1. Dividiamo le domande in due pool in base agli ID
        const poolVecchio = data.filter(q => q.id >= 1 && q.id <= 159);
        const poolNuovo = data.filter(q => q.id >= 160 && q.id <= 186);

        // 2. Mescoliamo i due gruppi separatamente
        shuffle(poolVecchio);
        shuffle(poolNuovo);

        // 3. Selezioniamo 22 dal vecchio e 8 dal nuovo
        const selectedVecchio = poolVecchio.slice(0, 22);
        const selectedNuovo = poolNuovo.slice(0, 8);

        // 4. Uniamo i gruppi e rimescoliamo per il quiz finale
        const combinedSelection = [...selectedVecchio, ...selectedNuovo];
        questions = shuffle(combinedSelection);

        startQuiz();
    })
    .catch(error => {
        console.error(error);
        document.getElementById('question').textContent = "Errore: Assicurati che il file si chiami 'question.json' e sia nella cartella corretta.";
    });

// Avvia il quiz
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    wrongQuestions = []; 
    document.getElementById('final-score').textContent = '0';
    document.getElementById('result').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');
    document.getElementById('question-counter').classList.remove('hidden');
    
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
    answersElement.innerHTML = ''; // Pulisce le risposte precedenti
    document.getElementById('feedback').textContent = ''; 
    document.getElementById('next-question').classList.add('hidden'); 

    // Crea i pulsanti per le opzioni
    Object.entries(question.options).forEach(([key, answer]) => {
        const button = document.createElement('button');
        button.textContent = answer; 
        button.addEventListener('click', () => checkAnswer(key));
        answersElement.appendChild(button);
    });

    document.getElementById('question-counter').textContent = `Domanda ${currentQuestionIndex + 1} di ${questions.length}`;
}

// Controlla la risposta
function checkAnswer(selectedKey) {
    const question = questions[currentQuestionIndex];
    const correctKey = question.correct_answer; 

    // Selettore corretto usando l'ID dell'area risposte
    const buttons = document.querySelectorAll('#answers button');
    buttons.forEach(button => {
        button.disabled = true;
        // Evidenzia corretta (verde) e sbagliata (rossa)
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

    // Mostra il feedback/spiegazione
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.innerHTML = question.feedback ? `<em>Spiegazione:</em> ${question.feedback}` : '';

    // Mostra il pulsante "Prossima domanda"
    document.getElementById('next-question').classList.remove('hidden');
}

// Event listener per il pulsante Prossima
document.getElementById('next-question').addEventListener('click', () => {
    currentQuestionIndex++;
    showQuestion();
});

// Fine del gioco
function endGame() {
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('question-counter').classList.add('hidden');
    const resultElement = document.getElementById('result');
    resultElement.classList.remove('hidden');

    document.getElementById('final-score').textContent = score;

    if (wrongQuestions.length > 0) {
        const summaryDiv = document.createElement('div');
        summaryDiv.id = 'wrong-summary';
        summaryDiv.innerHTML = `
            <h3 style="margin-top:20px;">Domande da ripassare:</h3>
            <ul style="text-align: left; display: inline-block; list-style-type: none; padding: 0;">
                ${wrongQuestions.map(q => `<li style="margin-bottom: 15px; padding: 10px; border-bottom: 1px solid #ddd;">${q}</li>`).join('')}
            </ul>
        `;
        resultElement.appendChild(summaryDiv);
    }
}
