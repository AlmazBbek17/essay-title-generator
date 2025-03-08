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
}

// Функция скрытия загрузки
function hideLoading() {
    loader.hidden = true;
    form.querySelector('button').disabled = false;
}

// Функция отображения результата
function displayThesis(thesis) {
    results.innerHTML = `
        <div class="result-item">
            <p class="result-item__text">${thesis}</p>
            <button onclick="copyToClipboard('${thesis}')" class="result-item__copy">
                Copy
            </button>
        </div>
    `;
}

// Обработчик формы
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
        const response = await fetch('/api/generate-thesis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topic, type, keywords })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        displayThesis(data.thesis);
    } catch (error) {
        alert('Error generating thesis: ' + error.message);
    } finally {
        hideLoading();
    }
});

// Функция копирования в буфер обмена
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        alert('Thesis copied to clipboard!');
    } catch (err) {
        alert('Failed to copy thesis');
    }
}
