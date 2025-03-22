// Основные константы
const STORAGE_KEY = 'essayTitleHistory';
const MAX_HISTORY_ITEMS = 10;
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? '' // На локальном сервере используем относительные пути
    : 'https://writerai.me'; // Используем основной домен

// Получаем элементы DOM
const form = document.getElementById('generatorForm');
const topicInput = document.getElementById('topic');
const typeSelect = document.getElementById('essayType');
const subjectSelect = document.getElementById('subject');
const loader = document.getElementById('loader');
const results = document.getElementById('results');

// Класс для управления историей генераций
class HistoryManager {
    constructor(storageKey, maxItems) {
        this.storageKey = storageKey;
        this.maxItems = maxItems;
    }

    // Получение истории из localStorage
    getHistory() {
        const history = localStorage.getItem(this.storageKey);
        return history ? JSON.parse(history) : [];
    }

    // Добавление новой записи в историю
    addToHistory(titles, topic, essayType, subject) {
        const history = this.getHistory();
        const newEntry = {
            timestamp: new Date().toISOString(),
            topic,
            essayType,
            subject,
            titles
        };

        history.unshift(newEntry);
        
        // Ограничиваем количество записей
        if (history.length > this.maxItems) {
            history.pop();
        }

        localStorage.setItem(this.storageKey, JSON.stringify(history));
    }
}

// Создаем экземпляр менеджера истории
const historyManager = new HistoryManager(STORAGE_KEY, MAX_HISTORY_ITEMS);

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
    form.querySelector('button').textContent = 'Generate Titles';
}

// Функция отображения результатов
function displayResults(titles) {
    const titlesHTML = titles.map(title => `
        <div class="result-item">
            <p class="result-item__text">${title}</p>
            <button onclick="copyToClipboard(this)" class="result-item__copy" data-text="${title}">
                Copy
            </button>
        </div>
    `).join('');

    results.innerHTML = `
        <div class="results__list">
            ${titlesHTML}
        </div>
        <button onclick="regenerateTitles()" class="form__button" style="margin-top: 1rem;">
            Generate More Titles
        </button>
    `;
}

// Функция генерации заголовков
async function generateTitles(topic, type) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/generate-titles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topic,
                type
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate titles');
        }

        const data = await response.json();
        return data.titles;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Функция повторной генерации
async function regenerateTitles() {
    const topic = topicInput.value;
    const type = typeSelect.value;
    
    if (!topic) {
        alert('Please enter a topic');
        return;
    }

    showLoading();
    try {
        const titles = await generateTitles(topic, type);
        displayResults(titles);
    } catch (error) {
        alert('Error generating titles: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Обработчик отправки формы
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы

    const topic = topicInput.value.trim();
    const type = typeSelect.value;

    if (!topic) {
        alert('Please enter a topic');
        return;
    }

    showLoading();
    try {
        const titles = await generateTitles(topic, type);
        displayResults(titles);
    } catch (error) {
        alert('Error generating titles: ' + error.message);
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
    const resultsSection = document.querySelector('.results');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Добавить анимацию загрузки
function showLoadingState() {
    const button = document.querySelector('.form__button');
    button.disabled = true;
    button.textContent = 'Generating...';
    loader.hidden = false;
}

// Обновляем функцию hideLoadingState
function hideLoadingState() {
    const button = document.querySelector('.form__button');
    button.disabled = false;
    button.textContent = 'Generate More Titles'; // Изменяем текст кнопки
    loader.hidden = true;
}

// Добавляем стили для уведомлений
const notificationStyles = `
.notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 1rem;
    border-radius: 4px;
    color: white;
    animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
}

.notification--success {
    background-color: var(--success-color);
}

.notification--error {
    background-color: #e74c3c;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(20px); }
}
`;

// Добавляем стили для уведомлений в DOM
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);