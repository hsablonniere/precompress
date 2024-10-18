import workerpool from 'workerpool';
import { glob } from 'glob';
import os from 'node:os';
import compressible from 'compressible';
import mime from 'mime-types';
import { createLogger } from './logger.js';

/**
 * @typedef {import('./index').Config} Config
 */

/**
 * @param {Config} config - The configuration object
 */
async function run(config) {
  const logger = createLogger(config.logLevel || 'info');
  const startTime = Date.now();

  try {
    logger.info(`Searching files with pattern: ${config.glob}`);
    const files = await glob(config.glob);
    logger.info(`Found ${files.length || 0} files with the specified pattern.`);

    // Filter files that have compressible MIME types
    const compressibleFiles = files.filter(file => {
      const mimeType = mime.lookup(file) || 'application/octet-stream';
      const isCompressible = compressible(mimeType);
      logger.debug(`File: ${file}, MIME type: ${mimeType}, Compressible: ${isCompressible}`);
      return isCompressible;
    });

    logger.info(`Compressing ${compressibleFiles.length} compressible files with options: ${JSON.stringify(config)}`);
    const cpuCount = os.cpus().length;
    logger.debug(`Number of available CPU cores: ${cpuCount}`);

    const poolSize = Math.min(cpuCount, compressibleFiles.length);
    logger.debug(`Initialize pool size: ${poolSize}`);

    const pool = workerpool.pool('./src/worker.js', {
      minWorkers: 'max',
      maxWorkers: poolSize,
    });

    // Compress files in parallel with the specified options
    const results = await Promise.all(
      compressibleFiles.map(file => pool.exec('compressFile', [file, config]))
    );

    // Log each compression result
    results.forEach(result => logger.info(result));

    // Release worker resources
    await pool.terminate();
    logger.info('All compressible files have been processed successfully.');

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    logger.info(`Total compression time: ${duration} seconds`);
  } catch (error) {
    logger.error('Error during processing: ' + error);
  }
}

const config = {
  glob: 'demo/**/*.{html,txt}',
  gzip: true,
  brotli: true,
  logLevel: 'debug'
};

run(config);