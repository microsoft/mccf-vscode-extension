import * as os from "os";
import { execSync } from "child_process";

export function getBashCommand(): string {
  return os.platform() === "win32" ? `wsl bash` : `bash`;
}

export function getPathOSAgnostic(filePath: string): string {
  if (os.platform() === "win32") {
    return execSync(`wsl wslpath -u '${filePath}'`).toString().trim();
  } else {
    return filePath;
  }
}
