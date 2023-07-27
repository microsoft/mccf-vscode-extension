import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join, posix, sep } from "path";

const args = process.argv.slice(2);

export function getAllFiles(
  dirPath: string,
  arrayOfFiles: any | undefined,
): string[] {
  arrayOfFiles = arrayOfFiles || [];

  const files = readdirSync(dirPath);
  for (const file of files) {
    const filePath = join(dirPath, file);
    if (statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  }

  return arrayOfFiles;
}

export function removePrefix(s: string, prefix: string): string {
  return s.substr(prefix.length).split(sep).join(posix.sep);
}

export const rootDir = args[0];

const metadataPath = join(rootDir, "app.json");
export const metadata = JSON.parse(readFileSync(metadataPath, "utf-8"));

export const srcDir = join(rootDir, "src");
const allFiles = getAllFiles(srcDir, undefined);

// The trailing / is included so that it is trimmed in removePrefix.
// This produces "foo/bar.js" rather than "/foo/bar.js"
export const toTrim = srcDir + "/";

const modules = allFiles.map(function (filePath: string) {
  return {
    name: removePrefix(filePath, toTrim),
    module: readFileSync(filePath, "utf-8"),
  };
});

const bundlePath = join(args[0], "bundle.json");
const bundle = {
  metadata: metadata,
  modules: modules,
};
console.log(
  `Writing bundle containing ${modules.length} modules to ${bundlePath}`,
);
writeFileSync(bundlePath, JSON.stringify(bundle));
