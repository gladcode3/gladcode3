import Rank from "../model/rank.js";

// RANKING PROTOTYPE:

// Melhorias:
// - Desabilitar botões ao atingir o limite de páginas
// - Adicionar highlight nos gladiadores do usuário
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

function getOffsetRankInterval(offset) {
    const start = offset + 1;
    const end = offset + 10;

    return [start, end];
}

async function rankAction() {
    let offset = 0;
    let search = "";

    const prevButton = document.querySelector('button.back-button');
    const nextButton = document.querySelector('button.next-button');
    const pageLabel = document.querySelector('.page-label')
    const rankSearch = document.querySelector('input.ranking-search'); // input type="search"

    const rankData = await Rank.get({ offset, search });

    const { total } = rankData;
    let { ranking: rankList } = rankData;

    renderRank(rankList);

    const changePageCallback = async increment => {
        const newOffset = offset + increment;

        if (newOffset >= 0 && newOffset < total && rankList.length > 0) offset = newOffset;

        const rankData = await Rank.get({ offset, search });
        rankList = rankData.ranking;

        renderRank(rankList);

        const [start, end] = getOffsetRankInterval(offset);
        pageLabel.innerHTML = `<span>${start}</span> - <span>${end}</span> de <span>${total}</span>`;
    }

    prevButton.addEventListener('click', async () => await changePageCallback(-10));
    nextButton.addEventListener('click', async () => await changePageCallback(+10));

    rankSearch.addEventListener('input', async e => {
        e.preventDefault();

        search = rankSearch.value;

        if (search && search !== "") {
            offset = 0;
        }

        const rankData = await Rank.get({ offset, search });
        rankList = rankData.ranking;

        renderRank(rankList);

        const [start, end] = getOffsetRankInterval(offset);
        pageLabel.innerHTML = `<span>${start}</span> - <span>${end}</span> de <span>${total}</span>`;
    });
}

export default rankAction;
