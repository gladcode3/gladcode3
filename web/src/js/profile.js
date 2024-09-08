import HTMLLoaderMenu from './components/html-loader-menu.js';
import Switch from './components/switch-input.js';
import newsAction from './view/news.js';
import validateSession from './helpers/session-validator.js';
import GoogleLogin from './helpers/google-login.js';

import '../less/profile.less';

// esta é a credencial que tem que enviar para o backend
const credential = GoogleLogin.getCredential();
// console.log(credential);

const api = await validateSession();
const user = await api.post('back_login.php', { action: 'GET' });
console.log(user);

const logout = async () => {
    const logoutData = await api.post('back_login', { action: 'UNSET' });

    window.location.href = '/';

    GoogleLogin.removeCredential();
    sessionStorage.removeItem('lastSelectedPanel');

    return logoutData;
};

const logoutButton = document.querySelector('.page-links__link.logout');
logoutButton.addEventListener('click', async () => await logout());

const panelSelectorInfos = {
    target: document.querySelector('section#selected-panel'),

    menu: document.querySelector('.panel-selector__panels'),

    items: [
        { default: true, id: 'news', path: '/panels/news.html', action: newsAction },
        { id: 'glads', path: '/panels/glads.html', action: () => console.log('glads') },
        { id: 'battle', path: '/panels/battle.html', action: () => console.log('battle')},
        { id: 'potions', path: '/panels/potions.html', action: () => console.log('potions') },
        { id: 'rank', path: '/panels/rank.html', action: () => console.log('rank')},
        { id: 'messages', path: '/panels/messages.html', action: () => console.log('messages')},
    ],
};

new HTMLLoaderMenu(panelSelectorInfos);
customElements.define('switch-input', Switch);
