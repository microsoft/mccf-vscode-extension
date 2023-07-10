import * as vscode from "vscode";
import * as os from 'os';

export function getBashCommand() : string
{
    return os.platform() === 'win32' ? `wsl bash` : `bash`;
}