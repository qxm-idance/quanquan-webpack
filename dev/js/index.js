import module from './module.js';
import head from './ctrl/head.js';
import index from './ctrl/index.js';
import config from './ctrl/config.js';
import blacklist from './ctrl/blacklist.js';
import maven from './ctrl/maven.js';
import login from './ctrl/login.js';
import route from './route.js';
import cache from './cache.js';
import service from './service.js';
import UserService from './utils/UserService.js';
// import 'babel-polyfill';

import '../css/base.css';
import '../css/table.css';
import '../css/button.css';
import '../css/form.css';
import '../css/input.css';
import '../css/dialog.css';
import '../css/loading.css';
import '../css/other.css';
import '../css/suggest.css';
import '../css/scroll.css';
import '../css/icon.css';
import '../css/animate.css';

module.service('UserService', UserService);
module.controller('headCtrl', ['Service', '$rootScope', 'UserService', head]);
module.controller('indexCtrl', ['Service', '$rootScope', index]);
module.controller('configCtrl', ['Service', '$rootScope', '$timeout', config]);
module.controller('blacklistCtrl', ['Service', '$rootScope', 'msTip', 'msConfirm', 'msModal', blacklist]);
module.controller('mavenCtrl', ['Service', '$rootScope', maven]);
module.controller('loginCtrl', login);
