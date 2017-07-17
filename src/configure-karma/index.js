import mergeKarma from '../util/merge-karma'
import path from 'path'

export default (saguiConfig = {}, webpackConfig) => {
  return mergeKarma(
    buildStandardKarmaConfig(saguiConfig, webpackConfig),
    saguiConfig.additionalKarmaConfig
  )
}

const buildStandardKarmaConfig = (saguiConfig, webpackConfig) => {
  const { projectPath, watch, coverage, additionalKarmaConfig = {} } = saguiConfig

  return {
    // Webpack itself supports an array of configurations
    // and although harmless to have them all running the tests
    // it is not required and only produces double execution
    webpack: Array.isArray(webpackConfig) ? webpackConfig[0] : webpackConfig,

    basePath: projectPath,

    browsers: ['PhantomJS'],

    reporters: [
      'mocha',
      ...(coverage ? ['coverage'] : [])
    ],

    frameworks: ['jasmine', 'detectBrowsers'],

    detectBrowsers: {
      enabled: additionalKarmaConfig.browsers && additionalKarmaConfig.browsers > 0,
      usePhantomJS: true,

      postDetection: function (availableBrowser) {
        if (availableBrowser.indexOf('Chrome') > -1 && process.env['CHROME_BIN']) {
          return ['ChromeHeadless']
        }

        return ['PhantomJS']
      }
    },

    // first run will have the full output and
    // the next runs just output the summary and
    // errors in mocha style
    mochaReporter: {
      output: 'autowatch'
    },

    coverageReporter: {
      dir: path.join(projectPath, 'coverage'),
      reporters: [
        { type: 'html', subdir: 'html' },

        // outputs the coverage report in the console
        { type: 'text' }
      ]
    },

    // we don't watch any of the files here,
    // since that is taken care by the preprocessors
    files: [
      { pattern: 'node_modules/sagui/karma-static-files/test-bundle.js', watched: false },
      { pattern: 'src/**/*', watched: false, included: false }
    ],

    preprocessors: {
      // add webpack as preprocessor
      'node_modules/sagui/karma-static-files/test-bundle.js': ['webpack', 'sourcemap']
    },

    webpackServer: {
      noInfo: true
    },

    singleRun: !watch,
    autoWatch: watch
  }
}
