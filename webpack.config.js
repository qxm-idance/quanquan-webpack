const path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var devPath = path.join(__dirname + '/dev/js');

var ENV = process.env.npm_lifecycle_event;
var isBuild = ENV === 'build';
var isDev = ENV === 'dev';

module.exports = function cfg(){

  var cfg = {};

  cfg.entry = {
    // app: path.join(devPath),
    style: [
        path.resolve(__dirname, 'dev/css', 'checkbox-theme-default.css'),
        path.resolve(__dirname, 'dev/css', 'common.css'),
        path.resolve(__dirname, 'dev/css', 'dialogs-theme-default.css'),
        path.resolve(__dirname, 'dev/css', 'dropdown-theme-default.css'),
        path.resolve(__dirname, 'dev/css', 'modules.css'),
        path.resolve(__dirname, 'dev/css', 'select-theme-default.css'),
        path.resolve(__dirname, 'dev/css', 'ui-carousel.css'),
        path.resolve(__dirname, 'dev/css', 'ui-checkbox.css'),
        path.resolve(__dirname, 'dev/css', 'ui-dialogs.css'),
        path.resolve(__dirname, 'dev/css', 'ui-dropdown.css'),
        path.resolve(__dirname, 'dev/css', 'ui-input-select.css'),
        path.resolve(__dirname, 'dev/css', 'ui-pager.css'),
        path.resolve(__dirname, 'dev/css', 'ui-select.css')
    ]
  };
  
  if (isBuild) {
      cfg.entry.vendor = ['jquery', 'lodash', 'angular', 'angular-sanitize', 'angular-ui-route','echarts'];
  }

  cfg.output = {
      path: __dirname + '/static',
      publicPath: isBuild ? '/' : 'http://0.0.0.0:8080/',

      filename: isBuild ? 'js/[name].[hash:8].js' : '[name].bundle.js',

      chunkFilename: isBuild ? 'js/[name].[hash:8].js' : '[name].bundle.js'
  };

  if (isBuild) {
      cfg.devtool = 'source-map';
  } else {
      cfg.devtool = 'eval-source-map';
  }

  cfg.module = {
        preLoaders: [],
        loaders: [
            {
                test: /angular/i,
                loader: 'imports?$=jquery'
            },
            {
                test: /\/jquery\.js$/,
                loader: "expose?jQuery"
            },
            {
                test: /\.css$/,
                // loader: "style!css?sourceMap!postcss"
                //样式外部加载
                loader: ExtractTextPlugin.extract('style', 'css'),
                include: cfg.entry.style
            },
            {
                test: /\.(ttf|eot|svg|woff|woff2)$/,
                loader: 'file?name=font/[name].[ext]'
            },
            {
                test: /\.(jpg|png)$/,
                loader: 'url?limit=25000',
                include: cfg.entry.imgs
            },
            {
                test: /\.(html|htm)$/,
                loader: 'raw'
            }
        ]
    };

    cfg.plugins = [
        new HtmlWebpackPlugin({
            template: 'dev/index.html',
            inject: 'body'
        }),
        new webpack.DefinePlugin({
           __DEV__: isDev,
           __DEV_IP_ADDRESS__: '"' + ip()[0] + '"'
        }),
        new ExtractTextPlugin('css/[name].[hash:8].css', {disable: isDev}),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            '_': 'lodash'
        })
    ];

    if (isBuild) {
        cfg.plugins.push(
            new webpack.NoErrorsPlugin(),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin(),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                filename: 'js/vendor.[hash:8].js'
            })
        )
    }

    // cfg.devServer = {
    //     contentBase: 'dev',
    //     stats: 'minimal'
    // };

    return cfg;
}();


function ip() {
    var addresses = [],
        os = require('os'),
        interfaces = os.networkInterfaces();

    for (var ifaces in interfaces) {
        var iface = interfaces[ifaces].filter(function(detail) {
            return detail.family === 'IPv4' && detail.internal === false;
        });
        addresses = addresses.concat(iface);
    }

    return addresses.map(function(detail) {
        return detail.address;
    })
}