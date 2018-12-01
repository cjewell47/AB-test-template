/*
* @Author: Craig Bojko
* @Date:   2017-03-15 15:37:06
* @Last Modified by:   Craig Bojko
* @Last Modified time: 2017-03-16 12:14:17
*/

import 'colors'
import npmPackage from './package'
import path from 'path'
import webpack from 'webpack'
import LiveReloadPlugin from 'webpack-livereload-plugin'
import SmartBannerPlugin from 'smart-banner-webpack-plugin'
import precss from 'precss'
import autoprefixer from 'autoprefixer'

const __RFC_ID = npmPackage.rfc
const NODE_ENV = process.env.NODE_ENV
const NPM_SOURCE_MAPS = process.env.NODE_SOURCE || false
const NPM_JQUERY = npmPackage.npmJquery || false
const isProd = (NODE_ENV === 'production')

const lessVarsDev = {
  'sourceMap': '',
  'modifyVars': {
    'ns': __RFC_ID,
    'bodyDisplayOnLoad': 'block'
  }
}
const lessVarsProd = {
  'modifyVars': {
    'ns': __RFC_ID,
    'bodyDisplayOnLoad': 'none'
  }
}

function getBuildBanner () {
  let npmPackage = require('./package')
  let date = new Date()
  let copy = ''
  copy += 'Author: ' + npmPackage.author + ' - Experian Consumer Services'
  copy += '\nFilename: [filename]'
  copy += '\nVersion: ' + npmPackage.version
  copy += '\nDate: ' + date.toISOString()
  copy += '\nDescription: ' + npmPackage.description
  console.log(copy.gray)
  return copy
}

/**
 * webpack config defaults and base configuration
 * @type {Object}
 */
let wbConfig = {
  cache: true,
  entry: {
    main: path.join(__dirname, '/index.js')
  },
  output: {
    path: path.join(__dirname, '/build/'),
    filename: '[name].js',
    sourceMapFilename: '[name].map'
  },
  // watch: true,
  keepalive: true,
  debug: true,
  plugins: [
    new webpack.OldWatchingPlugin(),
    new SmartBannerPlugin(getBuildBanner(), { raw: false, entryOnly: true })
  ],
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
  module: {
    loaders: [
      { test: /\.html$/, loader: 'underscore-template-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader?presets[]=es2015'
      }
    ]
  },
  postcss: () => {
    return [precss, autoprefixer]
  },
  externals: {}
}

/**
 * Branches additional webpack options depending on Environmental build - see Makefile
 * @param  {boolean} !isProd - branch flag
 * @return {void}
 */
if (!isProd) { // DEVELOPMENT
  /**
   * Add source maps
   * Push live reload plugins
   * Push Uglify - keep debugger statements, do not mangle
   * Push Define - Common variables for build
   * Define Output as build/dev
   */
  wbConfig['devtool'] = (NPM_SOURCE_MAPS === 'true') ? 'inline-source-map' : 'eval'
  // wbConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
  wbConfig.plugins.push(new LiveReloadPlugin({
    appendScriptTag: true
  }))
  wbConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      drop_debugger: false,
      warnings: false
    },
    mangle: false
  }))
  wbConfig.plugins.push(new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('development'),
      'RFC_NAMESPACE': JSON.stringify(__RFC_ID),
      'NPM_JQUERY': JSON.stringify(NPM_JQUERY)
    }
  }))
  wbConfig.module.loaders.push({ test: /\.css|less$/, loader: 'style!css?sourceMap!postcss-loader!less?' + JSON.stringify(lessVarsDev) })

  wbConfig.output = {
    path: path.join(__dirname, '/build/dev/'),
    filename: '[name].dev.js',
    sourceMapFilename: '[name].dev.map'
    // ## Add this to overwrite sourcemap URIs to absolute file paths
    // devtoolModuleFilenameTemplate: function (info) {
    //   return 'file://' + encodeURI(info.absoluteResourcePath)
    // }
  }
} else { // PRODUCTION
  /**
   * Push Uglify - drop debugger/console/comments statements, mangle code
   * Push Define - Common variables for build
   * Push Banner - defined in above function
   * Define Output as build/prod
   */
  wbConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      drop_debugger: true,
      drop_console: false,
      warnings: false
    },
    output: {
      comments: false
    },
    mangle: true
  }))
  wbConfig.plugins.push(new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production'),
      'RFC_NAMESPACE': JSON.stringify(__RFC_ID),
      'NPM_JQUERY': JSON.stringify(NPM_JQUERY)
    }
  }))
  wbConfig.plugins.push(new SmartBannerPlugin(getBuildBanner(), { raw: false, entryOnly: true })) // put header back in after uglify strips out
  wbConfig.module.loaders.push({ test: /\.css|less$/, loader: 'style!css!postcss-loader!less?' + JSON.stringify(lessVarsProd) })

  wbConfig.output = {
    path: path.join(__dirname, '/build/prod/'),
    filename: '[name].min.js'
  }
}

// Force provider only if set in package.json
// Ensures that jquery isn't bundled if not explicityly set
if (NPM_JQUERY === true) {
  wbConfig.plugins.push(new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    _: 'lodash'
  }))
}

/**
 * Export config
 * @type {object}
 */
export default wbConfig
