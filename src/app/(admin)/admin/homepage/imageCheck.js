const ASPECT_TOLERANCE = 0.08; // warn when an upload is >8% off the target shape

function readImageSize(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

// Resolves false only when the image is clearly the wrong shape for its spot
// and the admin chose not to upload it anyway.
export async function confirmShape(file, target) {
  const size = await readImageSize(file);
  if (!size) return true; // let the server reject unreadable files
  const want = target.width / target.height;
  const got = size.width / size.height;
  if (Math.abs(got - want) / want <= ASPECT_TOLERANCE) return true;
  return window.confirm(
    `This image is ${size.width} × ${size.height}, but this spot is shaped for ` +
      `${target.width} × ${target.height}. It will be cropped to fit.\n\nUpload anyway?`,
  );
}
