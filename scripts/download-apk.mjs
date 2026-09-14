import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const apk = {
  version: '2.2.0',
  fileName: 'wdio-native-demo-app-2.2.0.apk',
  url: 'https://github.com/webdriverio/native-demo-app/releases/download/v2.2.0/android.wdio.native.app.v2.2.0.apk',
  sha256: 'fe1d605ce099c73d93f33e5cbcb0df0bea437ce57aaaaf156b3b0fa1ca54931d',
  size: 123595826,
};

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(projectRoot, 'apps', 'android');
const targetPath = path.join(outputDirectory, apk.fileName);
const temporaryPath = path.join(
  outputDirectory,
  `.${apk.fileName}.${process.pid}.part`,
);
const force = process.argv.slice(2).includes('--force');
const unsupportedArguments = process.argv
  .slice(2)
  .filter((argument) => argument !== '--force');

if (unsupportedArguments.length > 0) {
  throw new Error(
    `Unsupported argument(s): ${unsupportedArguments.join(', ')}. Use --force to replace an existing APK.`,
  );
}

async function sha256(filePath) {
  const hash = createHash('sha256');
  const stream = createReadStream(filePath);

  for await (const chunk of stream) {
    hash.update(chunk);
  }

  return hash.digest('hex');
}

async function verify(filePath) {
  const fileStats = await stat(filePath);
  const digest = await sha256(filePath);

  return {
    sizeMatches: fileStats.size === apk.size,
    digestMatches: digest === apk.sha256,
    actualSize: fileStats.size,
    actualDigest: digest,
  };
}

await mkdir(outputDirectory, { recursive: true });

try {
  const existing = await verify(targetPath);

  if (existing.sizeMatches && existing.digestMatches) {
    console.log(`APK ${apk.version} is already available at ${targetPath}`);
    process.exit(0);
  } else if (!force) {
    throw new Error(
      `An APK already exists at ${targetPath}, but it does not match the pinned release `
        + `${apk.version} (size=${existing.actualSize}, sha256=${existing.actualDigest}). `
        + 'Review it or rerun with --force to replace it.',
    );
  }
} catch (error) {
  if (error?.code !== 'ENOENT') {
    throw error;
  }
}

try {
  const response = await fetch(apk.url, {
    headers: {
      'User-Agent': 'mobile-automation-final-practice/apk-fetcher',
    },
    redirect: 'follow',
  });

  if (!response.ok || !response.body) {
    throw new Error(`APK download failed with HTTP ${response.status} ${response.statusText}`);
  }

  const contentLengthHeader = response.headers.get('content-length');
  const contentLength = contentLengthHeader === null
    ? undefined
    : Number(contentLengthHeader);
  if (contentLength !== undefined && Number.isFinite(contentLength) && contentLength !== apk.size) {
    throw new Error(
      `Unexpected APK size from release (${contentLength} bytes; expected ${apk.size}).`,
    );
  }

  await pipeline(
    Readable.fromWeb(response.body),
    createWriteStream(temporaryPath, { flags: 'wx' }),
  );

  const downloaded = await verify(temporaryPath);
  if (!downloaded.sizeMatches || !downloaded.digestMatches) {
    throw new Error(
      `Downloaded APK failed verification (size=${downloaded.actualSize}, sha256=${downloaded.actualDigest}).`,
    );
  }

  if (force) {
    await rm(targetPath, { force: true });
  }

  await rename(temporaryPath, targetPath);
  console.log(`Downloaded and verified APK ${apk.version} at ${targetPath}`);
} finally {
  await rm(temporaryPath, { force: true });
}
