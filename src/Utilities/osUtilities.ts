import * as os from "os";
import { execSync } from "child_process";

export function getBashCommand(): string {
  return os.platform() === "win32" ? `wsl bash` : `bash`;
}

export function getExtensionPathOSAgnostic(extensionPath: string): string {
  if (os.platform() === "win32") {
    // eslint-disable-next-line prettier/prettier
    return execSync(`wsl wslpath -u '${extensionPath}'`).toString().trim().replace(" ", "\ ");
  } else {
    return extensionPath;
  }
}
