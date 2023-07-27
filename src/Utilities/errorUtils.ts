import * as vscode from "vscode";

// Log and throw error
export function logAndThrowError(errorMessage: string, errorDetails: Error) {
  const error = errorMessage + ": " + errorDetails.message;
  console.error(error, errorDetails.stack);
  throw new Error(error);
}

// Log and display error to the user
export function logAndDisplayError(errorMessage: string, errorDetails: Error) {
  const error = errorMessage + ": " + errorDetails.message;
  console.error(error, errorDetails.stack);
  vscode.window.showErrorMessage(error);
}
