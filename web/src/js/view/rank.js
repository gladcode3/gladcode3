import Debounce from "../helpers/Debounce.js";
import Rank from "../model/Rank.js";


function renderRank(rank = []) {
    const rankingTable = document.querySelector('table#ranking > tbody');
    rankingTable.innerHTML = '';

    rank.forEach(async ({ cod: gladId, position, glad: gladName, master, mmr: renown }) => {
        const tableRow = document.createElement('tr');

        if ((await Rank.USER_GLADS_IDS).includes(gladId))
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

async function showRank({ page, search }) {
    const { total, ranking: rankList } = await Rank.get({ page, search });
    renderRank(rankList);

    const [start, end] = Rank.getPageInterval({ page });

    const pageLabel = document.querySelector('.page-label');
    pageLabel.innerHTML = `
        <span>${start}</span>
         - <span>${end > total ? total : end}</span>
         de <span>${total}</span>
    `;

    return { total, rankList };
}

function renderNewPage(newPage, { total }) {
    const prevButton = document.querySelector('button.back-button');
    const nextButton = document.querySelector('button.next-button');

    prevButton.removeAttribute('disabled');
    nextButton.removeAttribute('disabled');

    if (newPage === 1) {
        prevButton.setAttribute('disabled', true);
    }

    if ((newPage * Rank.LIMIT) >= total) {
        nextButton.setAttribute('disabled', true);
    }
}

async function rankAction() {
    let page = await Rank.START_PAGE || 1;
    let search = '';

    const prevButton = document.querySelector('button.back-button');
    const nextButton = document.querySelector('button.next-button');
    const rankSearch = document.querySelector('input.ranking-search'); // input type="search"

    let { total } = await showRank({
        page,
        search
    });

    const changePage = async increment => {
        const newPage = page + increment;
        if (newPage < 1) return;

        page = newPage;

        await showRank({
            page,
            search
        });

        renderNewPage(newPage, { total });
    }

    prevButton.addEventListener('click', async () => await changePage(-1));
    nextButton.addEventListener('click', async () => await changePage(+1));

    rankSearch.addEventListener('input', new Debounce(async e => {
        e.preventDefault();

        search = rankSearch.value;

        if (search) page = 1;
        if (search === '') page = await Rank.START_PAGE;

        total = (await showRank({
            page,
            search
        })).total;

        renderNewPage(page, { total });
    }, 500).getCallback());
}

export default rankAction;
