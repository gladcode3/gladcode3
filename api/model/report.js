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

    static async get(page, favorites, unread_only, user, read, limit) {
        let qnt = 10;
        if (limit && !isNaN(limit) && limit <= 30) qnt = limit;
        const offset = (page * qnt) - qnt;
    
        const conditions = ["g.master = ?"];
        const params = [String(user.id)];
    
        if (favorites) {
            conditions.push("r.favorite = 1");
        }
        if (unread_only) {
            conditions.push("r.isread = 0");
        }
    
        let sql = `SELECT COUNT(r.id) AS total 
                   FROM reports r 
                   INNER JOIN gladiators g ON g.cod = r.gladiator
                   WHERE ${conditions.join(" AND ")}`;
        const [{ total }] = await Db.query(sql, params);
    
        sql = `SELECT r.id, l.time, g.name AS gladiator, r.isread, l.hash, r.reward, 
                      r.favorite, r.comment, l.expired 
               FROM reports r 
               INNER JOIN gladiators g ON g.cod = r.gladiator
               INNER JOIN logs l ON l.id = r.log
               WHERE ${conditions.join(" AND ")}
               ORDER BY time DESC 
               LIMIT ? OFFSET ?`;
        const reportinfo = await Db.query(sql, [...params, String(qnt), String(offset)]);
    
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
        }));
    
        if (read && infos.length > 0) {
            const ids = infos.map(row => row.id);
            sql = `UPDATE reports SET isread = 1 WHERE id IN (${ids.join(", ")})`;
            await Db.query(sql, []);
        }
        return { total, reports: infos, profile_notification: user, code: 200 };
    }
    
    static async delete(id, user){
        if(!id || isNaN(id)) throw new CustomError(400, "Invalid ID value.");

        const query = await Db.find('reports', {
            filter: { id: id },
            view: ['gladiator']
        });
        if(query.length <= 0) throw new CustomError(404, `Report #${id} not found.`);
        
        
        const checkGladiator = await Db.find('gladiators', {
            filter: { cod: query[0].gladiator },
            view: [ 'master' ]
        });

        if(checkGladiator[0].master !== user.id) throw new CustomError(401, "Report does not belong to the user.");
        await Db.delete('users', id);
        return;
    }

    static async favorite(id, comment){
        const query = await Db.find('reports', {
            filter: { id: id },
            view: [ 'id', 'log', 'gladiator', 'isread', 'reward', 'favorite', 'started' ]
        });
        if(query.length <= 0) throw new CustomError(404, `Report #${id} does not exist.`);
        const report = query[0];
        
        const comm = comment ? comment : '';
        const fav = query[0].favorite === 1 ? 0 : 1;
        

        await Db.update('reports', { favorite: fav, comment: comm }, id);
        return { report:
            {
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
}