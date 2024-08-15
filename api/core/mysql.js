import mysql from 'mysql2/promise';
import config from '../config.js';
import CustomError from './error.js';

export default class Mysql {
        
    static connected = false;
    static connection = null;

    // this is the connection pool
    static async connect() {
        if (Mysql.connected) return this;
        Mysql.connection = mysql.createPool(config.mysql);
        Mysql.connected = true;
    }

    // this is a wrapper for mysql2's query function
    // should not be used directly
    static async query(sql, data) {
        // console.log(sql, data);
        await Mysql.connect();

        const raw = Mysql.formatRaw(sql, data);
        // console.log(raw);
        // console.log(Mysql.format(sql, data));
        try {
            const [data] = await Mysql.connection.execute(raw.sql, raw.data);
            return data;
        }
        catch (error) {
            throw new CustomError(500, error.message, error);
        }
    }

    // db.insert('users', { name: 'John', age: 25 });
    // db.insert('users', [{ name: 'John', age: 25 }, { name: 'Jane', age: 22 }]);
    static async insert(table, data) {
        if (!Array.isArray(data)) data = [ data ];

        return Promise.all(data.map(row => {
            const values = Object.values(row);
            const fields = Object.keys(row).map(k => `\`${k}\``);
            let sql = `INSERT INTO ${table} (${fields.join(',')}) VALUES (${values.map(() => '?').join(',')})`;
            return Mysql.query(sql, values);
        }));
    }

    // db.update('users', { name: 'John', age: 11 }, id);
    static async update(table, data, id) {
        if (!Object.keys(data).length) {
            throw new CustomError(400, 'No data to update.');
        }

        const values = Object.values(data);
        const fielsdSql = Object.entries(data).map(([k,v],i) => {
            if (typeof v === 'object') {
                if (Object.keys(v)[0] === 'inc'){
                    values[i] = v.inc;
                    return `${k} = ${k} + ?`;
                }
                else if (Object.keys(v)[0] === 'dec'){
                    values[i] = v.dec;
                    return `${k} = ${k} - ?`;
                }
            }

            return `${k} = ?`;
        }).join(', ');

        if (typeof id === 'object') {
            values.push(Object.values(id)[0]);
            id = Object.keys(id)[0];
        }
        else {
            values.push(id);
            id = 'id';
        }

        const sql = `UPDATE ${table} SET ${fielsdSql} WHERE ${id} = ?`;
        // console.log(Mysql.format(sql, data));
        // replicateDB.saveUpdate(table, sql, data, this);
        return Mysql.query(sql, values);
    }

    static async delete(table, id) {
        let value;
        if (typeof id === 'object') {
            value = Object.values(id)[0];
            id = Object.keys(id)[0];
        }
        else {
            value = id;
            id = 'id';
        }

        const sql = `DELETE FROM ${table} WHERE ${id} = ?`;
        return Mysql.query(sql, [ value ]);
    }

    // db.find('users', { filter: { name: 'John' }, view: ['name', 'age'], opt: { limit: 1, sort: { age: -1 }, skip: 1 } });
    static async find(table, { filter={}, view=[], opt={}}) {
        view = Array.isArray(view) ? view : [ view ];
        view = view.length > 0 ? view.join(',') : '*';

        const filterNames = Object.keys(filter);
        const values = Object.values(filter);
        // WHERE name = ? AND age >= ?
        const whereStatements = Object.entries(filter).map(([k,v],i) => {
            if (Array.isArray(v)) {
                // age: [18, 19, 20]
                values.splice(i, 1, ...v);
                return `${k} IN (${v.map(() => '?').join(',')})`;
            }
            else if (typeof v === 'object'){
                // age: { in: [18, 19, 20] }
                if (Object.keys(v)[0] === 'in'){
                    if (!Array.isArray(v.in) || v.in.length === 0) return '1=0';
                    
                    // add all values to the values array
                    values.splice(i, 1, ...v.in);
                    return `${k} IN (${v.in.map(() => '?').join(',')})`;
                }

                // age: { between: [18, 20] }
                if (Object.keys(v)[0] === 'between'){
                    // add 2 values to the values array
                    values.splice(i, 1, v.between[0], v.between[1]);
                    return `${k} BETWEEN ? AND ?`;
                }

                // name: { like: 'John' }
                if (Object.keys(v)[0] === 'like'){
                    values[i] = `%${v.like}%`;
                    return `${k} LIKE ?`;
                }
                
                // age: { '>=': 18 }
                const e = Object.keys(v)[0];
                values[i] = Object.values(v)[0];
                return `${k} ${e} ?`;
            }
            // name: 'John'
            return `${k} = ?`;
        }).join(' AND ');
        const where = filterNames.length > 0 ? `WHERE ${ whereStatements }` : '';

        // ORDER BY id DESC
        const order = opt.order ? `ORDER BY ${ Object.keys(opt.order)[0] } ${ Object.values(opt.order)[0] === 1 ? 'ASC' : 'DESC' }` : '';
        
        // LIMIT 10
        const limit = opt.limit ? `LIMIT ${ opt.limit }` : '';
        
        // OFFSET 10
        const offset = opt.skip ? `OFFSET ${ opt.skip }` : '';

        const sql = `SELECT ${view} FROM ${table} ${where} ${order} ${limit} ${offset}`;
        // console.log(sql, values);
        return Mysql.query(sql, values);
    }

    // db.delete('users', id);
    static raw(str) {
        return { toSqlString: () => str };
    }

    static formatRaw(sql, data) {
        const pieces = sql.split('?');

        if (pieces.length > 1){
            let join = pieces.shift();
            
            try {
                data.forEach(d => {
                    if (d && d.toSqlString){
                        join += d.toSqlString();
                    }
                    else{
                        join += '?';
                    }
                    join += pieces.shift();
                });
            }
            catch(error) {
                console.log(data)
            }
    
            sql = join;
            data = data.filter(e => !e || !e.toSqlString);
        }
        
        return { sql, data };
    }

    static format(sql, data) {
        return Mysql.connection.format(sql, data);
    }

    static toDateTime(timestamp) {
        return new Date(timestamp).toISOString().replace('T', ' ').replace('Z', '');
    }

    static like(str) {
        return { like: str };
    }

    static between(a, b) {
        return { between: [ a, b ] };
    }

    static lt(value) {
        return { '<': value };
    }

    static gt(value) {
        return { '>': value };
    }

    static lte(value) {
        return { '<=': value };
    }

    static gte(value) {
        return { '>=': value };
    }

}
