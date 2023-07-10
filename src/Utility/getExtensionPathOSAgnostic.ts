import { execSync } from 'child_process';
import * as os from 'os';

export function getExtensionPathOSAgnostic(extensionPath: string) : string
{
    if(os.platform() === 'win32')
    {
        return execSync(`wsl wslpath -u '${extensionPath}'`).toString().trim();
    }
    else
    {
        return extensionPath;
    }
}