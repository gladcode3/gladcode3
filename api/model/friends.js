import Db from "../core/mysql.js";
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
        const [user1] = await Db.find('friendship', {
            filter: { user2: id, pending: 1 },
            view: [ 'cod', 'user1' ]
        });

        const pending = [];
        user1.forEach(async row => {
            let user = await Db.find('users', {
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

        const [friends1] = await Db.find('friendship', {
            filter: { user2: id, pending: 0 },
            view: [ 'cod', 'user1']
        });

        const [friends2] = await Db.find('friendship', {
            filter: { user1: id, pending: 0 },
            view: [ 'cod', 'user2' ]
        });

        const confirmed = [];
        friends1.forEach(async row => {
            let user = await Db.find('users', {
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
            let user = await Db.find('users', {
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

    static async request(id, answer){
        const cod = { 'cod': id }
        if(answer == "YES"){
            await Db.update('friendship', { pending: '0' }, cod);
            return { 'msg': "Friendship accepted." }
        }
        else{
            await Db.delete('friendship', cod);
            return { 'msg': "Friendship denied" };
        }
    };

    static async filter(search, id){
        const friends = [];
        const friends1 = await Db.find('friendship', {
            filter: { user2: id, pending: 0 },
            view: [ 'user1 AS id' ]
        });

        const friends2 = await Db.find('friendship', {
            filter: { user1: id, pending: 0 },
            view: [ 'user2 AS id' ]
        });
        friends.push(...friends1, ...friends2);

        const results = [];
        friends.forEach(async usr => {
            let id = usr.id;
            let query = await Db.find('users', {
                filter: { id: id, nickname: { like: `%${search}%` } },
                view: ['id', 'nickname', 'lvl', 'profile_picture']
            });

            results.push(...query);
        });
        return { total: results.length, results };
    }
}