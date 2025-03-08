// Основные константы
const STORAGE_KEY = 'thesisHistory';
const MAX_HISTORY_ITEMS = 10;

// Получаем элементы DOM
const form = document.getElementById('thesisForm');
const topicInput = document.getElementById('topic');
const typeSelect = document.getElementById('type');
const keywordsInput = document.getElementById('keywords');
const loader = document.getElementById('loader');
const results = document.getElementById('results');

// Функция показа загрузки
function showLoading() {
    loader.hidden = false;
    form.querySelector('button').disabled = true;
    form.querySelector('button').textContent = 'Generating...';
}

// Функция скрытия загрузки
function hideLoading() {
    loader.hidden = true;
    form.querySelector('button').disabled = false;
    form.querySelector('button').textContent = 'Generate Thesis';
}

// Функция отображения результатов
function displayResults(theses) {
    const thesesHTML = theses.map(thesis => `
        <div class="result-item">
            <p class="result-item__text">${thesis}</p>
            <button onclick="copyToClipboard(this)" class="result-item__copy" data-text="${thesis}">
                Copy
            </button>
        </div>
    `).join('');

    results.innerHTML = `
        <div class="results__list">
            ${thesesHTML}
        </div>
        <button onclick="regenerateThesis()" class="form__button" style="margin-top: 1rem;">
            Generate More Thesis Statements
        </button>
    `;
}

// Функция генерации тезисов
async function generateThesis(topic, type, keywords) {
    try {
        const response = await fetch('/api/generate-thesis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topic,
                type,
                keywords
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate thesis');
        }

        // Временное решение для демонстрации
        return [
            `Through comprehensive ${type} analysis, this paper demonstrates how ${topic} significantly impacts ${keywords || 'modern society'}.`,
            `This ${type} study explores the complex relationship between ${topic} and ${keywords || 'contemporary developments'}.`,
            `By examining ${topic} through a ${type} lens, this research reveals critical insights about ${keywords || 'current trends'}.`
        ];
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Функция повторной генерации
async function regenerateThesis() {
    const topic = topicInput.value.trim();
    const type = typeSelect.value;
    const keywords = keywordsInput.value.trim();

    if (!topic) {
        alert('Please enter a topic');
        return;
    }

    showLoading();
    try {
        const theses = await generateThesis(topic, type, keywords);
        displayResults(theses);
        scrollToResults();
    } catch (error) {
        alert('Error generating thesis: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Обработчик отправки формы
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const topic = topicInput.value.trim();
    const type = typeSelect.value;
    const keywords = keywordsInput.value.trim();

    if (!topic) {
        alert('Please enter a topic');
        return;
    }

    showLoading();
    try {
        const theses = await generateThesis(topic, type, keywords);
        displayResults(theses);
        scrollToResults();
    } catch (error) {
        alert('Error generating thesis: ' + error.message);
    } finally {
        hideLoading();
    }
});

// Функция копирования в буфер обмена
async function copyToClipboard(button) {
    const text = button.dataset.text;
    try {
        await navigator.clipboard.writeText(text);
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.backgroundColor = 'var(--success-color)';
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
        }, 2000);
    } catch (err) {
        alert('Failed to copy text');
    }
}

// Функция для плавного скролла к результатам
function scrollToResults() {
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
