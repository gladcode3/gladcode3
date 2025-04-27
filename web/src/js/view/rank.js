import Rank from "../model/rank.js";
import Users from "../model/users.js";

// RANKING PROTOTYPE:

// Melhorias:
// - Adicionar um algoritmo de debounce para evitar multiplas requisições para usuários que digitam rapido

function renderRank(rank = [], userGladsIds=[]) {
    const rankingTable = document.querySelector('table#ranking > tbody');
    rankingTable.innerHTML = '';

    rank.forEach(({ cod: gladId, position, glad: gladName, master, mmr: renown }) => {
        const tableRow = document.createElement('tr');

        if (userGladsIds.includes(gladId))
            tableRow.classList.add('my-glad');

        tableRow.innerHTML = `
            <td class="glad-rank">${position}º</td>
            <td class="glad-name">${gladName}</td>
            <td class="glad-master">${master}</td>
            <td class="glad-mmr">${parseInt(renown)}</td>
        `;
        
        rankingTable.appendChild(tableRow);
    });
}

async function showRank({ limit, page, search }, userGladsIds=[]) {
    const { total, ranking: rankList } = await Rank.get({ limit, page, search });
    renderRank(rankList, userGladsIds);

    const [start, end] = getRankPageInterval(limit, page);

    const pageLabel = document.querySelector('.page-label');
    pageLabel.innerHTML = `<span>${start}</span> - <span>${end > total ? total : end}</span> de <span>${total}</span>`;

    return { total, rankList };
}

function getRankPageInterval(limit, page) {
    const start = (limit * (page - 1)) + 1;
    const end = limit * page;

    return [start, end];
}

async function getBestGladPage(limit) {
    const { position = 1 } = await Rank.getBestGlad() || {};
    const page = Math.ceil(position / limit);

    return page || 1;
}

function renderNewPage(newPage, { limit, total }) {
    const prevButton = document.querySelector('button.back-button');
    const nextButton = document.querySelector('button.next-button');

    prevButton.removeAttribute('disabled');
    nextButton.removeAttribute('disabled');

    if (newPage === 1) {
        prevButton.setAttribute('disabled', true);
    }

    if ((newPage * limit) >= total) {
        nextButton.setAttribute('disabled', true);
    }
}

async function rankAction() {
    // Cria uma lista com os IDs de todos os gladiadores do usuário
    const USER_GLADS = (await Users.getGladiators()).map(glad => glad.cod);

    const LIMIT = 10;
    const START_PAGE = await getBestGladPage(LIMIT) || 1;

    let page = START_PAGE;
    let search = '';

    const prevButton = document.querySelector('button.back-button');
    const nextButton = document.querySelector('button.next-button');
    const rankSearch = document.querySelector('input.ranking-search'); // input type="search"

    let { total } = await showRank({
        limit: LIMIT,
        page,
        search
    }, USER_GLADS);

    const changePageCallback = async increment => {
        const newPage = page + increment;
        if (newPage < 1) return;

        page = newPage;

        await showRank({
            limit: LIMIT,
            page,
            search
        }, USER_GLADS);

        renderNewPage(newPage, { limit: LIMIT, total });
    }

    prevButton.addEventListener('click', async () => await changePageCallback(-1));
    nextButton.addEventListener('click', async () => await changePageCallback(+1));

    rankSearch.addEventListener('input', async e => {
        e.preventDefault();

        search = rankSearch.value;

        if (search) page = 1;
        if (search === '') page = START_PAGE; 

        total = (await showRank({
            limit: LIMIT,
            page,
            search
        }, USER_GLADS)).total;

        renderNewPage(page, { limit: LIMIT, total });
    });
}

export default rankAction;
