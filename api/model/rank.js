import Db from '../core/mysql.js';
import CustomError from '../core/error.js';
import config from '../config.js'

export default class Rank {

    static async helloWorld(){
        
        const sql = ("SELECT * FROM users WHERE id = ?");
        const data = ["3930483"];
        const query = await Db.query(sql, data);
        if(query.length < 1){
            return { "code": 404, "message": "Not Found." };
        }
        
        return { "result": query, "code": 200 };
    }

    static async getRank(page, search, qnt){
        if(!page) throw { "code": 400, "message": "Page was not sent." };
        if(isNaN(page) || isNaN(qnt)) throw { "code": 400, "message": "Page and limit must be a number"};

        let sql ;
        let newSearch = search || ""
        let limit = parseInt(qnt) || 10

        if(newSearch != ""){
            newSearch = ` WHERE g.name LIKE '%${newSearch}%' OR u.nickname LIKE '%${newSearch}%' `;
        }
        
    try {
        const offset = (page*limit)-limit;

        sql = ` SELECT cod FROM gladiators g INNER JOIN users u on g.master = u.id ${newSearch}`;
        const total = await Db.query(sql, []);
        const num_rows = total.length ;

        const sumreward = `SELECT sum(r.reward) FROM reports r INNER JOIN logs l ON l.id = r.log WHERE g.cod = r.gladiator AND l.time > CURRENT_TIME() - INTERVAL 1 DAY`;
        const position = `SELECT count(*) FROM gladiators g2 WHERE g2.mmr >= g.mmr`;

        sql = ` SELECT g.name, g.mmr, u.nickname, (${sumreward}) AS sumreward, (${position}) AS position FROM gladiators g INNER JOIN users u ON g.master = u.id ${newSearch} ORDER BY g.mmr DESC limit ${limit} OFFSET ${offset}`
        const result = await Db.query(sql, []);
        return { "showing": offset+limit, "numRows": num_rows, "result": result };

    } catch (error) {
        const code = error.code ?? 500;
        const msg = error.message ?? "Failed to retrieve Rank";
        throw new CustomError(code, msg, error.data);
    };
    };
}