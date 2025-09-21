import Api from "../helpers/Api.js";
import Users from "./Users.js";

class Rank {
    static LIMIT = 10;
    static START_PAGE = Rank.getBestGladPage();

    static USER_GLADS_IDS = Rank.getUserGladsIds();

    static async getUserGladsIds() {
        return (await Users.getGladiators()).map(glad => glad.cod);
    }

    static _api = null;

    static _setApiInstance() {
        try {
            if (!this._api) this._api = new Api();
        } catch(err) {
            console.error(err);
            throw err;
        }
    }

    static async get({ page, search = '' }) {
        this._setApiInstance();
        return await this._api.get('rank/rank', {
            limit: this.LIMIT,
            page,
            search
        });
    }

    static async getBestGlad() {
        this._setApiInstance();
        return await this._api.get('rank/highest-mmr');
    }

    static async getBestGladPage() {
        const { position = 1 } = await Rank.getBestGlad() || {};
        const page = Math.ceil(position / this.LIMIT);
    
        return page || 1;
    }

    static getPageInterval({ page }) {
        const start = (this.LIMIT * (page - 1)) + 1;
        const end = this.LIMIT * page;
    
        return [start, end];
    }
}

export default Rank;
