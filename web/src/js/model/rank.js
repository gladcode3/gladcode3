import Api from "../helpers/api.js";

class Rank {
    static _api = null;

    static _setApiInstance() {
        try {
            if (!this._api) this._api = new Api();
        } catch(err) {
            console.error(err);
            throw err;
        }
    }

    static async get({ limit = 10, page, search = '' }) {
        this._setApiInstance();
        return await this._api.get('rank/rank', { limit, page, search });
    }

    static async getBestGlad() {
        this._setApiInstance();
        return await this._api.get('rank/highest-mmr');
    }
}

export default Rank;
