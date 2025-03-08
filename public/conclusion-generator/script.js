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
}

// Функция скрытия загрузки
function hideLoading() {
    loader.hidden = true;
    form.querySelector('button').disabled = false;
}

// Функция отображения результата
function displayConclusion(conclusion) {
    results.innerHTML = `
        <div class="result-item">
            <p class="result-item__text">${conclusion}</p>
            <button onclick="copyToClipboard('${conclusion}')" class="result-item__copy">
                Copy
            </button>
        </div>
    `;
}

// Обработчик формы
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

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        displayConclusion(data.conclusion);
    } catch (error) {
        alert('Error generating conclusion: ' + error.message);
    } finally {
        hideLoading();
    }
});

// Функция копирования в буфер обмена
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        alert('Conclusion copied to clipboard!');
    } catch (err) {
        alert('Failed to copy conclusion');
    }
} 