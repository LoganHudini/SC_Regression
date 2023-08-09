export function readFileAsBase64(
  file: File,
): Promise<{ base64: string; contentType: string; fileName: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = (error) => {
      reader.abort();
      reject(error);
    };

    reader.onloadend = () => {
      const fullBase64String = reader.result as string;
      const fileName = file.name;
      const base64String = fullBase64String?.replace('data:', '').replace(/^.+,/, '');

      const contentType = (
        fullBase64String.replace('data:', '').match(/^.+;/) as string[]
      )[0].split(';')[0];

      resolve({ base64: base64String, contentType: contentType, fileName });
    };

    reader.readAsDataURL(file);
  });
}
