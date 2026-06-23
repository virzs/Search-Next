export const getDominantColor = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) {
          resolve("rgba(128,128,128,1)");
          return;
        }

        canvas.width = 1;
        canvas.height = 1;
        context.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
        resolve(`rgba(${r},${g},${b},1)`);
      } catch {
        resolve("rgba(128,128,128,1)");
      }
    };

    img.onerror = () => {
      resolve("rgba(128,128,128,1)");
    };

    img.src = imageUrl;
  });
};
