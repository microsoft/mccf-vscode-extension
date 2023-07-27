import { exec } from "child_process";

// Execute a command using the "exec" function asynchronously
export async function executeCommandAsync(command: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}
