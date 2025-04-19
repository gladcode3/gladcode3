import Db from "../core/mysql.js";
import CustomError from "../core/error.js";

export default class Rank {

    static async get({ offset, search }){

        let filter = {};

        if (search) {
            const searchCondition = Db.raw(`(g.name LIKE '%${search}%' OR u.nickname LIKE '%${search}%'`);
            filter = { _raw: searchCondition };
        }

        const countQuery = await Db.query(
            `SELECT COUNT(*) as total FROM gladiators g
            INNER JOIN users u ON g.master = u.id
            ${search ? `WHERE g.name LIKE ? OR u.nickname LIKE ?` : ''}`,
            search ? [`%${search}%`, `%${search}%`] : []
        );

        const total = countQuery[0].total;

        let limit = 10;
        if(offset === undefined) {
            offset = 0;
            limit = 30;
        }
        if(offset < 0){
            offset = 0;
        }

        const rawRankingData = `
            SELECT
            g.name,
            g.mmr,
            u.nickname,
            (
                SELECT SUM(r.reward)
                FROM reports r
                INNER JOIN logs l ON l.id = r.log
                WHERE g.cod = r.gladiator
                AND l.time > DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY)
            ) AS sumreward,
            (
                SELECT COUNT(*) 
                FROM gladiators g2 
                WHERE g2.mmr >= g.mmr
            ) AS position
            FROM gladiators g
            INNER JOIN users u ON g.master = u.id
            ${search ? `WHERE g.name LIKE ? OR u.nickname LIKE ?` : ''}
            ORDER BY g.mmr DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const params = search ? [ `%${search}%`, `%${search}%` ] : [];
        const rankingData = await Db.query(rawRankingData, params);

        const ranking = rankingData.map(row => ({
            glad: row.name,
            mmr: row.mmr,
            master: row.nickname,
            change24: row.sumreward || 0,
            position: row.position
        }));

        return { total, ranking };
    }

    static async toggleWatchTab(userId, name, watch) {
        
        const userData = await Db.find("users", {
            filter: { id: userId },
            view: ["premium", "credits"]
        });

        if(!userData.length) throw new CustomError(404, "User not found");

        const user = userData[0];

        //Possivelmente não implementado?
        if(user.premium = null) return { status: "NOPREMIUM" };
        if(user.credits < 0) return { status: "NOCREDITS" };

        const existingTabs = await Db.find("user_tabs", {
            filter: { name, owner: userId },
            view: ["id"]
        });

        let result = {};
        if (existingTabs.length > 0) {
            const tabId = existingTabs[0].id;
            await Db.update("user_tabs", { watch: watch ? 1 : 0 }, tabId);

        } else {
            const insertResult = await Db.insert("user_tabs", {
                name,
                owner: userId,
                watch: watch ? 1 : 0
            });

            result.id = insertResult[0].insertId;
        }
        return result;
    }

    static async getTabs(userId) {
        const tags = new Set();

        const ownTrainings = await Db.query(
            `SELECT DISTINCT t.description FROM training t WHERE t.manager = ?`,
            [userId]
        );

        ownTrainings.forEach(row => {
            const matches = row.description.match(/#(\w+)/g) || [];
            matches.forEach(match => {
                tags.add(match.substring(1).toLowerCase());
            });
        });

        const participatingTrainings = await Db.query(
            `SELECT DISTINCT t.description
            FROM gladiator_training gt
            INNER JOIN gladiators g ON gt.gladiator = g.cod
            INNER JOIN training t ON t.id = gt.training
            WHERE g.master = ?`,
            [userId]
        );
        participatingTrainings.forEach(row => {
            const matches = row.description.match(/#(\w+)/g) || [];
            matches.forEach(match => {
                tags.add(match.substring(1).toLowerCase());
            });
        });

        const userTabs = await Db.find("user_tabs", {
            filter: { owner: userId },
            view: [ "name", "watch" ]
        });

        const tagsArray = Array.from(tags);
        userTabs.forEach(tab => {
            if (tab.watch === 0 && tagsArray.includes(tab.name)) {
                const index = tagsArray.indexOf(tab.name);
                if(index > -1) {
                    tagsArray.splice(index, 1);
                }
            } else if (tab.watch === 1 && !tagsArray.includes(tab.name)) {
                tagsArray.push(tab.name);
            }
        });

        tagsArray.sort();

        return { tags: tagsArray};
    }

    static async fetchTabRanking(tab, search) {

        const trainings = await Db.query(
            `SELECT t.id, t.name, t.weight FROM training t WHERE t.description LIKE ?`,
            [`%${tab}%`]
        );

        const trainingData = trainings.map(row => ({
            id: row.id,
            weight: row.weight
        }));

        const prize = [10, 6, 4, 3, 2];
        let ranking = {};

        for(const train of trainingData) {
            const trainId = train.id;
            const weight = train.weight;

            const trainRanking = await Db.query(
                `SELECT 
                    SUM(gt.score) AS score,
                    AVG(IF(gt2.lasttime > 1000, gtw.lasttime - 1000, gt2.lasttime)) AS time,
                    g.master,
                    u.nickname
                FROM gladiator_training gt
                INNER JOIN gladiators g ON g.cod = gt.gladiator
                INNER JOIN users u ON u.id = g.master
                LEFT JOIN gladiator_training gt2 ON gt2.training = gt.training AND gt2.gladiator IN (
                    SELECT g2.cod FROM gladiators g2 WHERE g2.master = g.master
                ) AND gt2.lasttime > 0
                WHERE gt.training = ?
                GROUP BY g.master
                ORDER BY score DESC, time DESC`,
                [trainId]
            );

            for (let i = 0; i < trainRanking.length; i++) {
                const row = trainRanking[i];

                if(row.time != null) {
                    const id = row.master;

                if (!ranking[id]) {
                    ranking[id] = {
                        score: 0,
                        time: 0,
                        fights: 0
                    };
                }

            ranking[id].score += (prize[i] !== undefined ? prize[i] : 0 ) * weight;
            ranking[id].time += row.time > 1000 ? row.time - 1000 : row.time;
            ranking[id].fights++;
            ranking[id].nick = row.nickname;
                }
            }
        }
        const rankingArray = Object.entries(ranking).map(([id, data]) => {
            return {
                id: parseInt(id),
                score: data.score,
                time: data.time / data.fights,
                nick: data.nick
            };
        });

        rankingArray.sort((a, b) => {
            if (a.score !== b.score) {
                return b.score - a.score;
            }
            return b.time - a.time;
        });

        const filteredRanking = rankingArray.map((item, index) => {
            item.position = index + 1;
            return item
        }).filter(item => !search || item.nick.toLowerCase().includes(search.toLowerCase()));

        return { ranking: filteredRanking };
    }

    static async getMaxMineOffset(userId){
        const result = await Db.query(
            `SELECT COUNT(*) AS offset FROM gladiators WHERE mmr > (SELECT MAX(mmr) FROM gladiators WHERE master = ?)`, 
            [userId]
        );

        return { offset: result[0].offset }
    }
}