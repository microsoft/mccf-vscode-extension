import * as os from "os";
import { execSync } from "child_process";

export enum TerminalType {
  CommandPrompt = 'Command Prompt',
  PowerShell = 'PowerShell',
  LinuxTerminal = 'Linux Terminal',
}

export function getTerminalType(): TerminalType {
  const isWindows = process.platform === 'win32';

  if (isWindows) {
      try {
        execSync('Get-Process');
        return TerminalType.PowerShell;
      } catch (error) {
        return TerminalType.CommandPrompt;
      }
  } else {
      return TerminalType.LinuxTerminal;
  }
}

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

export function getWsl(): string {
  return os.platform() === "win32" ? `wsl ` : ``;
}
