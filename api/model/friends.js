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
        //todo
    }
}