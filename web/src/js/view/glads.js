import HTMLParser from '../helpers/HTMLParser.js';
import Gladiator from '../model/Gladiator.js';

// Prototype
// Melhorias:
// ~ Conseguir gerar a imagem dos gladiadores nos cards
// ~ Criar um componente pros cards

{/* <dialog id="glad-code-modal">
    <button class="btnClose">X</button>

    <div class="code-header">
        <span class="filename"></span>
        <button class="edit-code">
            <i class="fa-solid fa-pen"></i>
        </button>
    </div>

    <pre class="glad-code">
        <code>

        </code>
    </pre>
</dialog> */}


function initModal() {
    const codeModal = document.querySelector('#glad-code-modal');
    const btnClose = codeModal.querySelector('button.btnClose');

    const filenameSpan = codeModal.querySelector('.filename');
    const codeElement = codeModal.querySelector('pre.glad-code code');
    const btnEditCode = codeModal.querySelector('button.edit-code');

    btnClose.addEventListener('click', () => {
        filenameSpan.textContent = '';
        codeElement.textContent = '';
        removeAllEventListeners(btnEditCode);

        codeModal.close();
    });
}

function generateFilename(name, language) {
    const extensions = {
        python: 'py',
        c: 'c',
        blocks: 'blocks'
    };

    const filename = name.toLowerCase()
        .replace(/\./g, '')        // Remove pontos
        .replace(/[^\w\s-]/g, '')  // Remove caracteres não alfanuméricos (exceto hífens e espaços)
        .replace(/\s+/g, '-')      // Substitui espaços por hífens
        .replace(/-+/g, '-')       // Remove múltiplos hífens consecutivos
        .replace(/^-+|-+$/g, '');  // Remove hífens do início e fim
    
    const extension = extensions[language.toLowerCase()] || language.toLowerCase();
    
    return filename ? `${filename}.${extension}` : `untitled.${extension}`;
}

function removeAllEventListeners(element) {
    const clone = element.cloneNode(true);
    element.replaceWith(clone);
    return clone;
}

async function showCode({ id }) {
    const codeModal = document.querySelector('#glad-code-modal');

    const filenameSpan = codeModal.querySelector('.filename');
    const codeElement = codeModal.querySelector('pre.glad-code code');
    const btnEditCode = codeModal.querySelector('button.edit-code');
    
    const { name, language, code } = await Gladiator.getGladiatorCode(id);

    // Setar as informações do modal
    filenameSpan.textContent = generateFilename(name, language);
    codeElement.textContent = code || Gladiator.GENERIC_PYTHON_CODE;
    
    const redirectEvent = () => location.href = `https://gladcode.dev/glad-${id}`;
    btnEditCode.addEventListener('click', redirectEvent);
    
    // Mostrar o modal
    codeModal.showModal();
}

function generateGladCard({
    cod: id,
    name,
    vstr: attrSTR,
    vagi: attrAGI,
    vint: attrINT,
    language,
    code
}) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.classList.add('card--glad');

    card.innerHTML = `
        <div class="delete-button-container">
            <button class="delete">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>

        <div class="glad-image">
            <canvas width="64" height="64"></canvas>
        </div>

        <section class="info">
            <div class="row attr">
                <div class="str" title="Força">
                    <i class="fa-solid fa-dumbbell fa-xs"></i>
                    <span>${attrSTR}</span>
                </div>

                <div class="agi" title="Agilidade">
                    <i class="fa-solid fa-person-running fa-xs"></i>
                    <span>${attrAGI}</span>
                </div>

                <div class="int" title="Inteligência">
                    <i class="fa-solid fa-book-open-reader fa-xs"></i>
                    <span>${attrINT}</span>
                </div>
            </div>

            <div class="row glad">
                <span>${name}</span>
            </div>

            <div class="row code">
                <button title="Ver código-fonte">&lt;/&gt;</button>
            </div>
        </section>
    `;

    const btnShowCode = card.querySelector('.row.code > button');
    btnShowCode.addEventListener('click', async () => showCode({ id }));

    return card;
}

function generateCard(card) {
    const cardTypesMap = {
        'glad': card => generateGladCard(card.glad),
        'unlocked': card => {
            return HTMLParser.parse(`
                <div class="card card--unlocked">
                    <p class="info">${card.message}</p>
                </div>    
            `);
        },
        'locked': card => {
            return HTMLParser.parse(`
                <div class="card card--locked">
                    <p class="info">${card.message}</p>
                </div>
            `);
        },
    }

    if (card.type in cardTypesMap === false)
    throw new Error(`Invalid card type "${card.type}"`);

    return cardTypesMap[card.type](card);
}

function renderCards(cards) {
    const cardsList = document.querySelector('#glad-cards');
    cardsList.innerHTML = '';
    
    cards.forEach(card => {
        const cardElement = generateCard(card);
        cardsList.appendChild(cardElement);
    });
}

async function gladsAction() {
    console.log('setupping modal...');
    initModal();

    const cards = await Gladiator.getUserGladCards();
    renderCards(cards);
}

export default gladsAction;
