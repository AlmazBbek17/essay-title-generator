// Основные константы
const STORAGE_KEY = 'essayTitleHistory';
const MAX_HISTORY_ITEMS = 10;

// Получаем элементы DOM
const form = document.getElementById('generatorForm');
const topicInput = document.getElementById('topic');
const essayTypeSelect = document.getElementById('essayType');
const subjectSelect = document.getElementById('subject');
const loader = document.getElementById('loader');
const resultsList = document.getElementById('resultsList');

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

// Функция для генерации временных заголовков (будет заменена на API)
function generateTempTitles(topic, essayType, subject) {
    const baseTemplates = [
        "The Complete Guide to {topic}",
        "Understanding {topic}: A {type} Analysis",
        "{topic}: Challenges and Opportunities",
        "The Impact of {topic} on Modern Society",
        "Exploring the Relationship Between {topic} and {subject}"
    ];

    return baseTemplates.map(template => {
        return template
            .replace('{topic}', topic)
            .replace('{type}', essayType || 'Comprehensive')
            .replace('{subject}', subject || 'Contemporary Issues');
    });
}

// Функция для создания элемента результата
function createResultItem(title) {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'result-item__title';
    titleSpan.textContent = title;

    const copyButton = document.createElement('button');
    copyButton.className = 'result-item__copy';
    copyButton.textContent = 'Copy';
    copyButton.addEventListener('click', () => copyToClipboard(title));

    resultItem.appendChild(titleSpan);
    resultItem.appendChild(copyButton);

    return resultItem;
}

// Функция копирования в буфер обмена
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Title copied to clipboard!');
    } catch (err) {
        showNotification('Error copying to clipboard', true);
    }
}

// Функция отображения уведомления
function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `notification ${isError ? 'notification--error' : 'notification--success'}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Функция отображения результатов
function displayResults(titles) {
    resultsList.innerHTML = '';
    titles.forEach(title => {
        resultsList.appendChild(createResultItem(title));
    });
}

// Обработчик отправки формы
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const topic = topicInput.value.trim();
    const essayType = essayTypeSelect.value;
    const subject = subjectSelect.value;

    if (!topic) {
        showNotification('Please enter a topic', true);
        return;
    }

    // Показываем индикатор загрузки
    loader.hidden = false;
    resultsList.innerHTML = '';

    try {
        // Здесь будет вызов API, пока используем временную функцию
        const titles = generateTempTitles(topic, essayType, subject);
        
        // Сохраняем результаты в историю
        historyManager.addToHistory(titles, topic, essayType, subject);
        
        // Отображаем результаты
        displayResults(titles);
    } catch (error) {
        showNotification('Error generating titles', true);
    } finally {
        loader.hidden = true;
    }
});

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

async function generateTitles(topic, essayType, subject) {
    try {
        const response = await fetch('/api/generate-titles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topic,
                essayType,
                subject
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate titles');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}