import Api from "../helpers/Api.js";

class Reports {
    static LIMIT = 10;
    static _api = null;

    // Página atual (começa em 1)
    static page = 1;
    // Total
    static totalPages = null;

    static cachedPrevPage = null;
    static cachedCurrentPage = null;
    static cachedNextPage = null;

    static getPageInterval({ page }) {
        const start = (this.LIMIT * (page - 1)) + 1;
        const end = this.LIMIT * page;
    
        return [start, end];
    }

    static getPagesQuantity({ total }) {
        return Math.ceil(total / Reports.LIMIT);
    }

    static _setApiInstance() {
        try {
            if (!this._api) this._api = new Api();
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    static async initPagination({ getPage = Reports.getAllReports }) {
        Reports.page = 1;

        // Calcula o total de páginas através da primeira página
        const firstPage = await getPage({ page: Reports.page }) || null;
        Reports.totalPages = Reports.getPagesQuantity({ total: firstPage.total });
        
        Reports.cachedCurrentPage = firstPage;
        Reports.cachedNextPage = await getPage({ page: Reports.page + 1 }) || null;

        return Reports.totalPages;
    }

    static async adjustAdjacentPages({ increment = +1, getPage = Reports.getAllReports }) {
        if (!Reports.cachedCurrentPage) throw new Error('cachedCurrentPage is not started!');

        if (Reports.page > 1 && !Reports.cachedPrevPage) {
            const prevPage = Reports.page - 1;
            Reports.cachedPrevPage = await getPage({ page: prevPage }) || null;
        }

        if (Reports.page < Reports.totalPages && !Reports.cachedNextPage) {
            const nextPage = Reports.page + 1;
            Reports.cachedNextPage = await getPage({ page: nextPage }) || null;
        }

        // 1 - 2 - 3 (NEXT ->)
        // 2 - 3 - 4
        if (increment > 0) {
            Reports.cachedPrevPage = Reports.cachedCurrentPage;
            Reports.cachedCurrentPage = Reports.cachedNextPage;

            const next = Reports.page + 1;
            Reports.cachedNextPage = next <= Reports.totalPages
                ? await getPage({ page: next }) || null
                : null;

            Reports.page++;
        }

        // 2 - 3 - 4 (<- PREV)
        // 1 - 2 - 3
        if (increment < 0) {
            Reports.cachedNextPage = Reports.cachedCurrentPage;
            Reports.cachedCurrentPage = Reports.cachedPrevPage;
            
            const prev = Reports.page - 1;
            Reports.cachedPrevPage = prev >= 1
                ? await getPage({ page: prev }) || null
                : null;

            Reports.page--;
        }
    }

    static isFirstPage() {
        return Reports.page === 1;
    }

    static isLastPage() {
        return Reports.page === Reports.totalPages;
    }

    static clearCache() {
        Reports.cachedPrevPage = null;
        Reports.cachedCurrentPage = null;
        Reports.cachedNextPage = null;
    }

    // GET

    static async getReports({ page, favorites_only = false, unready_only = false, read_only = false }) {
        this._setApiInstance();

        if (read_only && unready_only) throw new Error('cannot set both read_only and unready_only to true');

        const paramsObj = { limit: this.LIMIT, page };

        if (favorites_only) paramsObj.favorites = 1;
        if (unready_only) paramsObj.unread_only = 1;
        if (read_only) paramsObj.read_only = 1;

        return await this._api.get('report/get', paramsObj);
    }

    static async getAllReports({ page }) {
        return await Reports.getReports({ page });
    }

    static async getAllUnreadedReports({ page }) {
        return await Reports.getReports({ page, unready_only: true });
    }

    static async getAllFavoriteReports({ page }) {
        return await Reports.getReports({ page, favorites_only: true });
    }

    // PUT
    static async toggleReportFavorite(id, { comment = null } = {}) {
        this._setApiInstance();

        const body = { id };
        if (comment) body.comment = comment;

        const updateData = await this._api.put('report/favorite', body);
        return updateData;
    }
}

export default Reports;
