import DateFormatter from "../helpers/DateFormatter.js";
import Reports from "../model/Reports.js";

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

function renderReportsBattles(reportsBattles = []) {
    const rankingTable = document.querySelector('table#reports > tbody');
    rankingTable.innerHTML = '';

    reportsBattles.forEach(async ({ hash, gladiator: gladName, reward, time }) => {
        const tableRow = document.createElement('tr');

        if (parseInt(reward) < 0) tableRow.classList.add('battle-lost');
        if (parseInt(reward) > 0) tableRow.classList.add('battle-won');

        const timeAgo = DateFormatter.getTimeAgo(new Date(time));

        tableRow.innerHTML = `
            <td class="glad">
                <label>
                    <i class="fa-solid fa-star"></i>
                    <input type="checkbox" class="favorite-glad-checkbox">
                </label>

                <a href="https://gladcode.dev/play/${hash}">${gladName}</a>
            </td>
            <td class="renown">${parseInt(reward)}</td>
            <td class="date">${timeAgo}</td>
        `;

        rankingTable.appendChild(tableRow);
    });
}

async function showReports({ page }) {
    const { total, reports: reportsBattles } = await Reports.getAllReports({ page });
    renderReportsBattles(reportsBattles);

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


async function battleAction() {
    const btnFilter = document.querySelector('button#btn-filter');
    const filterModal = document.querySelector('dialog.filter-modal');

    btnFilter.addEventListener('click', () => {
        filterModal.showModal();
    });

    // ------------

    let page = 1;

    const prevButton = document.querySelector('button.back-button');
    const nextButton = document.querySelector('button.next-button');

    const { total } = await showReports({ page });
    renderNewPage(page, { total });

    const changePage = async increment => {
        const newPage = page + increment;
        if (newPage < 1) return;

        page = newPage;

        await showReports({ page });
        renderNewPage(newPage, { total });
    }

    prevButton.addEventListener('click', async () => await changePage(-1));
    nextButton.addEventListener('click', async () => await changePage(+1));
}

export default battleAction;