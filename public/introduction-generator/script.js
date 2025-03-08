// Основные константы
const STORAGE_KEY = 'introductionHistory';
const MAX_HISTORY_ITEMS = 10;

// Получаем элементы DOM
const form = document.getElementById('introForm');
const topicInput = document.getElementById('topic');
const thesisInput = document.getElementById('thesis');
const styleSelect = document.getElementById('style');
const lengthSelect = document.getElementById('length');
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
    form.querySelector('button').textContent = 'Generate Introduction';
}

// Функция отображения результатов
function displayResults(introductions) {
    const introductionsHTML = introductions.map(intro => `
        <div class="result-item">
            <p class="result-item__text">${intro}</p>
            <button onclick="copyToClipboard(this)" class="result-item__copy" data-text="${intro}">
                Copy
            </button>
        </div>
    `).join('');

    results.innerHTML = `
        <div class="results__list">
            ${introductionsHTML}
        </div>
        <button onclick="regenerateIntroduction()" class="form__button" style="margin-top: 1rem;">
            Generate More Introductions
        </button>
    `;
}

// Функция генерации введений
async function generateIntroduction(topic, thesis, style, length) {
    try {
        const response = await fetch('/api/generate-introduction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topic,
                thesis,
                style,
                length
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate introduction');
        }

        // Временное решение для демонстрации
        const introLength = length === 'short' ? 'briefly' : 'comprehensively';
        return [
            `In today's rapidly evolving world, ${topic} has become increasingly significant. This paper will ${introLength} examine the various aspects of this phenomenon. ${thesis}`,
            `The study of ${topic} has garnered considerable attention in recent years. Through careful analysis, this research will ${introLength} explore its implications. ${thesis}`,
            `Recent developments in ${topic} have raised important questions about its role in society. This ${style} analysis will ${introLength} investigate these crucial aspects. ${thesis}`
        ];
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Функция повторной генерации
async function regenerateIntroduction() {
    const topic = topicInput.value.trim();
    const thesis = thesisInput.value.trim();
    const style = styleSelect.value;
    const length = lengthSelect.value;

    if (!topic) {
        alert('Please enter a topic');
        return;
    }

    showLoading();
    try {
        const introductions = await generateIntroduction(topic, thesis, style, length);
        displayResults(introductions);
        scrollToResults();
    } catch (error) {
        alert('Error generating introduction: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Обработчик отправки формы
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const topic = topicInput.value.trim();
    const thesis = thesisInput.value.trim();
    const style = styleSelect.value;
    const length = lengthSelect.value;

    if (!topic) {
        alert('Please enter a topic');
        return;
    }

    showLoading();
    try {
        const introductions = await generateIntroduction(topic, thesis, style, length);
        displayResults(introductions);
        scrollToResults();
    } catch (error) {
        alert('Error generating introduction: ' + error.message);
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