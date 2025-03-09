import Session from './model/session.js';
import newsAction from './view/news.js';

import './components/loader-menu.js'
import './components/gc-header.js';
import './components/gc-user-infos.js';
import './components/gc-post.js';
import '../less/dashboard.less';
import Users from './model/users.js';

Session.validate();

const lateralBar = document.querySelector('#page-container > aside');
const footer = lateralBar.querySelector('footer');

const loaderMenu = document.createElement('loader-menu');
loaderMenu.setup({
    target: 'section#selected-panel',
    default: 'news',
    
    items: [
        {
            id: 'news', label: 'notícias', faIcon: 'fa-bell',
            path: '../panels/news.html', action: newsAction },
        {
            id: 'glads', label: 'gladiadores', faIcon: 'fa-street-view',
            path: '../panels/glads.html', action: () => console.log('glads')
        },
        {
            id: 'battle', label: 'batalha', faIcon: 'fa-shield-halved',
            path: '../panels/battle.html', action: () => console.log('battle')
        },
        {
            id: 'potions', label: 'poções', faIcon: 'fa-flask',
            path: '../panels/potions.html', action: () => console.log('potions')
        },
        {
            id: 'rank', label: 'ranking', faIcon: 'fa-ranking-star', notify: false,
            path: '../panels/rank.html', action: () => console.log('rank')},
        {
            id: 'messages', label: 'mensagens', faIcon: 'fa-message',
            path: '../panels/messages.html', action: () => console.log('messages')
        },
    ]
});

lateralBar.insertBefore(loaderMenu, footer);

// Prototype

const userData = Users.getLocalUserData();
console.log(userData);

const dialog = document.querySelector('dialog');

// Pre-setando o modal:

const updateNicknameInput = document.querySelector('input#update-nickname');
const updatePrefLanguageSelect = document.querySelector('select#update-pref-language');
const preferenceCheckboxes = document.querySelectorAll('input[id^="update-pref"]');

console.log(
    updateNicknameInput,
    updatePrefLanguageSelect,
    preferenceCheckboxes
);

updateNicknameInput.value = userData.nickname;

const settings1 = document
.querySelector('gc-header')
.shadowRoot
.querySelector('.main-container__user-settings');

console.warn(settings1);

const settings2 = document
.querySelector('gc-header')
.shadowRoot
.querySelector('.user__user-settings');

console.warn(settings2);

settings1?.addEventListener('click', () => dialog.showModal());
settings2?.addEventListener('click', () => dialog.showModal());
