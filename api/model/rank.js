import Db from '../core/mysql.js';
import CustomError from '../core/error.js';
import mysql from 'mysql2/promise';
import config from '../config.js'
const conn = await mysql.createConnection(config.mysql);

export default class Rank {

}