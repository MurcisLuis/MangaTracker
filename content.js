let isAutoScrolling = false;
let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
let lastCheckTime = Date.now();
const checkInterval = 100; // Intervalo para verificar el scroll (en ms)
let isInCooldown = false;
let currentTitle = "";
let currentChapter = "";

// Función que detecta si el scroll ha sido realizado por la página
function detectPageScroll() {
  const currentScrollTop =
    window.pageYOffset || document.documentElement.scrollTop;

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

/**
 * Extrae la informacion de LeerOlymp
 *
 * @returns data{title,<bannerUrl|chapter>}
 */
function extractDataFromLeerOlymp() {
  const titleElement = document.querySelector("h1.text-slate-500");
  const chapterElement = document.querySelector("b.text-xs");
  const titleBElement = document.querySelector("h1.text-2xl");
  const bannerElement = document.querySelector(
    "img.object-cover.rounded-inherit"
  );

  const data = {};

  if (titleElement) {
    data.title = titleElement.textContent.trim();
  } else {
    console.debug(
      "No se pudo encontrar el título en la página de leerolymp.com"
    );
  }

  if (chapterElement) {
    data.chapter = chapterElement.textContent.trim();
  } else {
    console.debug(
      "No se pudo encontrar el capítulo en la página de leerolymp.com"
    );
  }

  if (titleBElement && bannerElement) {
    data.title = titleBElement.textContent.trim();
    data.bannerUrl = bannerElement.src;
  } else {
    console.debug(
      "No se encontró un banner o título secundario para actualizar."
    );
  }

  return data;
}

function extractNextButtonFromLeerOlymp() {
  var button = document.querySelector(
    "#__nuxt > div > div > div.mx-auto.relative.z-10 > div > main > div.flex.flex-col.items-center.gap-8.py-8 > div.flex-center.bg-gray-800.p-4.rounded-xl.gap-4 > a.h-12.px-4.bg-gray-900\\/50.flex-center.gap-2.rounded-xl.hover\\:text-amber-500.transition-color.sf-ripple-container > div > div:nth-child(2)"
  );
  if (button && button.textContent == "Capítulo siguiente")
    return document.querySelector(
      "#__nuxt > div > div > div.mx-auto.relative.z-10 > div > main > div.flex.flex-col.items-center.gap-8.py-8 > div.flex-center.bg-gray-800.p-4.rounded-xl.gap-4 > a.h-12.px-4.bg-gray-900\\/50.flex-center.gap-2.rounded-xl.hover\\:text-amber-500.transition-color.sf-ripple-container"
    );
  return undefined;
}

/**
 * Extrae la informacion de LeerCapitulo
 *
 * @returns data{title,<bannerUrl|chapter>}
 */
function extractDataFromLeerCapitulo() {
  const titleElement = document.querySelector(
    "body > section > div.container.bgposition-relative > div:nth-child(2) > div.col-md-7.col-sm-6 > div > h2:nth-child(3) > a"
  );
  const chapterElement = document.querySelector(
    "body > section > div.container.bgposition-relative > div:nth-child(2) > div.col-md-7.col-sm-6 > div > h2:nth-child(1)"
  );
  const titleBElement = document.querySelector(
    "body > section > div.container.bgposition-relative > div > div.col-md-8 > div:nth-child(1) > div:nth-child(2) > div > div.media-body > h1"
  );
  const bannerElement = document.querySelector(
    "body > section > div.container.bgposition-relative > div > div.col-md-8 > div:nth-child(1) > div:nth-child(2) > div > div.media-left.cover-detail > img"
  );

  const data = {};

  if (titleElement) {
    data.title = titleElement.textContent.trim();
  } else {
    console.debug(
      "No se pudo encontrar el título en la página de leercapitulo.co"
    );
  }

  if (chapterElement) {
    data.chapter = chapterElement.textContent.trim().replace("Capitulo ", "");
  } else {
    console.debug(
      "No se pudo encontrar el capítulo en la página de leercapitulo.co"
    );
  }

  if (titleBElement && bannerElement) {
    data.title = titleBElement.textContent.trim();
    data.bannerUrl = bannerElement.src;
  } else {
    console.debug(
      "No se encontró un banner o título secundario para actualizar."
    );
  }

  return data;
}

function extractNextButtonFromLeerCapitulo() {
  let btn = document.querySelector(
    "body > section > div.container.bgposition-relative > div:nth-child(3) > div.col-md-7.col-sm-6 > div > select"
  );
  if (btn && btn.value == 1)
    return document.querySelector(
      "body > section > div.container.bgposition-relative > div:nth-child(9) > div.col-md-5.col-sm-6.paddfixboth > div > div > div.col-xs-2.paddfixboth.rightalign > a"
    );
  return undefined;
}
/**
 * Extrae la informacion de Manhwa
 *
 * @returns data{title,<bannerUrl|chapter>}
 */
function extractDataFromManhwa() {
  const titleElement = document.querySelector(
    "#root > div > div:nth-child(1) > div > div:nth-child(4) > div.text-center.xs\\:text-lg.md\\:text-3xl.pt-4.px-3"
  );
  const chapterElement = document.querySelector(
    "#root > div > div:nth-child(1) > div > div:nth-child(4) > div.text-center.text-sm.xs\\:text-base.md\\:text-2xl.pt-4.pb-6.px-3 > span"
  );
  const titleBElement = document.querySelector(
    "#root > div > div:nth-child(1) > div > div.container.mx-auto.max-w-6xl.sm\\:mt-5.mt-2 > div > div > div.sm\\:w-3\\/4.max-w-md.sm\\:max-w-none > div > h2"
  );
  const bannerElement = document.querySelector(
    "#root > div > div:nth-child(1) > div > div.container.mx-auto.max-w-6xl.sm\\:mt-5.mt-2 > div > div > div.sm\\:w-1\\/4.w-2\\/3 > div.relative.w-full > img"
  );
  const isMature = document.querySelector("#root > div > div:nth-child(1) > div > div.container.mx-auto.max-w-6xl.sm\\:mt-5.mt-2 > div > div > div.sm\\:w-1\\/4.w-2\\/3 > div.relative.w-full > div > span");

  const data = {};

  if (titleElement) {
    data.title = titleElement.textContent.trim();
  } else {
    console.debug(
      "No se pudo encontrar el título en la página de leercapitulo.co"
    );
  }

  if (chapterElement) {
    data.chapter = chapterElement.textContent.trim().replace("Capitulo ", "");
  } else {
    console.debug(
      "No se pudo encontrar el capítulo en la página de leercapitulo.co"
    );
  }

  if (titleBElement && bannerElement && !isMature) {
    data.title = titleBElement.textContent.trim();
    data.bannerUrl = bannerElement.src;
  } else {
    console.debug(
      "No se encontró un banner o título secundario para actualizar."
    );
  }

  return data;
}

function extractNextButtonFromManhwa() {
  if (
    document.querySelector(
      "#__nuxt > div > div > div.mx-auto.relative.z-10 > div > main > div.flex.flex-col.items-center.gap-8.py-8 > div.flex-center.bg-gray-800.p-4.rounded-xl.gap-4 > a.h-12.px-4.bg-gray-900\\/50.flex-center.gap-2.rounded-xl.hover\\:text-amber-500.transition-color.sf-ripple-container > div > div:nth-child(2)"
    ).textContent == "Capítulo siguiente"
  )
    return document.querySelector(
      "#__nuxt > div > div > div.mx-auto.relative.z-10 > div > main > div.flex.flex-col.items-center.gap-8.py-8 > div.flex-center.bg-gray-800.p-4.rounded-xl.gap-4 > a.h-12.px-4.bg-gray-900\\/50.flex-center.gap-2.rounded-xl.hover\\:text-amber-500.transition-color.sf-ripple-container"
    );
  return undefined;
}

/**
 * Extrae la informacion de Taurusmanga
 *
 * @returns data{title,<bannerUrl|chapter>}
 */
function extractDataFromTaurusmanga() {
  const titleElement = document.querySelector("#chapter-heading");
  const chapterElement = document.querySelector("#nombre");
  const titleBElement = document.querySelector("#title");
  const bannerElement = document.querySelector(
    "body > div.wrap > div > div.site-content > div > div.c-page-content.style-1 > div > div > div > div > div > div.c-page > div > div.profile-manga > div > div.summary_image > a > img"
  );

  const data = {};

  if (titleElement) {
    data.title = titleElement.textContent.replace("-").trim();
  } else {
    console.debug(
      "No se pudo encontrar el título en la página de leercapitulo.co"
    );
  }

  if (chapterElement) {
    data.chapter = chapterElement.textContent.replace("Capitulo ", "").trim();
  } else {
    console.debug(
      "No se pudo encontrar el capítulo en la página de leercapitulo.co"
    );
  }

  if (titleBElement && bannerElement) {
    data.title = titleBElement.textContent.trim();
    data.bannerUrl = bannerElement.src;
  } else {
    console.debug(
      "No se encontró un banner o título secundario para actualizar."
    );
  }

  return data;
}

function extractNextButtonFromTaurusmanga() {
  return document.querySelector(
    "#manga-reading-nav-foot > div > div.select-pagination > div > div > a"
  );
}

function getExtractorFunction() {
  const url = document.location.href;

  if (url.includes("leerolymp.com")) {
    return extractDataFromLeerOlymp;
  } else if (url.includes("leercapitulo.co")) {
    return extractDataFromLeerCapitulo;
  } else if (url.includes("manhwaweb.com")) {
    return extractDataFromManhwa;
  } else if (url.includes("taurusmanga.com")) {
    return extractDataFromTaurusmanga;
  }

  console.debug("No se encontró un extractor para este sitio.");
  return null;
}

function getExtractorButton() {
  const url = document.location.href;

  if (url.includes("leerolymp.com")) {
    return extractNextButtonFromLeerOlymp;
  } else if (url.includes("leercapitulo.co")) {
    return extractNextButtonFromLeerCapitulo;
  } else if (url.includes("manhwaweb.com")) {
    return extractNextButtonFromManhwa;
  } else if (url.includes("taurusmanga.com")) {
    return extractNextButtonFromTaurusmanga;
  }

  console.debug("No se encontró un boton para este sitio.");
  return null;
}

function isNextButtonVisible() {
  const funcExtractorButton = getExtractorButton(); // Debe retornar el botón del episodio siguiente
  if (!funcExtractorButton) return false;

  const nextButton = funcExtractorButton();

  // Si no se encuentra el botón, retornar false
  if (!nextButton || !(nextButton instanceof Element)) {
    console.debug(
      "No se encontró el botón de siguiente episodio o no es un elemento HTML válido."
    );
    return false;
  }

  const rect = nextButton.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;

  // Verificar si el botón es visible en la ventana
  console.debug("Es visible : ", rect.top >= 0 && rect.bottom <= windowHeight);
  return rect.top >= 0 && rect.bottom <= windowHeight;
}

function checkAutoNextChapter() {
  if (isInCooldown) {
    console.debug("Auto-next capítulo está en cooldown. Espera unos segundos.");
    return; // Si está en cooldown, no hacer nada
  }

  chrome.storage.local.get(["autoNextChapter"], (result) => {
    const isAutoNextChapterEnabled = result.autoNextChapter || false;

    if (isAutoNextChapterEnabled && isNextButtonVisible()) {
      console.debug(
        'Botón de "Siguiente Episodio" visible. Pasando al siguiente episodio automáticamente.'
      );

      const funcExtractorButton = getExtractorButton(); // Debe retornar el botón del episodio siguiente
      if (!funcExtractorButton) return;

      const nextButton = funcExtractorButton();
      if (nextButton) {
        nextButton.click();
      }

      // Activar el cooldown después de hacer clic en el botón de siguiente episodio
      isInCooldown = true;
      setTimeout(() => {
        isInCooldown = false; // Después de 2 segundos, desactivar el cooldown
        console.debug(
          "Cooldown finalizado, listo para pasar al siguiente episodio."
        );
      }, 2000); // Cooldown de 2 segundos
    }
  });
}

function restoreScrollPosition() {
  const extractorFunction = getExtractorFunction();
  if (!extractorFunction) return;

  const extractedData = extractorFunction();
  if (!extractedData || !extractedData.title || !extractedData.chapter) return;

  chrome.storage.local.get(["mangaProgress"], (result) => {
    if (chrome.runtime.lastError) {
      console.debug(
        "Error al acceder al almacenamiento local:",
        chrome.runtime.lastError
      );
      return;
    }

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
        console.debug(
          "Progreso encontrado para el capítulo:",
          extractedData.chapter
        );
        isAutoScrolling = true; // Set flag to indicate programmatic scroll
        window.scrollTo(window.scroll, chapterInfo.scrollPosition);
        console.debug(
          "Posición de scroll restaurada a:",
          chapterInfo.scrollPosition
        );

        // Reset flag after the scroll completes
        setTimeout(() => {
          isAutoScrolling = false;
        }, 500);
      } else {
        console.debug(
          "No se encontró progreso guardado para el capítulo actual."
        );
      }
    } else {
      console.debug("No se encontró progreso guardado para este manga.");
    }
  });
}

