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

function getOffsetRankInterval(limit, page) {
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

    let page = await getBestGladPage(LIMIT) || 1;
    let search = '';

    const prevButton = document.querySelector('button.back-button');
    const nextButton = document.querySelector('button.next-button');
    const rankSearch = document.querySelector('input.ranking-search'); // input type="search"
    const pageLabel = document.querySelector('.page-label');

    const rankData = await Rank.get({ limit: LIMIT, page, search });

    const { total } = rankData;
    let { ranking: rankList } = rankData;

    renderRank(rankList);

    const [start, end] = getOffsetRankInterval(LIMIT, page);
    pageLabel.innerHTML = `<span>${start}</span> - <span>${end}</span> de <span>${total}</span>`;

    const changePageCallback = async increment => {
        const newOffset = page + increment;

        if (newOffset >= 0 && newOffset < total && rankList.length > 0) page = newOffset;

        const rankData = await Rank.get({ limit: LIMIT, page, search });
        rankList = rankData.ranking;

        renderRank(rankList);

        const [start, end] = getOffsetRankInterval(LIMIT, page);
        pageLabel.innerHTML = `<span>${start}</span> - <span>${end}</span> de <span>${total}</span>`;
    }

    prevButton.addEventListener('click', async () => await changePageCallback(-1));
    nextButton.addEventListener('click', async () => await changePageCallback(+1));

    rankSearch.addEventListener('input', async e => {
        e.preventDefault();

        search = rankSearch.value;

        if (search && search !== "") {
            page = 0;
        }

        const rankData = await Rank.get({ limit: LIMIT, page, search });
        const searchTotal = rankData.total;
        rankList = rankData.ranking;

        renderRank(rankList);

        const [start, end] = getOffsetRankInterval(LIMIT, page);
        pageLabel.innerHTML = `<span>${start}</span> - <span>${end}</span> de <span>${searchTotal}</span>`;
    });
}

export default rankAction;
