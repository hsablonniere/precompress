import workerpool from 'workerpool';
import zlib from 'node:zlib';
import fs from 'node:fs';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import { createLogger } from './logger.js';

const pipe = promisify(pipeline);

const COMPRESSION = {
  gzip: 'gz',
  brotli: 'br',
};


async function compressFile(filePath, options) {
  const logger = createLogger(options.logLevel || 'info');
  logger.info(`Starting compression for ${filePath}`);

  try {
    const tasks = [];

    const createCompressionTask = async (algorithm, stream) => {
      const inputStream = fs.createReadStream(filePath);
      const outputStream = fs.createWriteStream(`${filePath}.${COMPRESSION[algorithm]}`);
      logger.debug(`Compressing ${filePath} with ${algorithm}`);
      await pipe(inputStream, stream, outputStream);
      logger.info(`${filePath} compressed with ${algorithm}`);
      return `${filePath} compressed with ${algorithm}`;
    };

    // GZIP compression
    if (options.gzip) {
      const gzipOptions = typeof options.gzip === 'object' ? options.gzip : {};
      const gzipStream = zlib.createGzip(gzipOptions);
      tasks.push(createCompressionTask('gzip', gzipStream));
    }

    // Brotli compression
    if (options.brotli) {
      const brotliOptions = typeof options.brotli === 'object' ? options.brotli : {};
      const brotliStream = zlib.createBrotliCompress(brotliOptions);
      tasks.push(createCompressionTask('brotli', brotliStream));
    }

    // Execute all compression tasks in parallel
    const results = await Promise.all(tasks);
    logger.info(`Finished compression for ${filePath}`);
    return results.join(', ');
  } catch (error) {
    logger.error(`Error while compressing ${filePath}: ${error.message}`);
    throw error;
  }
}

workerpool.worker({
  compressFile,
});
