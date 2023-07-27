import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join, posix, sep } from "path";

const getAllFiles = function (
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
};

const removePrefix = function (s: string, prefix: string) {
  return s.substr(prefix.length).split(sep).join(posix.sep);
};

export async function buildBundle(
  rootDir: string,
  srcDir: string,
): Promise<{ bundle: string; appReg: string }> {
  const metadataPath = join(rootDir, "app.json");
  const metadata = JSON.parse(readFileSync(metadataPath, "utf-8"));

  const allFiles = getAllFiles(srcDir, undefined);

  // The trailing / is included so that it is trimmed in removePrefix.
  // This produces "foo/bar.js" rather than "/foo/bar.js"
  const toTrim = srcDir + "/";

  const modules = allFiles.map(function (filePath: string) {
    return {
      name: removePrefix(filePath, toTrim),
      module: readFileSync(filePath, "utf-8"),
    };
  });

  const bundlePath = join(rootDir, "bundle.json");
  const appRegPath = join(rootDir, "set_js_app.json");
  const bundle = {
    metadata: metadata,
    modules: modules,
  };
  const app_reg = {
    actions: [
      {
        name: "set_js_app",
        args: {
          bundle: bundle,
          disable_bytecode_cache: false,
        },
      },
    ],
  };

  console.log(
    `Writing bundle containing ${modules.length} modules to ${bundlePath}`,
  );
  writeFileSync(bundlePath, JSON.stringify(bundle));
  writeFileSync(appRegPath, JSON.stringify(app_reg));

  return {
    bundle: JSON.stringify(bundle),
    appReg: JSON.stringify(app_reg),
  };
}
