let isAutoScrolling = false;
let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
let lastCheckTime = Date.now();
const checkInterval = 100; // Intervalo para verificar el scroll (en ms)
let isInCooldown = false;
let currentTitle = "";
let currentChapter = "";

const siteConfigurations = {
  "zonaolympus.com": {
    dataSelectors: {
      titleElement: "h1.text-slate-500",
      chapterElement: "b.text-xs",
      titleBElement: "h1.text-2xl",
      bannerElement: "img.object-cover.rounded-inherit"
    },
    nextButtonSelector: "#__nuxt > div > div > div.mx-auto.relative.z-10 > div > main > div.flex.flex-col.items-center.gap-8.py-8 > div.flex-center.bg-gray-800.p-4.rounded-xl.gap-4 > a.h-12.px-4.bg-gray-900\\/50.flex-center.gap-2.rounded-xl.hover\\:text-amber-500.transition-color.sf-ripple-container",
    nextButtonText: "Capítulo siguiente"
  },
  "leerolymp.com": "zonaolympus.com",
  "leercapitulo.co": {
    dataSelectors: {
      titleElement: "body > section > div.container.bgposition-relative > div:nth-child(2) > div.col-md-7.col-sm-6 > div > h2:nth-child(3) > a",
      chapterElement: "body > section > div.container.bgposition-relative > div:nth-child(2) > div.col-md-7.col-sm-6 > div > h2:nth-child(1)",
      titleBElement: "body > section > div.container.bgposition-relative > div > div.col-md-8 > div:nth-child(1) > div:nth-child(2) > div > div.media-body > h1",
      bannerElement: "body > section > div.container.bgposition-relative > div > div.col-md-8 > div:nth-child(1) > div:nth-child(2) > div > div.media-left.cover-detail > img"
    },
    nextButtonSelector: "body > section > div.container.bgposition-relative > div:nth-child(9) > div.col-md-5.col-sm-6.paddfixboth > div > div > div.col-xs-2.paddfixboth.rightalign > a",
    nextButtonConditionSelector: "body > section > div.container.bgposition-relative > div:nth-child(3) > div.col-md-7.col-sm-6 > div > select",
    nextButtonConditionValue: "1"
  },
  "taurusmanga.com": {
    dataSelectors: {
      titleElement: "#chapter-heading",
      chapterElement: "#nombre",
      titleBElement: "#title",
      bannerElement: "body > div.wrap > div > div.site-content > div > div.c-page-content.style-1 > div > div > div > div > div > div.c-page > div > div.profile-manga > div > div.summary_image > a > img"
    },
    nextButtonSelector: "#manga-reading-nav-foot > div > div.select-pagination > div > div > a"
  }
};

// Función que detecta si el scroll ha sido realizado por la página
function detectPageScroll() {
  const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // Si ha habido un cambio en la posición de scroll pero no es causado por nosotros
  if (!isAutoScrolling && currentScrollTop !== lastScrollTop) {
    const timeSinceLastCheck = Date.now() - lastCheckTime;

    // Si el tiempo desde la última verificación es menor que el intervalo de verificación,
    // asumimos que la página está desplazándose automáticamente
    if (timeSinceLastCheck < checkInterval) {
      console.debug("La página está realizando un scroll automáticamente");
    } else {
      console.debug("El usuario está realizando un scroll");
      saveMangaProgress(); // Solo guardamos si fue un scroll del usuario
      checkAutoNextChapter();
    }
  }

  // Actualizar el último scrollTop y tiempo de verificación
  lastScrollTop = currentScrollTop;
  lastCheckTime = Date.now();
}

function extractDataFromSite(config) {
  const {
    titleElement,
    chapterElement,
    titleBElement,
    bannerElement
  } = config.dataSelectors;

  const data = {};

  const titleEl = document.querySelector(titleElement);
  const chapterEl = document.querySelector(chapterElement);
  const titleBEl = document.querySelector(titleBElement);
  const bannerEl = document.querySelector(bannerElement);

  if (titleEl) {
    data.title = titleEl.textContent.trim();
  } else {
    console.debug("No se pudo encontrar el título en la página.");
  }

  if (chapterEl) {
    data.chapter = chapterEl.textContent.trim().replace("Capitulo ", "").replace("-", "");
  } else {
    console.debug("No se pudo encontrar el capítulo en la página.");
  }

  if (titleBEl && bannerEl) {
    data.title = titleBEl.textContent.trim();
    data.bannerUrl = bannerEl.src;
  } else {
    console.debug("No se encontró un banner o título secundario para actualizar.");
  }

  return data;
}

