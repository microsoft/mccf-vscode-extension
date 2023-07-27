// Validate if a string is a valid URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url.startsWith("http") ? url : `http://${url}`);
    return true;
  } catch (error) {
    console.error("Invalid URL entered: " + error);
    return false;
  }
}
