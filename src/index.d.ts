import * as zlib from 'node:zlib'

type Config = {
  glob: string;
  gzip?: boolean | zlib.ZlibOptions;
  brotli?: boolean | zlib.BrotliOptions;
  zstd?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}