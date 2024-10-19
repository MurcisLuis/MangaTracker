// background.js

function updateStoredUrls() {
    chrome.storage.local.get("mangaProgress", (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error al acceder al almacenamiento local:", chrome.runtime.lastError);
        return;
      }
  
      if (result.mangaProgress) {
        let updated = false;
        const mangaProgress = result.mangaProgress;
  
        for (const mangaTitle in mangaProgress) {
          const mangaData = mangaProgress[mangaTitle];
  
          // Actualizar la URL principal si contiene el dominio antiguo
          if (mangaData.mainpage && mangaData.mainpage.includes("leerolymp.com")) {
            mangaData.mainpage = mangaData.mainpage.replace("leerolymp.com", "zonaolympus.com");
            updated = true;
          }
  
          // Actualizar el bannerUrl si es necesario
          if (mangaData.bannerUrl && mangaData.bannerUrl.includes("leerolymp.com")) {
            mangaData.bannerUrl = mangaData.bannerUrl.replace("leerolymp.com", "zonaolympus.com");
            updated = true;
          }
  
          // Actualizar las URLs de los capítulos
          if (mangaData.chapters) {
            for (const chapter in mangaData.chapters) {
              const chapterData = mangaData.chapters[chapter];
              if (chapterData.url && chapterData.url.includes("leerolymp.com")) {
                chapterData.url = chapterData.url.replace("leerolymp.com", "zonaolympus.com");
                updated = true;
              }
            }
          }
        }
  
        // Si se hicieron actualizaciones, guardar los datos actualizados
        if (updated) {
          chrome.storage.local.set({ mangaProgress }, () => {
            if (chrome.runtime.lastError) {
              console.error("Error al guardar los datos actualizados:", chrome.runtime.lastError);
            } else {
              console.log("URLs actualizadas de leerolymp.com a zonaolympus.com en el almacenamiento.");
            }
          });
        } else {
          console.log("No se encontraron URLs de leerolymp.com para actualizar.");
        }
      }
    });
  }
  
  // Llamar a updateStoredUrls cuando la extensión se instala o actualiza
  chrome.runtime.onInstalled.addListener(() => {
    console.log("Evento onInstalled disparado");
    updateStoredUrls();
  });
  
  // Llamar a updateStoredUrls cada vez que el navegador se inicia
  chrome.runtime.onStartup.addListener(() => {
    console.log("Evento onStartup disparado");
    updateStoredUrls();
  });
  