import Db from '../core/mysql.js';
import CustomError from '../core/error.js';

export default class Duels {
    constructor ({id, user1, user2, gladiator1, gladiator2, time, log, isread}) {
        this.id = id;
        this.user1 = user1;
        this.user2 = user2;
        this.gladiator1 = gladiator1;
        this.gladiator2 = gladiator2;
        this.time = time;
        this.log = log;
        this.isread = isread;
    }

    static async get(user) {
        user.id = 277;

        const initiated = await Db.find('duels', {
        filter: { user1: user.id },
        view: ['id', 'time', 'user2', 'log']
        });
        console.log(initiated)

        const received = await Db.find('duels', {
        filter: { user2: user.id },
        view: ['id', 'time', 'user1', 'log']
        });

        const initiatedDuels = initiated
            .filter(d => d.log !== null)
            .map(d => ({
                id: d.id,
                time: d.time,
                opponentId: d.user2 
            }));

        const receivedDuels = received
            .filter(d => d.log !== null)
            .map(d => ({
                id: d.id,
                time: d.time,
                opponentId: d.user1
            }));

        const rawDuels = [...initiatedDuels, ...receivedDuels];
        console.log("RAW DUELS: ", rawDuels)

        if (rawDuels.length === 0) throw new CustomError(404, "No finished duels found for the user.");

        const opponentIds = [...new Set(rawDuels.map(d => d.opponentId))];

        const opponents = await Db.find('users', {
        filter: { id: opponentIds },
        view: ['id', 'nickname', 'lvl', 'profile_picture']
        });
        const oppMap = new Map(opponents.map(u => [u.id, u]));

        const duels = rawDuels.map(d => {
            const opp = oppMap.get(d.opponentId);
            return {
                id: d.id,
                time: d.time,
                opponentId: d.opponentId,
                opponentNickname: opp?.nickname,
                opponentLvl: opp?.lvl,
                opponentProfile: opp?.profile_picture
            };
        });

        return { duels };
    }

    static async challenge(user, friend, glad) {
        if (!user.id || !friend || !glad) throw new CustomError(400, "Missing required parameters");

        const friendship = await Db.find('friendship', {
            filter: { 
                $or: [
                    { user1: user.id, user2: friend },
                    { user1: friend, user2: user.id },
                ]
            }
        });
        if (friendship.length === 0) throw new CustomError(404, "Friendship not found.");

        const gladiator = await Db.find('gladiators', {
            filter: {
                cod: glad,
                master: user.id
            }
        });
        if (gladiator.length === 0) throw new CustomError(404, "Gladiator not found or not owned by user.");

        const existingDuel = await Db.find('duels', {
            filter: {
                user2: friend,
                gladiator1: glad,
                log: null
            }
        });
        if (existingDuel.length > 0) throw new CustomError(409, "Unresolved duel exists.");

        await Db.insert('duels', {
            user1: user.id,
            gladiator1: glad,
            user2: friend,
            time: Db.raw('NOW()')
        });

        return { "code": 200, "message": "Duel successfully created." };
    }

    static async delete(user, id) {
        const duel = await Db.find('duels', {
            filter: { id },
            view: ['user1', 'user2']
        });

        if (duel.length === 0) throw new CustomError(404, "Duel not found.");
        if (duel[0].user1 !== user.id && duel[0].user2 !== user.id) throw new CustomError(403, "Duel does not belong to user.");

        await Db.delete('duels', id);
        return { "code": 200, "message": `Duel ${id} has been successfully deleted.` };

    }

    static async report(user, offset = 0) {
        const limit = 10;
        
        const countResult = await Db.query(`
            SELECT COUNT(*) AS total
            FROM duels
            WHERE ((user1 = ? OR user2 = ?) AND log IS NOT NULL)
                OR (user1 = ? AND log is NULL)
            `, [user.id, user.id, user.id]
        );
        const total = countResult[0].total;

        const sql = `
            SELECT d.id, d.time, d.log, d.isread,
                g1.name AS glad1, g2.name AS glad2,
                u1.nickname AS nick1, u2.nickname AS nick2,
                u1.id AS user1, u2.id AS user2
            FROM duels d
            LEFT JOIN gladiators g1 ON g1.cod = d.gladiator1
            LEFT JOIN gladiators g2 ON g2.cod = d.gladiator2
            INNER JOIN users u1 ON u1.id = d.user1
            INNER JOIN users u2 ON u2.id = d.user2
            WHERE ((d.user1 = ? OR d.user2 = ?) AND d.log IS NOT NULL)
                OR (d.user1 = ? AND d.log IS NULL)
            ORDER BY d.time DESC
            LIMIT ? OFFSET ?
        `;

        const results = await Db.query(sql, [
            user.id, user.id, user.id,
            limit, offset
        ]);

        const duels = results.map(row => {
            const isChallenger = row.user1 === user.id;
            return {
                id: row.id,
                time: row.time,
                log: row.log,
                isread: row.isread,
                glad: isChallenger ? row.glad1 : row.glad2,
                user: isChallenger ? row.nick2 : row.nick1,
                enemy: isChallenger ? row.glad2 : row.glad1
            };
        });

        await Db.query(`
            UPDATE duels SET isread = 1
            WHERE user1 = ? AND log IS NOT NULL
            `, [user.id]);

        return {
            'code': 200,
            'data': {
                'total': total,
                'duels': duels
            }
        };
    };
}  