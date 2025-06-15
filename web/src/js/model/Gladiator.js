import Api from "../helpers/Api.js";
import Users from "./Users.js";

class Gladiator {
    static MAX_GLADS_SLOTS = 6;
    static LEVELS_TO_UNLOCK_1_GLAD = 10;

    static _api = null;

    static _setApiInstance() {
        try {
            if (!this._api) this._api = new Api();
        } catch(err) {
            console.log(err);
            throw err;
        }
    }

    static get GENERIC_PYTHON_CODE() {
        return `
            in_center = False

            def loop():
            \tif not in_center:
            \t\twhile not moveTo(12.5, 12.5):
            \t\t\tpass
            \tspeak('Cheguei no centro!')
        `
    }

    static async getUserGladiators() {
        this._setApiInstance();
        return await this._api.get('gladiators/master');
    }

    static async getGladiatorCode(id) {
        this._setApiInstance();
        return await this._api.get(`gladiators/code/${id}`);
    }

    static _getUsersGladiatorLimit({ level }) {
        return (Math.floor(level / this.LEVELS_TO_UNLOCK_1_GLAD) + 1);
    }

    static _getLockedCardsLvls({ level }) {
        return new Array(this.MAX_GLADS_SLOTS - 1).fill(0)
            .map((_, i) => (i + 1) * this.LEVELS_TO_UNLOCK_1_GLAD)
            .filter(cardLvl => cardLvl > level);
    }

    static async getUserGladCards() {
        const { lvl: level } = Users.getLocalUserData();
    
        // gladCards
        const gladsCards = (await Users.getGladiators())
            .map(card => ({ type: 'glad', glad: card }));
        
        // unlockedCards
        const usersGladLimit = this._getUsersGladiatorLimit({ level }) - gladsCards.length;

        const unlockedCards = new Array(usersGladLimit).fill({
            type: 'unlocked',
            message: 'Gladiador Disponível! Clique aqui para cria-lo!'
        });
        
        // lockedCards
        const lockedCards = this._getLockedCardsLvls({ level })
        .map(lvl => ({
            type: 'locked',
            message: `Atinja o nível ${lvl} de mestre para desbloquear este gladiador.`
        }));
    
        // Retorna a mescla de todos os arrays.
        return [...gladsCards, ...unlockedCards, ...lockedCards];
    }
}

export default Gladiator;
