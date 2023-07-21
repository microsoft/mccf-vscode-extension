/* eslint-disable prettier/prettier */
import * as fs from "fs";
import * as path from "path";

// Create a directory from a given path
export function createFolder(folderPath: string) {
  // Check if the folder exists in the current file system. If not, create a certificates folder
  try {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
      console.info("Directory created successfully at " + folderPath);
    } else {
      throw new Error("Directory already exists at " + folderPath);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Copy the contents of a directory into a destination directory recursively
export function copyDirectoryRecursiveSync(
  srcDir: string,
  destDir: string,
  overwrite: boolean = false,
) {
  try {
    // Use copyFolder if the destination folder doesn't exist
    if (!fs.existsSync(destDir)) {
      fs.cpSync(srcDir, destDir, { errorOnExist: true, recursive: true });
    }

    // Get a list of all the files and directories in the source directory
    const files = fs.readdirSync(srcDir);

    // Copy each file or directory to the destination directory
    files.forEach((file) => {
      const srcPath = path.join(srcDir, file);
      const destPath = path.join(destDir, file);

      // If the current file is a directory, copy it
      if (fs.statSync(srcPath).isDirectory()) {
        fs.cpSync(srcPath, destPath, {
          force: overwrite,
          errorOnExist: true,
          recursive: true,
        });
      } else {
        overwrite
          ? fs.copyFileSync(srcPath, destPath)
          : fs.copyFileSync(srcPath, destPath, fs.constants.COPYFILE_EXCL);
      }
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Convert line endings of all files in a directory recursively to LF (\n)
export function convertLineEndingsRecursive(targetDir: string) {
  try {
    const files = fs.readdirSync(targetDir);

    files.forEach((file) => {
      const filePath = path.join(targetDir, file);

      if (fs.statSync(filePath).isDirectory()) {
        convertLineEndingsRecursive(filePath);
      } else {
        const content = fs.readFileSync(filePath, "utf8");
        const unixContent = content.replace(/\r\n/g, "\n");
        fs.writeFileSync(filePath, unixContent, { encoding: "utf8" });
      }
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Set the given permission for all files and folders inside a directory recursively
export function setPermissionsRecursively(targetDir: string, mode: number) {
  try {
    // Get a list of all the files and directories in the directory
    const files = fs.readdirSync(targetDir);

    // Modify the permissions for each file or directory
    files.forEach((file) => {
      const filePath = path.join(targetDir, file);

      // Set proper permissions for scripts
      if (path.extname(filePath) === ".sh") {
        fs.chmodSync(filePath, mode);
      }

      // If the current file is a directory, recursively go into it
      if (fs.statSync(filePath).isDirectory()) {
        setPermissionsRecursively(filePath, mode);
      }
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}
