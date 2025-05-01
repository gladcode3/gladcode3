import HTMLParser from '../helpers/HTMLParser.js';
import Gladiator from '../model/Gladiator.js';

// Prototype
// Melhorias:
// ~ Conseguir gerar a imagem dos gladiadores nos cards
// ~ Criar um componente pros cards

function generateGladCard({
    name,
    vstr: attrSTR,
    vagi: attrAGI,
    vint: attrINT
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
    const cards = await Gladiator.getUserGladCards();
    renderCards(cards);
}

export default gladsAction;
