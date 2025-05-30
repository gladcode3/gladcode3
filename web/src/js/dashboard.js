import FormUtil from './helpers/FormUtil.js';
import Users from './model/Users.js';
import Session from './model/Session.js';
import newsAction from './view/news.js';
import rankAction from './view/rank.js';
import gladsAction from './view/glads.js';
import battleAction from './view/battle.js';

import './components/LoaderMenu.js'
import './components/GCHeader.js';
import './components/HamburguerMenu.js';
import './components/GCUserInfos.js';
import './components/GCPost.js';

import '../less/dashboard.less';

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
            path: '../panels/glads.html', action: gladsAction
        },
        {
            id: 'battle', label: 'batalha', faIcon: 'fa-shield-halved',
            path: '../panels/battle.html', action: battleAction
        },
        {
            id: 'potions', label: 'poções', faIcon: 'fa-flask',
            path: '../panels/potions.html', action: () => console.log('potions')
        },
        {
            id: 'rank', label: 'ranking', faIcon: 'fa-ranking-star', notify: false,
            path: '../panels/rank.html', action: rankAction},
        {
            id: 'messages', label: 'mensagens', faIcon: 'fa-message',
            path: '../panels/messages.html', action: () => console.log('messages')
        },
    ]
});

lateralBar.insertBefore(loaderMenu, footer);

// Prototype
// -> Criar os disparadores de evento do Dialog dentro do componente de header (onde há os elementos que de fato disparam o dialog)

const userData = Users.getLocalUserData();
console.log(userData);

const header = document.querySelector('gc-header');
const aside = document.querySelector('gc-user-infos');

const dialog = document.querySelector('dialog');
const dialogForm = dialog.querySelector('form');

console.log(dialogForm);

// Renderizando as informações pre-existentes no formulário:
new FormUtil(dialogForm).fillWithValues(userData);

// Fazendo o formulário funcionar

dialogForm.addEventListener('submit', async e => {
    e.preventDefault();
    
    try {
        // substituir por um toast nativo
        alert('Atualizações salvas com sucesso!');

        const formValues = new FormUtil(dialogForm).getValuesMap();
    
        await Users.update({
            nickname: formValues['nickname'],
            emailPref: {
                pref_language: formValues['pref_language'],
                pref_message : formValues['pref_message'],
                pref_friend  : formValues['pref_friend'],
                pref_update  : formValues['pref_update'],
                pref_duel    : formValues['pref_duel'],
                pref_tourn   : formValues['pref_tourn']
            }
        });

        const userInfos = Users.getLocalUserData();
        aside.setup(userInfos);
    } catch (e) {
        alert('Houve um erro ao atualizar o perfil. Tente novamente mais tarde!');
    }
});


const settings1 = document
.querySelector('gc-header')
.shadowRoot
.querySelector('.main-container__user-settings');


const settings2 = document
.querySelector('gc-header')
.shadowRoot
.querySelector('.user__user-settings');

settings1?.addEventListener('click', () => dialog.showModal());
settings2?.addEventListener('click', () => dialog.showModal());