function saveMangaProgress() {
  try {
    const extractorFunction = getExtractorFunction();
    if (!extractorFunction) return;

    const extractedData = extractorFunction();

    // Asegurarse de que el título y el capítulo sean válidos
    if (!extractedData || !extractedData.title) {
      console.debug("No se pudo extraer el título.");
      return;
    }

    if (!extractedData.chapter) {
      console.debug(
        "No se pudo extraer el capítulo. Usando valor predeterminado."
      );
      extractedData.chapter = "default"; // Asignar un valor predeterminado si no se encuentra el capítulo
    }

    const currentScrollPosition = window.scrollY;
    const currentTimestamp = new Date().toISOString(); // Timestamp actual en formato ISO

    chrome.storage.local.get(["mangaProgress"], (result) => {
      if (chrome.runtime.lastError) {
        console.debug(
          "Error al acceder al almacenamiento local:",
          chrome.runtime.lastError
        );
        return;
      }

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
      try {
        chrome.storage.local.set({ mangaProgress: progressData }, () => {
          if (chrome.runtime.lastError) {
            console.debug(
              "Error al guardar el progreso:",
              chrome.runtime.lastError
            );
          } else {
            console.debug(
              "Progreso actualizado:",
              progressData[extractedData.title]
            );
          }
        });
      } catch (e) {
        console.debug(
          "Error inesperado al intentar guardar en chrome.storage:",
          e
        );
      }
    });
  } catch (error) {
    console.debug("Error inesperado al guardar el progreso del manga:", error);
  }
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

// Guardar la serie y capítulo actuales al cargar la página
function initializeCurrentData() {
  const extractorFunction = getExtractorFunction();
  if (!extractorFunction) return;

  const extractedData = extractorFunction();
  if (extractedData && extractedData.title && extractedData.chapter) {
    currentTitle = extractedData.title;
    currentChapter = extractedData.chapter;
    console.debug("Datos iniciales:", currentTitle, currentChapter);
  }
}

// Comprobar si la serie o el capítulo han cambiado
function hasSeriesOrChapterChanged() {
  const extractorFunction = getExtractorFunction();
  if (!extractorFunction) return false;

  const extractedData = extractorFunction();
  if (extractedData && extractedData.title && extractedData.chapter) {
    const titleChanged = extractedData.title !== currentTitle;
    const chapterChanged = extractedData.chapter !== currentChapter;

    if (titleChanged || chapterChanged) {
      currentTitle = extractedData.title;
      currentChapter = extractedData.chapter;
      console.debug(
        "Serie o capítulo cambiados:",
        currentTitle,
        currentChapter
      );
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
