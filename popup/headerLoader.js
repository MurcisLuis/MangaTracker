document.addEventListener('DOMContentLoaded', () => {
  const headerContainer = document.getElementById('header-container');

  // Cargar el header
  fetch('header.html')
    .then(response => response.text())
    .then(data => {
      headerContainer.innerHTML = data;
      if (window.location.href.includes('popup.html')) {
        loadQuery();
      }

      // Ahora que el header está cargado, añadimos los event listeners
      const searchBar = document.getElementById('searchBar');
      if (searchBar) {
        searchBar.addEventListener('input', () => {
          const query = searchBar.value.toLowerCase();
          const mangaItems = document.querySelectorAll('#mangaList .manga-item');

          // Si no estamos en popup.html, redirigir con el contenido de búsqueda
          if (!window.location.href.includes('popup.html')) {
            window.location.href = `popup.html?search=${encodeURIComponent(query)}`;
            return;
          }

          // Si estamos en popup.html, mostrar/ocultar los mangas según la búsqueda
          mangaItems.forEach(item => {
            const title = item.querySelector('h4').textContent.toLowerCase();
            if (title.includes(query)) {
              item.style.display = '';
            } else {
              item.style.display = 'none';
            }
          });
        });
      }

      const backButton = document.getElementById('backButton');
      if (backButton) {
        backButton.addEventListener('click', () => {
          window.history.back();
        });
      }

      // Event listener para cerrar la extensión
      const closeButton = document.getElementById('closeButton');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          window.close();
        });
      }

      const settingsButton = document.getElementById('settingsButton');
      settingsButton.addEventListener('click', () => {
        window.location.href = 'settings.html';
      });
    })
    .catch(error => console.error('Error loading header:', error));
});

function loadQuery(){
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');

  if (searchQuery) {
    const mangaItems = document.querySelectorAll('#mangaList .manga-item');
    mangaItems.forEach(item => {
      const title = item.querySelector('h4').textContent.toLowerCase();
      if (title.includes(searchQuery.toLowerCase())) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });

    // Establecer el valor en el campo de búsqueda para que el usuario lo vea
    const searchBar = document.getElementById('searchBar');
    if (searchBar) {
      searchBar.value = searchQuery;
      searchBar.focus();  // Asegurarse de que el campo tenga focus
    }
  }
}