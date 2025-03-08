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
}

// Функция скрытия загрузки
function hideLoading() {
    loader.hidden = true;
    form.querySelector('button').disabled = false;
}

// Функция отображения результата
function displayIntroduction(introduction) {
    results.innerHTML = `
        <div class="result-item">
            <p class="result-item__text">${introduction}</p>
            <button onclick="copyToClipboard('${introduction}')" class="result-item__copy">
                Copy
            </button>
        </div>
    `;
}

// Обработчик формы
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
        const response = await fetch('/api/generate-introduction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topic, thesis, style, length })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        displayIntroduction(data.introduction);
    } catch (error) {
        alert('Error generating introduction: ' + error.message);
    } finally {
        hideLoading();
    }
});

// Функция копирования в буфер обмена
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        alert('Introduction copied to clipboard!');
    } catch (err) {
        alert('Failed to copy introduction');
    }
} 