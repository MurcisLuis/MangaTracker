document.addEventListener('DOMContentLoaded', () => {
    // Cargar las cadenas localizadas para los botones
    loadLocalizedStrings();
  
    // Cargar el estado actual del ajuste de "Auto Next Chapter"
    loadSettings();
  
    // Añadir event listeners a los botones
    document.getElementById('cleanPreviousChapters').addEventListener('click', () => {
      if (confirm(browser.i18n.getMessage('confirmCleanPrevious'))) {
        cleanPreviousChapters();
      }
    });
  
    document.getElementById('cleanAllData').addEventListener('click', () => {
      if (confirm(browser.i18n.getMessage('confirmCleanAll'))) {
        cleanAllData();
      }
    });
  
    // Listener para el checkbox de "Auto Next Chapter"
    console.log(document.getElementsByName('autoNextChapter')[0])
    document.getElementsByName('autoNextChapter')[0].addEventListener('change', (event) => {
      const isEnabled = event.target.checked;
      saveSetting('autoNextChapter', isEnabled);
    });
  });
  
  // Función para cargar las cadenas localizadas
  function loadLocalizedStrings() {
    // Título de la página
    document.title = browser.i18n.getMessage('appTitle');
  
    // Botones de acción
    document.getElementById('cleanPreviousChapters').textContent = browser.i18n.getMessage('cleanPreviousChapters');
    document.getElementById('cleanAllData').innerHTML = '<span class="material-icons mdc-button__icon">warning</span>' + browser.i18n.getMessage('cleanAllData');
  
    // Texto del ajuste "Auto Next Chapter"
    document.getElementById('autoNextChapterLabel').textContent = browser.i18n.getMessage('autoNextChapter');
  }
  
  // Función para cargar el estado de los ajustes
  function loadSettings() {
    browser.storage.local.get(['autoNextChapter'], (result) => {
      const isAutoNextChapterEnabled = result.autoNextChapter || false;
      document.getElementsByName('autoNextChapter')[0].checked = isAutoNextChapterEnabled;
    });
  }
  
  // Función para guardar un ajuste en el almacenamiento
  function saveSetting(settingKey, settingValue) {
    const settings = {};
    settings[settingKey] = settingValue;
  
    browser.storage.local.set(settings, () => {
      if (browser.runtime.lastError) {
        console.error('Error al guardar el ajuste:', browser.runtime.lastError);
      } else {
        console.log('Ajuste guardado:', settingKey, settingValue);
      }
    });
  }
  