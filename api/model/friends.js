import Db from '../core/mysql.js';
import CustomError from '../core/error.js';

export default class Friends {
    constructor({ id, nick, picture, lvl, active, user }) {
        this.id = id;
        this.nick = nick;
        this.picture = picture;
        this.lvl = lvl;
        this.active = active;
        this.user = user;
    }

    static async getAll(user) {
        const userId = user.id;
        if (!userId) throw new CustomError(400, "User ID is required");

        const pendingQuery = `
            SELECT fp.cod as id, u.nickname as nick, u.profile_picture as picture, u.lvl 
            FROM friendship fp
            INNER JOIN users u ON u.id = fp.user1 
            WHERE fp.user2 = ? AND pending = 1
        `;
        const pending = await Db.query(pendingQuery, [userId]);

        const fields = "fp.cod as id, u.id as user, u.nickname as nick, u.lvl, u.profile_picture as picture, TIMESTAMPDIFF(MINUTE, active, NOW()) as active";
        const confirmedQuery = `
            SELECT ${fields} 
            FROM friendship fp 
            INNER JOIN users u ON u.id = fp.user1 
            WHERE fp.user2 = ? AND pending = 0 
            UNION 
            SELECT ${fields} 
            FROM friendship fp
            INNER JOIN users u ON u.id = fp.user2 
            WHERE fp.user1 = ? AND pending = 0
        `;
        const confirmed = await Db.query(confirmedQuery, [userId, userId]);
        
        return {
            code: 200,
            pending,
            confirmed
        };
    }

    static async handleRequest(requestId, user, answer) {
        const userId = user.id;
        if (!requestId || isNaN(requestId)) throw new CustomError(400, "Invalid request ID");
        
        const request = await Db.find('friendship', {
            filter: { cod: requestId, user2: userId, pending: 1 },
            view: ['cod']
        });
        
        if (request.length === 0) {
            throw new CustomError(404, "Friend request not found.");
        }

        if (answer === 'YES') {
            await Db.update('friendship', { pending: 0 }, { cod: requestId });
        } else {
            await Db.delete('friendship', { cod: requestId });
        }
        return { code: 200, message: answer === 'YES' ? "Request accepted" : "Request rejected" };
    }

    static async delete(friendshipId, userId) {
        if (!friendshipId || isNaN(friendshipId)) throw new CustomError(400, "Invalid friendship ID");
        if (!userId) throw new CustomError(400, "User ID is required");
        
        const friendship = await Db.find('friendship', {
            filter: { cod: friendshipId },
            view: ['user1', 'user2']
        });
        
        if (friendship.length === 0) {
            throw new CustomError(404, "Friendship not found");
        }
        
        const friend = friendship[0];
        if (friend.user1 !== userId && friend.user2 !== userId) {
            throw new CustomError(403, "You don't have permission to delete this friendship");
        }
        
        await Db.delete('friendship', { cod: friendshipId });
        
        return { code: 200, message: "Friendship deleted successfully" };
    }

    static async add(userId, friendId) {
        if (!userId) throw new CustomError(400, "User ID is required");
        if (!friendId) throw new CustomError(400, "Friend ID is required");
        if (userId === friendId) throw new CustomError(400, "User cannot add himself");
        
        const existingQuery = `
            SELECT cod FROM friendship 
            WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)
        `;
        const existing = await Db.query(existingQuery, [userId, friendId, friendId, userId]);
        
        if (existing.length > 0) {
            return { code: 200, message: "Friendship already exists" };
        }
        
        const friendExists = await Db.find('users', {
            filter: { id: friendId },
            view: ['id']
        });
        
        if (friendExists.length === 0) {
            throw new CustomError(404, "User not found");
        }
        
        await Db.insert('friendship', {
            user1: userId,
            user2: friendId,
            pending: 1
        });
        
        return { code: 200, message: "Friend request sent successfully" };
    }

    static async search(userId, searchText) {
        if (!userId) throw new CustomError(400, "User ID is required");
        if (!searchText) throw new CustomError(400, "Filter text is required");
        userId = 277
        
        const fields = "fp.cod as id, u.id as user, u.nickname as nick, u.lvl, u.profile_picture as picture";
        
        const query = `
            SELECT ${fields} 
            FROM friendship fp 
            INNER JOIN users u ON u.id = fp.user1 
            WHERE fp.user2 = ? AND pending = 0 AND u.nickname LIKE ? 
            UNION 
            SELECT ${fields} 
            FROM friendship fp 
            INNER JOIN users u ON u.id = fp.user2 
            WHERE fp.user1 = ? AND pending = 0 AND u.nickname LIKE ?
        `;
        
        const friends = await Db.query(query, [userId, `%${searchText}%`, userId, `%${searchText}%`]);
        
        return { code: 200, friends };
    }
}