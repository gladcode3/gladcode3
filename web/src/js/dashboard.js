import Session from './model/session.js';
import HTMLLoaderMenu from './components/html-loader-menu.js';
import newsAction from './view/news.js';
// import GoogleLogin from './helpers/google-login.js';
import Users from './model/users.js';
import _GladcodeHeader from './components/gc-header.js';

import '../less/dashboard.less';

Session.validate();

console.log(await Users.getUserData());
console.log(await Users.getUserByName('GustavoRutkowski'));


const userInfos = Users.getLocalUserData();

const nickname = document.querySelector('#user .main-infos__nickname');
nickname.textContent = userInfos.nickname;

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

// Fazer com que o Dashboard apenas instancie uma classe header e a classe do menu
