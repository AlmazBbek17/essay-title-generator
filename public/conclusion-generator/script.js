// Основные константы
const STORAGE_KEY = 'conclusionHistory';
const MAX_HISTORY_ITEMS = 10;

// Получаем элементы DOM
const form = document.getElementById('conclusionForm');
const topicInput = document.getElementById('topic');
const mainPointsInput = document.getElementById('mainPoints');
const thesisInput = document.getElementById('thesis');
const styleSelect = document.getElementById('style');
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
    form.querySelector('button').textContent = 'Generate Conclusion';
}

// Функция отображения результатов
function displayResults(conclusions) {
    const conclusionsHTML = conclusions.map(conclusion => `
        <div class="result-item">
            <p class="result-item__text">${conclusion}</p>
            <button onclick="copyToClipboard(this)" class="result-item__copy" data-text="${conclusion}">
                Copy
            </button>
        </div>
    `).join('');

    results.innerHTML = `
        <div class="results__list">
            ${conclusionsHTML}
        </div>
        <button onclick="regenerateConclusion()" class="form__button" style="margin-top: 1rem;">
            Generate More Conclusions
        </button>
    `;
}

// Функция генерации заключений
async function generateConclusion(topic, mainPoints, thesis, style) {
    try {
        const response = await fetch('/api/generate-conclusion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topic,
                mainPoints,
                thesis,
                style
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate conclusion');
        }

        // Временное решение для демонстрации
        const points = mainPoints ? mainPoints.split('\n').filter(p => p.trim()) : [];
        const pointsSummary = points.length > 0 ? 
            `Through examining ${points.join(', ')}, ` : 
            'Through this analysis, ';

        return [
            `${pointsSummary}this study has demonstrated the significance of ${topic}. ${thesis} As shown throughout this paper, the implications of these findings extend far beyond academic discourse.`,
            
            style === 'call-to-action' ?
            `The examination of ${topic} reveals crucial insights that demand immediate attention. ${thesis} Moving forward, it is essential to consider these findings in future research and practical applications.` :
            
            style === 'reflection' ?
            `Reflecting on ${topic} has revealed complex interconnections and profound implications. ${thesis} This understanding opens new avenues for future exploration and understanding.` :
            
            `In conclusion, the analysis of ${topic} has yielded significant insights. ${thesis} These findings contribute to our broader understanding of the subject matter.`
        ];
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Функция повторной генерации
async function regenerateConclusion() {
    const topic = topicInput.value.trim();
    const mainPoints = mainPointsInput.value.trim();
    const thesis = thesisInput.value.trim();
    const style = styleSelect.value;

    if (!topic) {
        alert('Please enter a topic');
        return;
    }

    showLoading();
    try {
        const conclusions = await generateConclusion(topic, mainPoints, thesis, style);
        displayResults(conclusions);
        scrollToResults();
    } catch (error) {
        alert('Error generating conclusion: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Обработчик отправки формы
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const topic = topicInput.value.trim();
    const mainPoints = mainPointsInput.value.trim();
    const thesis = thesisInput.value.trim();
    const style = styleSelect.value;

    if (!topic) {
        alert('Please enter a topic');
        return;
    }

    showLoading();
    try {
        const conclusions = await generateConclusion(topic, mainPoints, thesis, style);
        displayResults(conclusions);
        scrollToResults();
    } catch (error) {
        alert('Error generating conclusion: ' + error.message);
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