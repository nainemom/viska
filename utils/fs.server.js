import { statSync } from "fs"

export const getStat = (filePath) => {
  try {
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      return 'directory';
    }
    return 'file';
  } catch (_e) {
    return null;
  }

}
