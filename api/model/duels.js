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

        //Pra filtrar os duelos não terminados (log null)
        const rawDuels = [...initiatedDuels, ...receivedDuels];

        if (rawDuels.length === 0) throw new CustomError(404, "No duels found.");

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
                user: d.opponentId,
                nick: opp?.nickname,
                lvl: opp?.lvl,
                profile_picture: opp?.profile_picture
            };
        });

        return { duels };
    }

    static async challenge(user, friend, glad) {
        if (!user.id || !friend || !glad) throw new CustomError(400, "Missing required parameters");

        const friendship = await Db.query(
            `SELECT 
                *
            FROM 
                friendship
            WHERE 
                (user1 = ? AND user2 = ?) OR
                (user1 = ? AND user2 = ?)`, [user.id, friend, friend, user.id]);
        if (friendship.length === 0) throw new CustomError(404, "Friendship not found.");

        const gladiator = await Db.find('gladiators', {
            filter: {
                cod: glad,
                master: user.id
            }
        });
        if (gladiator.length === 0) throw new CustomError(404, "Gladiator not found or not owned by user.");

        const existingDuel = Db.query(
            `SELECT
                *
            FROM 
                duels
            WHERE
                user2 = ? AND
                gladiator1 = ? AND
                log IS NULL`, [friend, glad]);
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

    static async report(user, page, limit) {
        if(!page) throw new CustomError(400, "Page was not sent.");
        if(!limit || limit > 30) limit = 10;
        if(isNaN(page) || isNaN(limit)) throw new CustomError(400, "Query must be a number.");

        const offset = (page*limit)-limit;

        const duels1 = await Db.find('duels', {
            filter: {
                user1: user.id
            },
            opt: {
                order: { time: -1 }
            }
        });

        const duels2 = await Db.find('duels', {
            filter: {
                user2: user.id
            },
            opt: {
                order: { time: -1 }
            }
        });

        const finishedDuels1 = duels1.filter(duel => duel.log !== null);
        const finishedDuels2 = duels2.filter(duel => duel.log !== null);
        const pendingDuels = duels1.filter(duel => duel.log === null);

        const allDuels = [...finishedDuels1, ...finishedDuels2, ...pendingDuels];

        const sortedDuels = allDuels.sort((a,b) => new Date(b.time) - new Date(a.time));

        const total = sortedDuels.length;
        const duelsByPage = sortedDuels.slice(offset, offset + limit);

        const duels = [];

        for (const duel of duelsByPage) {

            const glad1 = duel.gladiator1 ? await Db.find('gladiators', {
                filter: { cod: duel.gladiator1 },
                view: ['name']
            }) : [];

            const glad2 = duel.gladiator2 ? await Db.find('gladiators', {
                filter: { cod: duel.gladiator2 },
                view: ['name']
            }) : [];

            const user1 = await Db.find('users', {
                filter: { id: duel.user1 },
                view: ['nickname']
            });

            const user2 = await Db.find('users', {
                filter: { id: duel.user2 },
                view: ['nickname']
            });

            const isChallenger = duel.user1 == user.id;

            duels.push({
                id: duel.id,
                time: duel.time,
                log: duel.log,
                isread: duel.isread,
                glad: isChallenger ? (glad1[0]?.name || null ) : (glad2[0]?.name || null),
                user: isChallenger ? (user2[0].nickname || null) : (user1[0]?.nickname || null),
                enemy_glad: isChallenger ? (glad2[0]?.name || null) : (glad1[0]?.name || null)
            });
        }

        for (const duel of finishedDuels1) {
            await Db.update('duels', { isread: 1 }, duel.id);
        }

        return {
            'code': 200,
            'data': {
                'total': total,
                'duels': duels
            }
        };
    }
}