function extractNextButtonFromSite(config) {
  // Si hay una condición adicional para encontrar el botón (como en leercapitulo.co)
  if (config.nextButtonConditionSelector && config.nextButtonConditionValue) {
    const conditionElement = document.querySelector(config.nextButtonConditionSelector);
    if (!conditionElement || conditionElement.value !== config.nextButtonConditionValue) {
      return undefined;
    }
  }

  const button = document.querySelector(config.nextButtonSelector);
  
  // Si se especifica el texto del botón, lo verificamos
  if (config.nextButtonText) {
    const buttonTextElement = button && button.querySelector("div > div:nth-child(2)");
    if (buttonTextElement && buttonTextElement.textContent.trim() === config.nextButtonText) {
      return button;
    } else {
      return undefined;
    }
  }

  return button;
}

function getSiteConfig() {
  const url = document.location.href;
  for (const domain in siteConfigurations) {
    if (url.includes(domain)) {
      let config = siteConfigurations[domain];
      // Si la configuración es una cadena, es un alias a otro dominio
      if (typeof config === 'string') {
        config = siteConfigurations[config];
      }
      return config;
    }
  }
  console.debug("No se encontró una configuración para este sitio.");
  return null;
}


function getMangaData() {
  const config = getSiteConfig();
  if (!config) return null;
  return extractDataFromSite(config);
}

function getNextButton() {
  const config = getSiteConfig();
  if (!config) return null;
  return extractNextButtonFromSite(config);
}

function isNextButtonVisible() {
  const nextButton = getNextButton();

  if (!nextButton || !(nextButton instanceof Element)) {
    console.debug("No se encontró el botón de siguiente episodio o no es un elemento HTML válido.");
    return false;
  }

  const rect = nextButton.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  // Verificar si el botón es visible en la ventana
  const isVisible = rect.top >= 0 && rect.bottom <= windowHeight;
  console.debug("Es visible : ", isVisible);
  return isVisible;
}

function checkAutoNextChapter() {
  if (isInCooldown) {
    console.debug("Auto-next capítulo está en cooldown. Espera unos segundos.");
    return; // Si está en cooldown, no hacer nada
  }

  browser.storage.local.get(["autoNextChapter"]).then((result) => {
    const isAutoNextChapterEnabled = result.autoNextChapter || false;

    if (isAutoNextChapterEnabled && isNextButtonVisible()) {
      console.debug(
        'Botón de "Siguiente Episodio" visible. Pasando al siguiente episodio automáticamente.'
      );

      const nextButton = getNextButton();
      if (nextButton) {
        nextButton.click();
      }

      // Activar el cooldown después de hacer clic en el botón de siguiente episodio
      isInCooldown = true;
      setTimeout(() => {
        isInCooldown = false; // Después de 2 segundos, desactivar el cooldown
        console.debug("Cooldown finalizado, listo para pasar al siguiente episodio.");
      }, 2000); // Cooldown de 2 segundos
    }
  }).catch((error) => {
    console.debug("Error al acceder al almacenamiento local:", error);
  });
}

function restoreScrollPosition() {
  const extractedData = getMangaData();
  if (!extractedData || !extractedData.title || !extractedData.chapter) return;

  browser.storage.local.get(["mangaProgress"]).then((result) => {
    console.debug(
      "Intentando restaurar scroll para:",
      extractedData.title,
      "Capítulo:",
      extractedData.chapter
    );

    if (result.mangaProgress) {
      let mangaInfo = result.mangaProgress[extractedData.title];
      if (
        mangaInfo &&
        mangaInfo.chapters &&
        mangaInfo.chapters[extractedData.chapter]
      ) {
        const chapterInfo = mangaInfo.chapters[extractedData.chapter];
        console.debug("Progreso encontrado para el capítulo:", extractedData.chapter);
        isAutoScrolling = true; // Set flag to indicate programmatic scroll
        window.scrollTo(window.scrollX, chapterInfo.scrollPosition);
        console.debug("Posición de scroll restaurada a:", chapterInfo.scrollPosition);

        // Reset flag after the scroll completes
        setTimeout(() => {
          isAutoScrolling = false;
        }, 500);
      } else {
        console.debug("No se encontró progreso guardado para el capítulo actual.");
      }
    } else {
      console.debug("No se encontró progreso guardado para este manga.");
    }
  }).catch((error) => {
    console.debug("Error al acceder al almacenamiento local:", error);
  });
}

