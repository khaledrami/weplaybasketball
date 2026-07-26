const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const emptyModulePath = path.resolve(__dirname, 'empty-map-module.js');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return { type: 'sourceFile', filePath: emptyModulePath };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
