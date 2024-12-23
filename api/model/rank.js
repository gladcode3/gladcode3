import Db from '../core/mysql.js';
import CustomError from '../core/error.js';
import config from '../config.js'

export default class Rank {
  
    static async rankFetch(tab, srch){
        try {
            const search = srch.toLowerCase();
            const prize = [ 10, 6, 4, 3, 2];
            const ranking = []
            let sql, result;
            
            sql = `SELECT t.id, t.name, t.weight FROM training t WHERE t.description LIKE ?`;
            const training = await Db.query(sql, [`%#${tab}%`]);
    
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
    
            const sortedRank = Object.values(ranking).sort((a, b) => {
                if (a.score > b.score) return -1;
                if (b.score > a.score) return 1;
                if (a.time > b.time) return -1;
                if (b.time > a.time) return 1;
                return 0;
            });
    
            let i = 1;
            const filtered = ranking.map((item) => {
                item.position = i++;
                return item;
            }).filter(
                (item) => search === "" || item.nickname.toLowerCase().includes(search)
            );
            
            console.log(filtered)
            return {
                "ranking": filtered,
                "code": 200
            };
        } catch (error) {
            const code = error.code ?? 500;
            const msg = error.message ?? "Failed to retrieve Rank";
            throw new CustomError(code, msg, error.data);
        }
    };
}
