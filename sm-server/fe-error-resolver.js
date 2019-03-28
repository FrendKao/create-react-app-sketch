var fs = require('fs');
var sourceMap = require('source-map');

const ErrorType = {
  CodeError: 1,
  ResourceError: 2,
  PromiseRejectionError: 3,
  UnhandledRejectionError: 4,
  NetworkError: 5
};

function parseSourceMap(file, lineno, colno, config) {
  const smFileObj = JSON.parse(file.toString());

  return new Promise((resolve, reject) => {
    sourceMap.SourceMapConsumer.with(smFileObj, null, consumer => {
      if(!consumer) {
        reject(new Error('Unknown Exception'));
      }

      const result = consumer.originalPositionFor({
        line: lineno,
        column: colno
      });
      const index = consumer.sources.indexOf(result.source);
      const sourceContent = consumer.sourcesContent[index];
      const sources = sourceContent.split('\n');
      const LINES = config && config.lines ? config.lines : 5;
  
      const start = result.line - LINES > 0 ? (result.line - LINES) : 0;
      const end = (result.line + LINES) < sources.length ? (result.line + LINES) : sources.length;
  
      resolve({
        sourceMap: {
          lineno: result.line,
          colno: result.column,
          filename: result.source,
          codeblock: sources.slice(start - 1, end).map((item, index) => ({
            lineno: start + index,
            content: item
          }))
        }
      });
    });
  });
}

module.exports = function(sourceMapDir, error, config) {
  return new Promise((resolve, reject) => {
    switch(error.type) {
      case ErrorType.CodeError:
        const {filename, lineno, colno} = error;
        const filenameWithoutPath = filename ? filename.substr(filename.lastIndexOf('/') + 1) : '';
        const fileData = fs.readFileSync(`${sourceMapDir}/${filenameWithoutPath}.map`);

        if(fileData) {
          parseSourceMap(fileData, lineno, colno, config).then(data => {
            resolve({
              ...error,
              ...data
            });
          }).catch(() => {
            reject(new Error('Unknown Exception'));
          });
        } else {
          resolve(error);
        }
        break;
      case ErrorType.PromiseRejectionError:
        const stack = error.stack ? error.stack.split('\n') : [];

        try {
          const fileInfo = stack[1] ? stack[1].substr(stack[1].lastIndexOf('/') + 1) : '';
          const [filenameWithoutPath, lineno, colno] = fileInfo.split(':');
          const fileData = fs.readFileSync(`${sourceMapDir}/${filenameWithoutPath}.map`);

          parseSourceMap(fileData, parseInt(lineno), parseInt(colno), config).then(data => {
            resolve({
              ...error,
              ...data
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
