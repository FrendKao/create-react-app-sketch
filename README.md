# create-react-app-sketch
React Web App Sketch

webpack4，react，react-router-dom5

## Sentry调研（前端）

### 优点：

1. 成熟的前端*代码*异常捕获机制
2. 高度可配置，支持自定义事件，支持多个前端框架的事件捕获
3. 功能丰富，支持source-map的源码定位，支持关联github、gitlab，方便创建和指派issue给相对应的开发者

### 缺点：

1. 资源大小相对较大，线上压缩版本约为22K
2. 配置流程较为繁琐，需要单独安装SDK到页面中，source-map需单独上传且需要上传线上js文件
3. 资源加载失败异常不能捕获
4. 性能影响，加载阶段和脚本执行阶段耗时较明显
5. sentry依赖的包较多，可扩展性（定制化）不高；且我们已经实现前端异常捕获的方法，以及更快速便捷地解析source-map


sentry-cli上传source-map流程

export SENTRY_ORG=cn-dragon
export SENTRY_PROJECT=javascript
export SENTRY_AUTH_TOKEN=8cec68a1f6f640299b465dbced46c46525df081cd28f41048c42d4fafe809fbf

sentry-cli releases new 1.0.0
sentry-cli releases files 1.0.0 upload-sourcemaps /path/to/source-map
