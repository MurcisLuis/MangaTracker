let sortOrder = 'desc'; // Inicialmente en orden descendente
let sortBy = 'date';    // Criterio inicial: fecha

document.addEventListener('DOMContentLoaded', () => {
  loadPreferences(); // Cargar las preferencias del usuario
      
  loadLocalizedStrings(); 
  
  document.getElementById('toggleView').addEventListener('click', toggleView);
  document.getElementById('sortSelect').addEventListener('change', handleSortChange);
});


function translate(key) {
  return browser.i18n.getMessage(key);
}

function loadLocalizedStrings() {
  document.getElementById('appTitle').textContent = translate('appTitle');
  document.getElementById('sortDateDesc').textContent = translate('sortDateDesc');
  document.getElementById('sortDateAsc').textContent = translate('sortDateAsc');
  document.getElementById('sortTitleAsc').textContent = translate('sortTitleAsc');
  document.getElementById('sortTitleDesc').textContent = translate('sortTitleDesc');
}

function loadPreferences() {
  browser.storage.local.get(['sortBy', 'sortOrder', 'viewMode'], (result) => {
    sortBy = result.sortBy || 'date';
    sortOrder = result.sortOrder || 'desc';

    const viewMode = result.viewMode || 'grid';
    const toggleIcon = document.getElementById('toggleIcon');

    // Establecer el valor del selector de orden
    document.getElementById('sortSelect').value = `${sortBy}_${sortOrder}`;

    // Configurar la vista
    const mangaListElement = document.getElementById('mangaList');
    mangaListElement.classList.add(viewMode);
    toggleIcon.textContent = viewMode === 'grid' ? 'view_list' : 'view_module';

    loadMangaList(); // Cargar la lista con las preferencias de usuario
  });
}

function handleSortChange() {
  const sortSelect = document.getElementById('sortSelect').value;

  switch (sortSelect) {
    case 'date_desc':
      sortBy = 'date';
      sortOrder = 'desc';
      break;
    case 'date_asc':
      sortBy = 'date';
      sortOrder = 'asc';
      break;
    case 'title_asc':
      sortBy = 'title';
      sortOrder = 'asc';
      break;
    case 'title_desc':
      sortBy = 'title';
      sortOrder = 'desc';
      break;
  }

  // Guardar las preferencias de ordenación
  browser.storage.local.set({ sortBy, sortOrder }, () => {
    loadMangaList(); // Recargar la lista con el nuevo criterio de ordenación
  });
}

function loadMangaList() {
  browser.storage.local.get(['mangaProgress'], (result) => {
    const mangaListElement = document.getElementById('mangaList');
    mangaListElement.innerHTML = '';

    let progressData = result.mangaProgress || {};
    let mangaArray = Object.entries(progressData);

    // Ordenar el array según el criterio seleccionado
    mangaArray.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a[1].timestamp || 0);
        const dateB = new Date(b[1].timestamp || 0);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'title') {
        const titleA = a[0].toLowerCase();
        const titleB = b[0].toLowerCase();
        if (titleA < titleB) return sortOrder === 'asc' ? -1 : 1;
        if (titleA > titleB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }
    });

    for (const [title, mangaInfo] of mangaArray) {
      // Asegurarse de que haya capítulos y que la ordenación funcione correctamente
      if (!mangaInfo.chapters || Object.keys(mangaInfo.chapters).length === 0) continue;

      const lastChapter = Object.keys(mangaInfo.chapters).reduce((latestChapter, currentChapter) => {
        const currentChapterNumber = parseFloat(currentChapter);
        const latestChapterNumber = parseFloat(latestChapter);

        return currentChapterNumber > latestChapterNumber ? currentChapter : latestChapter;
      }, 0);

      const lastChapterInfo = mangaInfo.chapters[lastChapter];

      const listItem = document.createElement('li');
      listItem.className = 'manga-item';

      const imageContainer = document.createElement('div');
      imageContainer.className = 'image-container';

      const bannerImg = document.createElement('img');
      bannerImg.src = mangaInfo.bannerUrl || '/images/image-not-found.webp';
      bannerImg.alt = title;

      const overlay = document.createElement('div');
      overlay.className = 'overlay';

      const chapterInfo = document.createElement('span');
      chapterInfo.textContent = `${translate('chapterLabel')}: ${lastChapter}`;
      chapterInfo.className = 'chapter-info';

      const titleElement = document.createElement('h4');
      titleElement.textContent = title;
      titleElement.className = 'manga-title';

            // Botón de eliminación (fuera del enlace)
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.title = 'Eliminar manga';
            deleteButton.innerHTML = '<span class="material-icons">delete</span>';
            deleteButton.addEventListener('click', (event) => {
              event.stopPropagation(); // Evitar que se active el enlace
              event.preventDefault(); // Evitar que se siga el enlace
              deleteManga(title);
            });

      imageContainer.appendChild(bannerImg);
      overlay.appendChild(chapterInfo);
      overlay.appendChild(titleElement);
      imageContainer.appendChild(overlay);
      listItem.appendChild(imageContainer);

      // Enlazar con detail.html
      listItem.addEventListener('click', () => {
        window.location.href = `detail.html?title=${encodeURIComponent(title)}`;
      });

      listItem.appendChild(deleteButton);
      mangaListElement.appendChild(listItem);

    }
  });
}

function toggleView() {
  const mangaListElement = document.getElementById('mangaList');
  const toggleIcon = document.getElementById('toggleIcon');

  if (mangaListElement.classList.contains('list')) {
    mangaListElement.classList.remove('list');
    mangaListElement.classList.add('grid');
    toggleIcon.textContent = 'view_list';

    // Guardar la preferencia de vista
    browser.storage.local.set({ viewMode: 'grid' });
  } else {
    mangaListElement.classList.remove('grid');
    mangaListElement.classList.add('list');
    toggleIcon.textContent = 'view_module';

    // Guardar la preferencia de vista
    browser.storage.local.set({ viewMode: 'list' });
  }
}



function deleteManga(title) {
  browser.storage.local.get(['mangaProgress'], (result) => {
    let progressData = result.mangaProgress || {};
    delete progressData[title];
    browser.storage.local.set({ mangaProgress: progressData }, () => {
      loadMangaList(); // Recargar la lista después de eliminar
    });
  });
}

function restoreScrollPosition() {
  browser.storage.local.get(['mangaProgress'], (result) => {
      if (browser.runtime.lastError) {
          console.error('Error al acceder al almacenamiento local:', browser.runtime.lastError);
          return;
      }

      const mangaInfo = result.mangaProgress ? result.mangaProgress[document.location.href] : null;
      if (mangaInfo) {
          window.scrollTo(0, mangaInfo.scrollPosition);
          console.log('Posición de scroll restaurada:', mangaInfo.scrollPosition);
      } else {
          console.log('No se encontró progreso guardado para esta página.');
      }
  });
}
