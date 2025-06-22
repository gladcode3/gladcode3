import DateFormatter from "../helpers/DateFormatter.js";
import Reports from "../model/Reports.js";

import "../components/LoaderMenu.js";

/*
<tr class="battle">
    <td class="glad">
        <label>
            <i class="fa-regular fa-star"></i>
            <input type="checkbox" class="favorite-glad-checkbox">
        </label>

        Glad1
    </td>
    <td class="renown">3000</td>
    <td class="date">Há 2 anos atrás</td>
</tr>
*/

const RANKED_TAB = 'ranked';
const UNREAD_TAB = 'unread';
const DUELS_TAB = 'duels';
const FAVORITES_TAB = 'favorites';

// Promise que funciona como um prompt convencional, porem, usando um Pop-up customizado.
function customInput({ type = 'string', message = '' } = {}) {
    return new Promise((resolve) => {
        const popup = document.querySelector('#custom-prompt');
        
        const label = popup.querySelector('label');
        const input = popup.querySelector('input#custom-prompt__input');

        if (type === 'string') {
            input.style.display = 'inline-block';
            input.value = ''; // Limpa o input
        }
        if (type === 'boolean') input.style.display = 'none';
        
        label.textContent = message;
        popup.showModal();

        if (type === 'string') input.focus();

        const btnCancel = popup.querySelector('button#btn-cancel');
        const btnConfirm = popup.querySelector('button#btn-confirm');

        const closeAndCleanup = () => {
            popup.close();
            btnCancel.removeEventListener('click', onCancel);
            btnConfirm.removeEventListener('click', onConfirm);
            popup.removeEventListener('keydown', onKeyDown);
        };

        function onCancel(e) {
            e.preventDefault();

            let value = null;
            if (type === 'boolean') value = false;

            closeAndCleanup();
            resolve(value);
        };

        function onConfirm(e) {
            e.preventDefault();

            let value = input.value.trim() || '';
            if (type === 'boolean') value = true;

            closeAndCleanup();
            resolve(value);
        };

        function onKeyDown(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                onCancel(e);
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                onConfirm(e);
            }
        }

        btnCancel.addEventListener('click', onCancel);
        btnConfirm.addEventListener('click', onConfirm);
        popup.addEventListener('keydown', onKeyDown);
    });
}

const customPrompt = async message => await customInput({ type: 'string' , message });
const customConfirm = async message => await customInput({ type: 'boolean', message });

function _getRankedRaw(rankedBattle) {
    const { hash, gladiator: gladName, reward, time, favorite } = rankedBattle;
    const timeAgo = DateFormatter.getTimeAgo(new Date(time));

    const checked = favorite ? 'checked' : '';

    return `
        <td class="glad">
            <label>
                <i class="fa-solid fa-star"></i>
                <input type="checkbox" class="favorite-glad-checkbox" ${checked}>
            </label>

            <a href="https://gladcode.dev/play/${hash}">${gladName}</a>
        </td>
        <td class="renown">${parseInt(reward)}</td>
        <td class="date">${timeAgo}</td>
    `;
}

function _getDuelRaw(glad) {
    // ...
}

function _getFavoriteRaw(favoriteBattle) {
    const { hash, gladiator: gladName, comment, time } = favoriteBattle;
    const timeAgo = DateFormatter.getTimeAgo(new Date(time));

    return `
        <td class="glad">
            <label>
                <i class="fa-solid fa-star"></i>
                <input name="fav-glad" type="checkbox" class="favorite-glad-checkbox" checked>
            </label>

            <a href="https://gladcode.dev/play/${hash}">${gladName}</a>
        </td>
        <td class="comment">${comment}</td>
        <td class="date">${timeAgo}</td>
    `;
}

// retorna true se a batalha passou a ser favorita e false se passou a não ser
async function favoriteBattle(battle) {
    if (battle.favorite) {
        // Lança um confirm personalizado
        const confirm = await customConfirm('Remover batalha dos favoritos?');
        if (!confirm) return true;

        await Reports.toggleReportFavorite(battle.id);
        return false;
    }

    // Lança um prompt personalizado
    const comment = await customPrompt('Informe um comentário sobre a batalha...');
    if (!comment) return false;

    await Reports.toggleReportFavorite(battle.id, { comment });
    return true;
}

