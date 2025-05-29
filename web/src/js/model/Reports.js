import Api from "../helpers/Api.js";

class Reports {
    static LIMIT = 10;
    static _api = null;

    static _setApiInstance() {
        try {
            if (!this._api) this._api = new Api();
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    static async getReports({ page, favorites_only = false, unready_only = false, read_only = false }) {
        this._setApiInstance();

        if (read_only && unready_only) throw new Error('cannot set both read_only and unready_only to true');

        const paramsObj = { limit: this.LIMIT, page };

        if (favorites_only) paramsObj.favorites = 1;
        if (unready_only) paramsObj.unready_only = 1;
        if (read_only) paramsObj.read_only = 1;

        return await this._api.get('report/get', paramsObj);
    }

    static async getAllReports({ page }) {
        return await this.getReports({ page });
    }

    static async getAllUnreadedReports({ page }) {
        return await this.getReports({ page, unready_only: true });
    }

    static async getAllFavoriteReports({ page }) {
        return await this.getReports({ page, favorites_only: true });
    }

    static getPageInterval({ page }) {
        const start = (this.LIMIT * (page - 1)) + 1;
        const end = this.LIMIT * page;
    
        return [start, end];
    }
}

export default Reports;
