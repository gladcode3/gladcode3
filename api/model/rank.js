import Db from '../core/mysql.js';
import CustomError from '../core/error.js';

export default class Rank {

    static async get(page, qnt, srch){
        if(qnt > 30 || qnt === undefined || isNaN(qnt)) qnt = 30;
        if(page === undefined || page < 0) page = 0;

        let offset = (page*qnt)-qnt;
        let search = "";
        let searchQuery;

        if(srch !== undefined || srch !== "") {
            searchQuery = ` WHERE g.name LIKE '%${srch}%' OR u.nickname LIKE '%${srch}%'`;
            search = srch;
        }

        const byGladiator = await Db.find('gladiators', {
            filter: { name: { like: `${search}` } },
            view: [ 'cod' ],
        });
        const total = byGladiator.length;

        const sumreward = `
        SELECT 
            sum(r.reward) 
        FROM 
            reports r 
        INNER JOIN 
            logs l ON l.id = r.log 
        WHERE 
            g.cod = r.gladiator AND 
            l.time > CURRENT_TIME() - INTERVAL 1 DAY`;

        const position = `
        SELECT 
            count(*) 
        FROM 
            gladiators g2
        WHERE 
            g2.mmr >= g.mmr
        `;

        const sql = `
        SELECT 
            g.name, g.mmr, u.nickname, (${sumreward}) AS sumreward, (${position}) AS position 
        FROM 
            gladiators g 
        INNER JOIN 
            users u ON g.master = u.id
        ${searchQuery}
        ORDER BY g.mmr DESC 
        LIMIT ${qnt} 
        OFFSET ${offset}
        `

        const result = await Db.query(sql, []);
        const ranking = [];

        result.forEach(row => {
            ranking.push({
                'glad': row.name,
                'mmr': row.mmr,
                'master': row.nickname,
                'change24': row.sumreward,
                'position': row.position
            });
        });

        return {
            "code": 200,
            "total": total,
            ranking
        }

    }

    static async fetch(tab, srch){
        
        let search = "";
        if(srch !== undefined) search = srch.toLowerCase();
        
        const prize = [ 10, 6, 4, 3, 2];
        const ranking = []
        let sql;

        const training = await Db.find('training', {
            filter: { description : { like: `#${tab}` } },
            view: [ 'id', 'name', 'weight' ]
        });

        for (const train of training) {
            const trainId = train.id;
            const weight = train.weight;

            const manualtime = `
                SELECT avg(IF(gt2.lasttime > 1000, gt2.lasttime - 1000, gt2.lasttime)) 
                FROM gladiator_training gt2 
                INNER JOIN gladiators g2 ON g2.cod = gt2.gladiator 
                WHERE gt2.training = gt.training 
                AND g2.master = g.master 
                AND gt2.lasttime > 0
            `;
        
            sql = `
                SELECT sum(gt.score) AS score, 
                        (${manualtime}) AS time, 
                        g.master, u.nickname 
                FROM gladiator_training gt 
                INNER JOIN gladiators g ON g.cod = gt.gladiator 
                INNER JOIN users u ON u.id = g.master 
                WHERE gt.training = ? 
                GROUP BY g.master 
                ORDER BY score DESC, time DESC
            `;
        
            const result = await Db.query(sql, [trainId]);
            console.log(result)
        
            let i = 0;
            for (const row of result) {
                if (row.time !== null) {
                    const id = row.master;
                    if (!ranking[id]) {
                        ranking[id] = {
                            "score": 0,
                            "time": 0,
                            "fights": 0,
                            "nickname": row.nickname
                        };
                    }
                    ranking[id].score += ((prize[i] ?? 0) * weight);
                    ranking[id].time += row.time > 1000 ? row.time - 1000 : row.time;
                    ranking[id].fights++;
                    ranking[id].nickname = row.nickname;
                    i++;
                };
            };
        };
        for (const id in ranking) {
            ranking[id].time /= ranking[id].fights;
            ranking[id].fights = null;
        };

        let i = 1;
        const filtered = ranking.map((item) => {
            item.position = i++;
            return item;
        }).filter(
            (item) => search === "" || item.nickname.toLowerCase().includes(search)
        );
        
        return {
            "ranking": filtered,
            "code": 200
        };
    };
}
