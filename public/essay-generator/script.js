// Получаем элементы DOM
const form = document.getElementById('essayForm');
const topicInput = document.getElementById('topic');
const typeSelect = document.getElementById('type');
const wordCountSelect = document.getElementById('wordCount');
const keyPointsInput = document.getElementById('keyPoints');
const requirementsInput = document.getElementById('requirements');
const includeReferencesCheckbox = document.getElementById('includeReferences');
const formalStyleCheckbox = document.getElementById('formalStyle');
const loader = document.getElementById('loader');
const results = document.getElementById('results');

// Функция показа загрузки
function showLoading() {
    loader.hidden = false;
    form.querySelector('button').disabled = true;
    form.querySelector('button').textContent = 'Generating Essay...';
}

// Функция скрытия загрузки
function hideLoading() {
    loader.hidden = true;
    form.querySelector('button').disabled = false;
    form.querySelector('button').textContent = 'Generate Essay';
}

// Функция форматирования текста эссе
function formatEssay(essay) {
    return essay.split('\n\n').map(paragraph => 
        `<p class="essay__paragraph">${paragraph}</p>`
    ).join('');
}

// Функция отображения результата
function displayEssay(essay) {
    results.innerHTML = `
        <div class="essay">
            <div class="essay__content">
                ${formatEssay(essay)}
            </div>
            <div class="essay__actions">
                <button onclick="copyToClipboard(this)" class="essay__button" data-text="${essay}">
                    Copy Full Essay
                </button>
                <button onclick="downloadEssay(this)" class="essay__button" data-text="${essay}">
                    Download as PDF
                </button>
            </div>
        </div>
    `;
}

// Обработчик формы
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const topic = topicInput.value.trim();
    const type = typeSelect.value;
    const wordCount = wordCountSelect.value;
    const keyPoints = keyPointsInput.value.trim();
    const requirements = requirementsInput.value.trim();
    const includeReferences = includeReferencesCheckbox.checked;
    const formalStyle = formalStyleCheckbox.checked;

    if (!topic) {
        alert('Please enter a topic');
        return;
    }

    showLoading();

    try {
        const response = await fetch('/api/generate-essay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topic,
                type,
                wordCount,
                keyPoints,
                requirements,
                includeReferences,
                formalStyle
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        displayEssay(data.essay);
    } catch (error) {
        alert('Error generating essay: ' + error.message);
    } finally {
        hideLoading();
    }
});

// Функция копирования в буфер обмена
async function copyToClipboard(button) {
    try {
        await navigator.clipboard.writeText(button.dataset.text);
        alert('Essay copied to clipboard!');
    } catch (err) {
        alert('Failed to copy essay');
    }
}

// Функция скачивания эссе
function downloadEssay(button) {
    const text = button.dataset.text;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'essay.txt';
    a.click();
    window.URL.revokeObjectURL(url);
} 