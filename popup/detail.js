document.addEventListener('DOMContentLoaded', () => {
    // Cargar el idioma seleccionado antes de continuar
    
        const userLang =  browser.i18n.getUILanguage();
        moment.locale(userLang);  // Establecer el idioma de moment.js
        
        // Cargar las cadenas localizadas
        loadLocalizedStrings();
        
        const urlParams = new URLSearchParams(window.location.search);
        const mangaTitle = urlParams.get('title');

        if (!mangaTitle) {
            console.error("No se encontró el título del manga en la URL");
            return;
        }

        browser.storage.local.get(['mangaProgress'], (result) => {
            if (browser.runtime.lastError) {
                console.error('Error al acceder al almacenamiento local:', browser.runtime.lastError);
                return;
            }

            const mangaInfo = result.mangaProgress[mangaTitle];

            if (!mangaInfo) {
                console.error('No se encontró información sobre el manga:', mangaTitle);
                return;
            }

            document.getElementById('mangaTitle').textContent = mangaInfo.title;
            document.getElementById('mangaBanner').src = mangaInfo.bannerUrl || '/images/image-not-found.webp';
            console.debug(mangaInfo);
            document.getElementById('mangaDescription').textContent = browser.i18n.getMessage('mangaDescriptionPlaceholder'); // Cadena traducida

            const chapterList = document.getElementById('chapterList');
            Object.entries(mangaInfo.chapters).forEach(([chapter, chapterInfo]) => {
                const chapterItem = document.createElement('div');
                chapterItem.className = 'chapter-item';

                const chapterTitle = document.createElement('h4');
                chapterTitle.textContent = `${browser.i18n.getMessage('chapterLabel')} ${chapter}`;  // Localizar el texto "Capítulo"

                const chapterDate = document.createElement('p');
                chapterDate.textContent = `${browser.i18n.getMessage('readAtLabel')} ${moment(chapterInfo.timestamp).fromNow()}`;

                chapterItem.appendChild(chapterTitle);
                chapterItem.appendChild(chapterDate);
                chapterList.appendChild(chapterItem);

                chapterItem.addEventListener('click', () => {
                    focusOrOpenTab(chapterInfo.url);
                });
            });

            // Manejar el botón "Seguir leyendo"
            const lastChapter = Object.keys(mangaInfo.chapters).reduce((latestChapter, currentChapter) => {
                const currentChapterNumber = parseFloat(currentChapter);
                const latestChapterNumber = parseFloat(latestChapter);
                return currentChapterNumber > latestChapterNumber ? currentChapter : latestChapter;
            });
            const lastChapterInfo = mangaInfo.chapters[lastChapter];

            document.getElementById('continueReading').addEventListener('click', () => {
                focusOrOpenTab(lastChapterInfo.url);
            });
        });
    
});

// Función para cargar cadenas localizadas
function loadLocalizedStrings() {
    document.getElementById('continueReading').textContent = browser.i18n.getMessage('continueReading');
}

function focusOrOpenTab(url) {
    browser.tabs.query({ url: url }, function(tabs) {
      if (tabs.length > 0) {
        // Si la pestaña ya está abierta, la enfocamos
        browser.tabs.update(tabs[0].id, { active: true });
      } else {
        // Si no está abierta, abrimos una nueva pestaña
        browser.tabs.create({ url: url });
      }
    });
}
