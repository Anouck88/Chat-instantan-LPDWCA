document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messages');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const enableNotificationsButton = document.getElementById('enable-notifications');
    const clearStorageButton = document.getElementById('clear-storage');

    const messages = JSON.parse(localStorage.getItem('messages')) || [];

    const displayMessages = () => {
        messagesContainer.innerHTML = '';
        messages.forEach(({ text, type }) => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', type);
            messageElement.textContent = text;
            messagesContainer.appendChild(messageElement);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    chatForm.addEventListener('submit', event => {
        event.preventDefault();
        const message = messageInput.value.trim();
        if (message) {
            const messageObject = { text: message, type: 'outgoing' };
            messages.push(messageObject);
            localStorage.setItem('messages', JSON.stringify(messages));
            displayMessages();
            messageInput.value = '';
            sendNotification('Nouveau message', message);
        }
    });

    const sendNotification = (title, body) => {
        if (Notification.permission === 'granted') {
            new Notification(title, { body });
        }
    };

    enableNotificationsButton.addEventListener('click', () => {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Notifications activées', { body: 'Vous recevrez désormais des notifications.' });
                }
            });
        } else {
            new Notification('Notifications déjà activées', { body: 'Vous recevrez déjà des notifications.' });
        }
    });

    clearStorageButton.addEventListener('click', () => {
        localStorage.clear();
        messages.length = 0; // Vide aussi le tableau messages
        displayMessages();
    });

    displayMessages();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
  
        // Check for updates to the service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('A new service worker is being installed:', newWorker);
  
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                console.log('New content is available; please refresh.');
                // Show update notification to the user
                showUpdateNotification(registration);
              } else {
                // Content is cached for the first time
                console.log('Content is cached for offline use.');
              }
            }
          });
        });
      }).catch(error => {
        console.error('Service Worker registration failed:', error);
      });
    });
  }
