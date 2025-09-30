// Utilidades para acceso a la cámara y escaneo de códigos de barras
import Quagga from 'quagga';

// Función para abrir la cámara y escanear un código de barras
export async function openCamera() {
  return new Promise(async (resolve, reject) => {
    try {
      // Comprobar si el navegador soporta la API de MediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso a la cámara');
      }

      // Crear elementos para mostrar la cámara
      const videoElement = document.createElement('video');
      const cameraContainer = document.createElement('div');
      const scannerRegion = document.createElement('div');
      
      // Configurar estilos del contenedor
      cameraContainer.style.position = 'fixed';
      cameraContainer.style.top = '0';
      cameraContainer.style.left = '0';
      cameraContainer.style.width = '100%';
      cameraContainer.style.height = '100%';
      cameraContainer.style.backgroundColor = 'rgba(0,0,0,0.8)';
      cameraContainer.style.zIndex = '9999';
      cameraContainer.style.display = 'flex';
      cameraContainer.style.flexDirection = 'column';
      cameraContainer.style.justifyContent = 'center';
      cameraContainer.style.alignItems = 'center';
      
      // Configurar región de escaneo
      scannerRegion.id = 'scanner-container';
      scannerRegion.style.width = '100%';
      scannerRegion.style.maxWidth = '500px';
      scannerRegion.style.height = '300px';
      scannerRegion.style.overflow = 'hidden';
      scannerRegion.style.position = 'relative';
      scannerRegion.style.border = '3px solid #fff';
      
      // Botón para cerrar
      const closeButton = document.createElement('button');
      closeButton.textContent = 'Cancelar';
      closeButton.style.marginTop = '20px';
      closeButton.style.padding = '10px 20px';
      closeButton.style.backgroundColor = '#F44336';
      closeButton.style.color = 'white';
      closeButton.style.border = 'none';
      closeButton.style.borderRadius = '4px';
      closeButton.style.cursor = 'pointer';
      
      // Añadir elementos al DOM
      cameraContainer.appendChild(scannerRegion);
      cameraContainer.appendChild(closeButton);
      document.body.appendChild(cameraContainer);
      
      // Función para limpiar y cerrar la cámara
      const cleanup = () => {
        Quagga.stop();
        if (cameraContainer && cameraContainer.parentNode) {
          cameraContainer.parentNode.removeChild(cameraContainer);
        }
      };
      
      // Manejar el cierre manual
      closeButton.addEventListener('click', () => {
        cleanup();
        resolve(null);
      });
      
      // Inicializar Quagga
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRegion,
          constraints: {
            facingMode: "environment", // Usar cámara trasera si está disponible
          },
        },
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "code_128_reader",
            "code_39_reader",
            "upc_reader",
            "upc_e_reader"
          ],
          debug: {
            showCanvas: true,
            showPatches: true,
            showFoundPatches: true,
            showSkeleton: true,
            showLabels: true,
            showPatchLabels: true,
            showRemainingPatchLabels: true,
          }
        },
      }, function(err) {
        if (err) {
          console.error("Error al inicializar Quagga:", err);
          cleanup();
          reject(err);
          return;
        }
        
        Quagga.start();
      });
      
      // Detectar cuando se encuentra un código de barras
      Quagga.onDetected((result) => {
        if (result && result.codeResult && result.codeResult.code) {
          const barcode = result.codeResult.code;
          cleanup();
          resolve(barcode);
        }
      });
      
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      reject(error);
    }
  });
}