import HTMLLoaderMenu from './components/html-loader-menu.js';
import Switch from './components/switch-input.js';
import newsAction from './view/news.js';
import GoogleLogin from './helpers/google-login.js';
import Api from './helpers/api.js';

import '../less/dashboard.less';

console.log(GoogleLogin.getCredential())

// Login
const api = new Api();

try {
    const data = await api.post('users/login');
    console.log(data)
    
    const user = await api.get('users');
    console.log(user);
} catch (e) {
    console.error(e);
}

// Logout
const logout = async () => {
    window.location.href = '/';

    GoogleLogin.removeCredential();
    sessionStorage.removeItem('lastSelectedPanel');
};

const logoutButton = document.querySelector('.page-links__link.logout');
logoutButton.addEventListener('click', async () => await logout());

// Panels
const panelSelectorInfos = {
    target: document.querySelector('section#selected-panel'),
    menu: document.querySelector('.panel-selector__panels'),

    items: [
        { default: true, id: 'news', path: '/panels/news.html', action: newsAction },
        { id: 'glads', path: '/view/glads.html', action: () => console.log('glads') },
        { id: 'battle', path: '/panels/battle.html', action: () => console.log('battle')},
        { id: 'potions', path: '/panels/potions.html', action: () => console.log('potions') },
        { id: 'rank', path: '/panels/rank.html', action: () => console.log('rank')},
        { id: 'messages', path: '/panels/messages.html', action: () => console.log('messages')},
    ],
};

new HTMLLoaderMenu(panelSelectorInfos);
customElements.define('switch-input', Switch);
