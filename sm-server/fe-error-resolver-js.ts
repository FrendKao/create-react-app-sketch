var fs = require('fs');
var sourceMap = require('source-map');

enum ErrorType {
  CodeError = 1,
  ResourceError,
  PromiseRejectionError,
  UnhandledRejectionError,
  NetworkError
};

interface Config {
  readonly lines?: number,
  [propName: string]: any
}

interface DiorError {
  type: number,
  message: string,
  stack?: string,
  reason?: string,
  filename?: string,
  lineno?: number,
  colno?: number,
  nodeName?: number,
  outerHTML?: number,
  src?: string
}

interface OriginalPosition {
  lineno: number,
  colno: number,
  filename: string,
  codeblock: Array<{lineno: number, content: string}>
}

interface SourceMap {
  version: number,
  sources: Array<string>,
  names: Array<string>,
  sourceRoot: string,
  sourcesContent: Array<string>,
  mappings: string,
  file: string
}

interface SMResult {
  source: string,
  line: number,
  column: number,
  name: string
}

interface SMError extends DiorError {
  sourceMap?: OriginalPosition
}

function parseSourceMap(file: Buffer, lineno: number, colno: number, config?: Config): Promise<OriginalPosition> {
  const smFileObj: SourceMap = JSON.parse(file.toString());

  return new Promise((resolve, reject) => {
    sourceMap.SourceMapConsumer.with(smFileObj, null, (consumer: any) => {
      if(!consumer) {
        reject(new Error('Unknown Exception'));
      }

      const result: SMResult = consumer.originalPositionFor({
        line: lineno,
        column: colno
      });
      const index: number = consumer.sources.indexOf(result.source);
      const sourceContent: string = consumer.sourcesContent[index];
      const sources: Array<string> = sourceContent.split('\n');
      const LINES: number = config && config.lines ? config.lines : 5;
  
      const start: number = result.line - LINES > 0 ? (result.line - LINES) : 0;
      const end: number = (result.line + LINES) < sources.length ? (result.line + LINES) : sources.length;
  
      resolve({
        lineno: result.line,
        colno: result.column,
        filename: result.source,
        codeblock: sources.slice(start - 1, end).map((item: string, index: number) => ({
          lineno: start + index,
          content: item
        }))
      });
    });
  });
}

module.exports = function(sourceMapDir: string, error: DiorError, config?: Config): Promise<SMError> {
  return new Promise((resolve, reject) => {
    switch(error.type) {
      case ErrorType.CodeError:
        const {filename, lineno, colno} = error;
        const filenameWithoutPath = filename ? filename.substr(filename.lastIndexOf('/') + 1) : '';
        const fileData = fs.readFileSync(`${sourceMapDir}/${filenameWithoutPath}.map`);

        if(fileData) {
          parseSourceMap(fileData, lineno, colno, config).then((data: OriginalPosition) => {
            resolve({
              ...error,
              sourceMap: data
            });
          }).catch(() => {
            reject(new Error('Unknown Exception'));
          });
        } else {
          resolve(error);
        }
        break;
      case ErrorType.PromiseRejectionError:
        const stack: Array<string> = error.stack ? error.stack.split('\n') : [];

        try {
          const fileInfo = stack[1] ? stack[1].substr(stack[1].lastIndexOf('/') + 1) : '';
          const [filenameWithoutPath, lineno, colno] = fileInfo.split(':');
          const fileData: Buffer = fs.readFileSync(`${sourceMapDir}/${filenameWithoutPath}.map`);

          parseSourceMap(fileData, parseInt(lineno), parseInt(colno), config).then((data: OriginalPosition) => {
            resolve({
              ...error,
              sourceMap: data
            });
          }).catch(() => {
            reject(new Error('Unknown Exception'));
          });
        } catch(err) {
          resolve(error);
        }
        break;
      case ErrorType.ResourceError:
      case ErrorType.UnhandledRejectionError:
        resolve(error);
        break;
      case ErrorType.NetworkError:
        break;
      default:
        reject(new Error('Unknown Error'));
        break;
      }
  });
};
