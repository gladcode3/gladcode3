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

    static async get(page, favorites, unread_only, user, read){

        const fav = favorites ? "AND favorite = 1" : '';
        const unread = unread_only ? "AND isread = 0" : '';
        const offset = (page*qnt)-qnt;
        let sql;

        sql = `SELECT id FROM reports r INNER JOIN gladiators g ON g.cod = r.gladiator WHERE gladiator IN (SELECT cod FROM gladiators WHERE master = '${user}') ${fav} ${unread}`;
        const reportid = await Db.query(sql, []);
        const total = reportid.length;
        
        sql = `SELECT r.id, time, name, isread, hash, reward, favorite, comment, expired FROM reports r INNER JOIN gladiators g ON g.cod = r.gladiator INNER JOIN logs l ON l.id = r.log WHERE gladiator IN (SELECT cod FROM gladiators WHERE master = '${user}') ${fav} ${unread} ORDER BY time DESC LIMIT ${limit} OFFSET ${offset}`;
        const reportinfo = await Db.query (sql, []);
        const infos = [];
        const ids = [];

        reportinfo.forEach(row => {
            const info = {};
            info.id = row.id;
            info.time = row.time;
            info.gladiator = row.name;
            info.isread = row.isread;
            info.reward = row.reward;
            info.favorite = row.favorite;
            info.comment = row.comment;

            if(row.expired == 1){
                info.expired = true;

            } else{
                info.hash = row.hash;
            }

            infos.push(info);
            ids.push(row.id);
        });

        if(read){
            //todo
        }
        
    }
}