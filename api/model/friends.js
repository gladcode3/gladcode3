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

    static async getAll(userId) {

        const pendingQuery = `
            SELECT a.cod as id, u.apelido as nick, u.foto as picture, u.lvl 
            FROM amizade a 
            INNER JOIN usuarios u ON u.id = a.usuario1 
            WHERE a.usuario2 = ? AND pendente = 1
        `;
        
        const pending = await Db.query(pendingQuery, [userId]);

        const fields = "a.cod as id, u.id as user, u.apelido as nick, u.lvl, u.foto as picture, TIMESTAMPDIFF(MINUTE, ativo, NOW()) as active";
        const confirmedQuery = `
            SELECT ${fields} 
            FROM amizade a 
            INNER JOIN usuarios u ON u.id = a.usuario1 
            WHERE a.usuario2 = ? AND pendente = 0 
            UNION 
            SELECT ${fields} 
            FROM amizade a 
            INNER JOIN usuarios u ON u.id = a.usuario2 
            WHERE a.usuario1 = ? AND pendente = 0
        `;
        
        const confirmed = await Db.query(confirmedQuery, [userId, userId]);
        
        return {
            code: 200,
            pending,
            confirmed
        };
    }

    static async handleRequest(requestId, userId, answer) {
        if (answer === 'YES') {
            const result = await Db.update('amizade', { pendente: 0 }, { cod: requestId });
            
            if (result.affectedRows === 0) {
                throw new CustomError(404, "Friend request not found or you don't have permission");
            }
        } else {
            const result = await Db.delete('amizade', { cod: requestId });
            
            if (result.affectedRows === 0) {
                throw new CustomError(404, "Friend request not found or you don't have permission");
            }
        }
        return { ok: true };
    }

    static async searchUsers(searchText, userId) {
        if (!searchText) {
            throw new CustomError(400, "Search text is required");
        }
        
        const users = await Db.find('usuarios', {
            filter: {
                apelido: Db.like(searchText),
                id: { '!=': userId }
            },
            view: ['apelido as nick', 'id as user', 'email'],
            opt: { limit: 10 }
        });
        
        return users;
    }

    static async delete(friendshipId, userId) {
        const friendship = await Db.find('amizade', {
            filter: {
                cod: friendshipId,
                usuario1: [userId, Db.raw('usuario2')],
                usuario2: [userId, Db.raw('usuario1')]
            },
            view: ['cod']
        });
        
        if (friendship.length === 0) {
            throw new CustomError(404, "Friendship not found or you don't have permission");
        }
        
        await Db.delete('amizade', { cod: friendshipId });
        
        return { ok: true };
    }

    static async add(userId, friendId) {
        if (userId === friendId) {
            throw new CustomError(400, "You cannot add yourself as a friend");
        }
        
        const existing = await Db.find('amizade', {
            filter: {
                usuario1: [userId, friendId],
                usuario2: [userId, friendId]
            },
            view: ['cod']
        });
        
        if (existing.length > 0) {
            return { code: 200, message: "EXISTS" };
        }
        
        await Db.insert('amizade', {
            usuario1: userId,
            usuario2: friendId,
            pendente: 1
        });
        
        return { code: 200, message: "OK" };
    }

    static async filter(userId, searchText) {
        if (!searchText) {
            throw new CustomError(400, "Filter text is required");
        }
        
        const fields = "a.cod as id, u.id as user, u.apelido as nick, u.lvl, u.foto as picture";
        
        const query = `
            SELECT ${fields} 
            FROM amizade a 
            INNER JOIN usuarios u ON u.id = a.usuario1 
            WHERE a.usuario2 = ? AND pendente = 0 AND apelido LIKE ? 
            UNION 
            SELECT ${fields} 
            FROM amizade a 
            INNER JOIN usuarios u ON u.id = a.usuario2 
            WHERE a.usuario1 = ? AND pendente = 0 AND apelido LIKE ?
        `;
        
        const friends = await Db.query(query, [userId, `%${searchText}%`, userId, `%${searchText}%`]);
        
        return friends;
    }
}