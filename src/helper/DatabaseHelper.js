import React from 'react';
import SQLite from 'react-native-sqlite-storage';


var database_name = "kickbdname.db";
var database_version = "1.0";
var database_displayname = "db";
var database_size = 200000;

let conn = SQLite.openDatabase(database_name, database_version, database_displayname, database_size, openDBHandler, errorDBHandler);

class Database {
    getConnection() {
        return conn;
    }
}

const database = new Database();

export default database;