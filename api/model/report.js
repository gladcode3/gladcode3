import Db from '../core/mysql.js';
import CustomError from '../core/error.js';

/*
id
log int
gladiator fkid
isread 0 1
reward float(5)
favorite 0 1
comment ''
started 0 1
*/

export default class Report {
    constructor({
        id, 
        log, 
        gladiator, 
        isread, 
        reward, 
        favorite, 
        comment, 
        started
    }) {
        this.id = id;
        this.log = log;
        this.gladiator = gladiator;
        this.isread = isread ? 1 : 0;
        this.reward = reward;
        this.favorite = favorite ? 1 : 0;
        this.comment = comment;
        this.started = started ? 1 : 0;
    }

    static async get(page, favorites, is_read, user, limit, type) {

        let qnt = 10;
        if (limit && !isNaN(limit) && limit <= 30) qnt = limit;
        if (!page || page < 1) page = 1;
        const offset = (page * qnt) - qnt;
    
        let whereClause = `WHERE g.master = ?`;
        const params = [user.id];
    
        if (favorites === "true") { whereClause += ` AND r.favorite = 1`; }
        else if (favorites === "false") { whereClause += ` AND r.favorite = 0` }

        if (is_read === "true") { whereClause += ` AND r.isread = 0`; }
        else if (is_read === "false") { whereClause += ` AND r.isread =1`; }

        if (type === 'duel') { whereClause += ` AND l.origin = 'duel'`; }
        else if (type === 'ranked') { whereClause += ` AND l.origin = 'ranked'`; }

        const countSql = `
            SELECT COUNT(*) as total 
            FROM reports r 
            INNER JOIN gladiators g ON g.cod = r.gladiator
            INNER JOIN logs l on l.id = r.log
            ${whereClause}
        `;
        const totalResult = await Db.query(countSql, params);
        const total = totalResult[0].total;

        const reportSql = `
            SELECT r.id, l.time, g.name AS gladiator, r.isread, l.hash, r.reward, 
                   r.favorite, r.comment, l.expired, l.origin
            FROM reports r 
            INNER JOIN gladiators g ON g.cod = r.gladiator
            INNER JOIN logs l ON l.id = r.log
            ${whereClause}
            ORDER BY l.time DESC 
            LIMIT ${qnt} OFFSET ${offset}
        `;
        const reportinfo = await Db.query(reportSql, params);
    
        const infos = reportinfo.map(row => ({
            id: row.id,
            time: row.time,
            gladiator: row.gladiator,
            isread: row.isread,
            reward: row.reward,
            favorite: row.favorite,
            comment: row.comment,
            expired: row.expired === 1 ? true : undefined,
            hash: row.expired !== 1 ? row.hash : undefined,
            type: row.origin
        }));
    
        if (infos.length > 0) {
            const ids = infos.map(row => row.id).join(", ");
            const updateSql = `UPDATE reports SET isread = 1 WHERE id IN (${ids})`;
            await Db.query(updateSql, []);
        }

        return { 
            total, 
            reports: infos, 
            profile_notification: user, 
            code: 200 
        };
    }
    
    static async delete(id, user) {
        if (!id || isNaN(id)) throw new CustomError(400, "Invalid ID value.");

        const query = await Db.find('reports', {
            filter: { id: id },
            view: ['gladiator']
        });
        if (query.length <= 0) throw new CustomError(404, `Report #${id} not found.`);
        
        const checkGladiator = await Db.find('gladiators', {
            filter: { cod: query[0].gladiator },
            view: ['master']
        });
        if (checkGladiator[0].master !== user.id) {
            throw new CustomError(403, "Report does not belong to the user.");
        }
        
        await Db.delete('reports', id);
        return { "code": 200, "message": `User ${id} has been deleted.` };
    }

    static async favorite(id, comment, user) {
        const query = await Db.find('reports', {
            filter: { id: id },
            view: ['id', 'log', 'gladiator', 'isread', 'reward', 'favorite', 'started']
        });

        const checkOwnership = await Db.find('gladiators', {
            filter: { cod: query[0].gladiator },
            view: [ 'master' ]
        });
        console.log(checkOwnership)

        if(user.id !== checkOwnership[0].master) throw new CustomError(403, `Report ${id} does not belong to user.`);
        if (query.length <= 0) throw new CustomError(404, `Report #${id} does not exist.`);
        const report = query[0];
        
        const comm = comment !== undefined ? comment : '';
        const fav = report.favorite === 1 ? 0 : 1;
        
        await Db.update('reports', { favorite: fav, comment: comm }, id);
        
        return { 
            report: {
                id,
                log: report.log,
                glad: report.gladiator,
                isread: report.isread,
                reward: report.reward,
                favorite: fav,
                comment: comm,
                started: report.started
            }
        };
    }

    static async readAll(user) {
        const userId = user.id;
        const reports = await Db.query(
            `SELECT r.id FROM reports r
             INNER JOIN gladiators g ON g.cod = r.gladiator
             WHERE g.master = ? AND r.isread = 0`,
            [userId]
        );

        if (reports.length === 0) { return { code: 200, message: "All reports are read." }; }

        const ids = reports.map(r => r.id).join(", ");
        await Db.query(`UPDATE reports SET isread = 1 WHERE id IN (${ids})`);

        return { code: 200, message: `${reports.length} reports marked as read.` };
    }
}