function saveMangaProgress() {
  try {
    const extractedData = getMangaData();
    if (!extractedData || !extractedData.title) {
      console.debug("No se pudo extraer el título.");
      return;
    }

    if (!extractedData.chapter) {
      console.debug("No se pudo extraer el capítulo. Usando valor predeterminado.");
      extractedData.chapter = "default"; // Asignar un valor predeterminado si no se encuentra el capítulo
    }

    const currentScrollPosition = window.scrollY;
    const currentTimestamp = new Date().toISOString(); // Timestamp actual en formato ISO

    browser.storage.local.get(["mangaProgress"]).then((result) => {
      let progressData = result.mangaProgress || {};
      let mangaData = progressData[extractedData.title] || {};

      // Asegurarse de que mangaData.chapters exista
      if (!mangaData.chapters) {
        mangaData.chapters = {}; // Crear el objeto chapters si no existe
      }

      // Actualizar o crear la entrada para el capítulo actual
      if (extractedData.chapter !== "default") {
        mangaData.chapters[extractedData.chapter] = {
          scrollPosition: currentScrollPosition,
          timestamp: currentTimestamp, // Guardar la fecha y hora actual
          url: document.location.href,
        };
      }

      // Mantener los datos generales
      if (extractedData.bannerUrl && extractedData.bannerUrl != mangaData.bannerUrl) {
        mangaData.bannerUrl = extractedData.bannerUrl;
        mangaData.mainpage = document.location.href;
      }
      mangaData.title = extractedData.title;
      mangaData.mainpage = extractedData.mainpage || mangaData.mainpage;
      mangaData.timestamp = currentTimestamp;

      progressData[extractedData.title] = mangaData;

      // Intentar guardar los datos y manejar posibles errores
      browser.storage.local.set({ mangaProgress: progressData }).then(() => {
        console.debug("Progreso actualizado:", progressData[extractedData.title]);
      }).catch((error) => {
        console.debug("Error al guardar el progreso:", error);
      });
    }).catch((error) => {
      console.debug("Error al acceder al almacenamiento local:", error);
    });
  } catch (error) {
    console.debug("Error inesperado al guardar el progreso del manga:", error);
  }
}

// Guardar la serie y capítulo actuales al cargar la página
function initializeCurrentData() {
  const extractedData = getMangaData();
  if (extractedData && extractedData.title && extractedData.chapter) {
    currentTitle = extractedData.title;
    currentChapter = extractedData.chapter;
    console.debug("Datos iniciales:", currentTitle, currentChapter);
  }
}

// Comprobar si la serie o el capítulo han cambiado
function hasSeriesOrChapterChanged() {
  const extractedData = getMangaData();
  if (extractedData && extractedData.title && extractedData.chapter) {
    const titleChanged = extractedData.title !== currentTitle;
    const chapterChanged = extractedData.chapter !== currentChapter;

    if (titleChanged || chapterChanged) {
      currentTitle = extractedData.title;
      currentChapter = extractedData.chapter;
      console.debug("Serie o capítulo cambiados:", currentTitle, currentChapter);
      return true;
    }
  }

  return false;
}

function observeDOMChanges() {
  // Seleccionamos el contenedor principal de la página.
  const targetNode = document.body; // O un contenedor específico de la aplicación

  const config = { childList: true, subtree: true };

  // Callback que se ejecutará cuando haya cambios en el DOM.
  const callback = function (mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        if (hasSeriesOrChapterChanged()) {
          console.debug("Serie o capítulo cambiaron, actualizando...");
          waitForImagesAndRestoreScroll(); // Llamar para restaurar la posición de scroll si hay cambios
        }
      }
    }
  };

  // Iniciar la observación de mutaciones en el DOM.
  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}

function waitForImagesAndRestoreScroll() {
  const images = document.querySelectorAll("img");
  let imagesLoaded = 0;
  const maxWaitTime = 3000;

  if (images.length === 0) {
    restoreScrollPosition();
    return;
  }

  const checkIfDone = () => {
    if (imagesLoaded === images.length) {
      restoreScrollPosition();
    }
  };

  images.forEach((img) => {
    if (img.complete) {
      imagesLoaded++;
      checkIfDone();
    } else {
      img.addEventListener("load", () => {
        imagesLoaded++;
        checkIfDone();
      });
      img.addEventListener("error", () => {
        imagesLoaded++;
        checkIfDone();
      });
    }
  });

  setTimeout(() => {
    if (imagesLoaded < images.length) {
      restoreScrollPosition();
    }
  }, maxWaitTime);
}

setInterval(detectPageScroll, checkInterval);
window.addEventListener("load", () => {
  initializeCurrentData();
  observeDOMChanges();
  waitForImagesAndRestoreScroll(); // Llamada inicial por si ya están cargadas
  saveMangaProgress();
});

window.addEventListener("scroll", () => {
  if (!isAutoScrolling) {
    saveMangaProgress();
  }
});