function renderReportsBattles(mode, reportsBattles = []) {
    const rankingTable = document.querySelector('table#reports > tbody');
    rankingTable.innerHTML = '';

    reportsBattles.forEach(async battle => {
        const tableRow = document.createElement('tr');

        if (battle.reward && parseInt(battle.reward) < 0) tableRow.classList.add('battle-lost');
        if (battle.reward && parseInt(battle.reward) > 0) tableRow.classList.add('battle-won');

        const modesMap = {
            [RANKED_TAB]: _getRankedRaw,
            [UNREAD_TAB]: _getRankedRaw,
            [DUELS_TAB]: _getDuelRaw,
            [FAVORITES_TAB]: _getFavoriteRaw
        };

        if (mode in modesMap === false) throw new Error('invalid mode!');
        tableRow.innerHTML = modesMap[mode](battle);

        const favoriteCheckbox = tableRow.querySelector('td.glad label input.favorite-glad-checkbox');
        
        if (favoriteCheckbox) {
            favoriteCheckbox
            .addEventListener('click', async e => {
                const isFavorite = await favoriteBattle(battle);
                e.target.checked = isFavorite;

                if ((mode === FAVORITES_TAB) && (!isFavorite)) tableRow.remove();
            });
        }

        rankingTable.appendChild(tableRow);
    });
}

async function showReports({ page }, tab, getReportsCallback) {
    // const { total, reports: reportsBattles } = await Reports.getAllReports({ page });
    const { total, reports: reportsBattles } = await getReportsCallback({ page });
    renderReportsBattles(tab, reportsBattles);

    const [start, end] = Reports.getPageInterval({ page });

    const pageLabel = document.querySelector('.page-label');

    pageLabel.innerHTML = `
        <span>${start}</span>
         - <span>${end > total ? total : end}</span>
         de <span>${total}</span>
    `;

    return { total, rankList: reportsBattles };
}

function renderNewPage(newPage, { total }) {
    const prevButton = document.querySelector('button.back-button');
    const nextButton = document.querySelector('button.next-button');

    prevButton.removeAttribute('disabled');
    nextButton.removeAttribute('disabled');

    if (newPage === 1) {
        prevButton.setAttribute('disabled', true);
    }

    if ((newPage * Reports.LIMIT) >= total) {
        nextButton.setAttribute('disabled', true);
    }
}

async function reportsAction(tab, getReportsCallback) {
    let page = 1;

    const prevButton = document.querySelector('button.back-button');
    const nextButton = document.querySelector('button.next-button');

    const { total } = await showReports({ page }, tab, getReportsCallback);
    renderNewPage(page, { total });

    const changePage = async increment => {
        const newPage = page + increment;
        if (newPage < 1) return;

        page = newPage;

        await showReports({ page }, tab, getReportsCallback);
        renderNewPage(newPage, { total });
    }

    prevButton.addEventListener('click', async () => await changePage(-1));
    nextButton.addEventListener('click', async () => await changePage(+1));
}

async function battleAction() {
    const battleContainer = document.querySelector('#battle-container');
    console.log('battleContainer', battleContainer);
    const selectedTab = battleContainer.querySelector('section#selected-tab');
    console.log('selectedTab', selectedTab);

    const loaderMenu = document.createElement('loader-menu');
    loaderMenu.setup({
        target: 'section#selected-tab',
        default: 'ranked',

        items: [
            {
                id: 'ranked', label: 'batalhas',
                path: '../../panels/report-tabs/ranked.html',
                action: async () => await reportsAction(RANKED_TAB, Reports.getAllReports)
            },
            {
                id: 'unread', label: 'não lidas',
                path: '../../panels/report-tabs/unread.html',
                action: async () => await reportsAction(UNREAD_TAB, Reports.getAllUnreadedReports)
            },
            {
                id: 'duels', label: 'duelos',
                path: '../../panels/report-tabs/duels.html',
                action: () => console.log('duels...')
            },
            {
                id: 'favorites', label: 'favoritos', notify: false,
                path: '../../panels/report-tabs/ranked.html',
                action: async () => await reportsAction(FAVORITES_TAB, Reports.getAllFavoriteReports)
            }
        ]
    });

    battleContainer.insertBefore(loaderMenu, selectedTab);;
}

export default battleAction;