import db from "../core/mysql.js";
import CustomError from "../core/error.js";
/*
cod INT
user1 INT
user2 INT
pending TINYINT(1) [0, 1] 

get
*/

export default class Friends {

    constructor({
        cod,
        user1,
        user2,
        pending
    }) {
        this.cod = cod,
        this.user1 = user1,
        this.user2 = user2,
        this.pending = pending
    }

    static async get(){
        let id = 550;
        const [user1] = await db.find('friendship', {
            filter: { user2: id, pending: 1 },
            view: [ 'cod', 'user1' ]
        });

        const pending = [];
        user1.forEach(async row => {
            let user = await db.find('users', {
                filter: { id: row.user1 },
                view: [ 'nickname', 'profile_picture', 'lvl' ]
            });

            pending.push({
                'id': row.cod,
                'nickname': user.nickname,
                'profile_picture': user.profile_picture,
                'lvl': user.lvl
            });
        });

        const [friends1] = await db.find('friendship', {
            filter: { user2: id, pending: 0 },
            view: [ 'cod', 'user1']
        });

        const [friends2] = await db.find('friendship', {
            filter: { user1: id, pending: 0 },
            view: [ 'cod', 'user2' ]
        });

        const confirmed = [];
        friends1.forEach(async row => {
            let user = await db.find('users', {
                filter: { id: row.user1 },
                view: [ 'id', 'nickname', 'lvl', 'TIMESTAMPDIFF( MINUTE, ativo, now() ) AS last_active', 'profile_picture' ]
            });
            console.log(friends1);

            confirmed.push({
                'id': row.cod,
                'user': user.id,
                'nickname': user.nickname,
                'lvl': user.lvl,
                'active': user.last_active,
                'picture': user.profile_picture
            });
        });

        friends2.forEach(async row => {
            let user = await db.find('users', {
                filter: { id: row.user2 },
                view: [ 'id', 'nickname', 'lvl', 'TIMESTAMPDIFF( MINUTE, ativo, now() ) AS last_active', 'profile_picture' ]
            });

            confirmed.push({
                'id': row.cod,
                'user': user.id,
                'nickname': user.nickname,
                'lvl': user.lvl,
                'active': user.last_active,
                'picture': user.profile_picture
            });
        })

        return { 'code': 200, pending, confirmed };
    }
}