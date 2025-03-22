// Обработка ошибок
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error:', msg, '\nURL:', url, '\nLine:', lineNo, '\nColumn:', columnNo, '\nError object:', error);
    showNotification('An error occurred. Please try again.', 'error');
    return false;
};

// Функция для показа уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Добавляем стили для уведомлений
const notificationStyles = `
.notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 1rem;
    border-radius: 8px;
    color: white;
    z-index: 1000;
    animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.notification--info {
    background-color: var(--primary-color);
}

.notification--error {
    background-color: var(--error-color);
}

.notification--success {
    background-color: var(--success-color);
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

// Добавляем стили в DOM
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Обработка загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем анимацию для карточек инструментов
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.addEventListener('click', () => {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 100);
        });
    });
}); 