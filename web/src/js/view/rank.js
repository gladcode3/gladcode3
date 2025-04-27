import Rank from "../model/rank.js";

// RANKING PROTOTYPE:

// Melhorias:
// - Adicionar highlight nos gladiadores do usuário
// - Desabilitar botões ao atingir o limite de páginas
// - Adicionar um algoritmo de debounce para evitar multiplas requisições para usuários que digitam rapido

function renderRank(rank = []) {
    const rankingTable = document.querySelector('table#ranking > tbody');
    rankingTable.innerHTML = '';

    rank.forEach(({ position, glad: gladName, master, mmr: renown }) => {
        const tableRow = document.createElement('tr');
        tableRow.classList.add('my-glad');

        tableRow.innerHTML = `
            <td class="glad-rank">${position}º</td>
            <td>${gladName}</td>
            <td>${master}</td>
            <td class="renown">${parseInt(renown)}</td>
        `;
        
        rankingTable.appendChild(tableRow);
    });
}

async function showRank({ limit, page, search }) {
    const { total, ranking: rankList } = await Rank.get({ limit, page, search });
    renderRank(rankList);

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

async function rankAction() {
    const LIMIT = 10;
    const START_PAGE = await getBestGladPage(LIMIT) || 1;

    let page = START_PAGE;
    let search = '';

    const prevButton = document.querySelector('button.back-button');
    const nextButton = document.querySelector('button.next-button');
    const rankSearch = document.querySelector('input.ranking-search'); // input type="search"

    let { total, rankList } = await showRank({ limit: LIMIT, page, search }); 

    const changePageCallback = async increment => {
        const newPage = page + increment;

        const [,newPageEnd] = getRankPageInterval(LIMIT, newPage);

        if (newPage >= 1 && newPageEnd < total && rankList.length > 0) page = newPage;

        rankList = (await showRank({ limit: LIMIT, page, search })).rankList;
    }

    prevButton.addEventListener('click', async () => await changePageCallback(-1));
    nextButton.addEventListener('click', async () => await changePageCallback(+1));

    rankSearch.addEventListener('input', async e => {
        e.preventDefault();

        search = rankSearch.value;

        if (search) page = 1;
        if (search === '') page = START_PAGE; 

        const rank = await showRank({ limit: LIMIT, page, search });

        total = rank.total;
        rankList = rank.rankList;
    });
}

export default rankAction;
