import GoogleLogin from './helpers/google-login.js';
import Session from './model/session.js';

import './components/gc-header.js';
import '../less/home.less';

if (GoogleLogin.tokenIsExpired()) Session.logout();
