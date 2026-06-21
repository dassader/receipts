export function registerServiceWorker() {
  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL }).catch(() => {
        // The app remains fully usable without offline caching.
      });
    });
  }
}

export function fileBaseName(receiptNumber: string) {
  const safeReceiptNumber = receiptNumber.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "");
  return safeReceiptNumber ? `receipt-${safeReceiptNumber}` : "receipt";
}
