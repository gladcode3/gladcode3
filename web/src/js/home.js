import GoogleLogin from './helpers/GoogleLogin.js';
import Session from './model/Session.js';

import './components/GCHeader.js';
import '../less/home.less';

if (GoogleLogin.tokenIsExpired()) Session.logout();
