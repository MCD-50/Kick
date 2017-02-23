import SQLite from 'react-native-sqlite-storage';
SQLite.DEBUG(true);
SQLite.enablePromise(false);

const database_name = "Kick.db";
const database_version = "1.0";
const database_displayname = 'Kick';
const database_size = 200000;
let db;

const table_chat = 'chat';

const table_personal_chat = 'personalChat';
const table_group_chat = 'groupChat';
const table_bot_chat = 'botChat';

const table_chat_item = 'chatItem';

const table_chat_item_list = 'chatItemList';

const id = 'id',
const title = 'title';
const sub_title = 'subTitle';



const chat_id = 'chatId';
const chat_item_id = 'chatItemId';
// const info = 'info';
// const personal = 'personal';
// const group = 'group';
// const bot = 'bot';

const is_added_to_chat_list = 'isAddedToChatList';
const chat_type = 'chatType';
const room = 'room';
const image = 'image';
const new_message_count = 'newMessageCount';
const last_active = 'lastActive';
const last_message_time = 'lastMessageTime';

const email = 'email';
const number = 'number';

const description = 'description';
const syntax = 'syntax';
const syntax_description = 'syntaxDescription';

const is_mute = 'isMute';
const people = 'people';
const people_count = 'peopleCount';

const user_name = 'userName';
const user_id = 'userId';
const text = 'text';
const created_on = 'createdOn';
const is_alert = 'isAlert';

const action_name = 'actionName';
const action_on_button_click = 'actionOnButtonClick';
const action_on_list_item_click = 'actionOnListItemClick'

const button_text = 'buttonText';
const is_interactive_chat = 'isInteractiveChat';
const is_interactive_list = 'isInteractiveList';
const list_item_key = 'listItemKey';
const list_item_value = 'listItemValue';


errorCB = (err) => {
    console.log("Error ", err);
    return false;
}

openCB = () => {
    console.log("Database open...");
}

closeCB = () => {
    console.log("Database close...");
}

deleteCB = () => {
    console.log("database delete callback");
}

successCB = () => {
    console.log("SQL executed...");
}




deleteDatabase = (callback) => {
    SQLite.deleteDatabase(database_name, this.deleteCB, this.errorCB);
}

closeDatabase = (callback) => {
    db.close(this.closeCB, this.errorCB);
}

openDatabase = (callback) => {
    db = SQLite.openDatabase(database_name, database_version, database_displayname, database_size,
        this.openCB, this.errorCB);
    this.createDatabase(db);
}

createDatabase = (db) => {
    let chatTable = "CREATE TABLE IF NOT EXISTS " + table_chat + "("
        + id + " INTEGER PRIMARY KEY AUTOINCREMENT," + title + " TEXT," + sub_title + " TEXT,"
        + is_added_to_chat_list + " BOOLEAN," + chat_type + " TEXT," + room + " TEXT,"
        + image + " BLOB," + new_message_count + " INTEGER," + last_active + " TEXT,"
        + last_message_time + " TEXT," 
        + email + " TEXT," + number + " TEXT," 
        + description + " TEXT," + syntax + " TEXT," + syntax_description + " TEXT,"
        ")";


    let personalTable = "CREATE TABLE IF NOT EXISTS " + table_personal_chat + "("
        + id + " INTEGER PRIMARY KEY AUTOINCREMENT," + chat_id + " INTEGER,"
        + email + " TEXT," + number + " TEXT,"
        + "FOREIGN KEY ( chatId ) REFERENCES chat ( id )" + ")";

    let botTable = "CREATE TABLE IF NOT EXISTS " + table_bot_chat + "("
        + id + " INTEGER PRIMARY KEY AUTOINCREMENT," + chat_id + " INTEGER,"
        + description + " TEXT," + syntax + " TEXT," + syntax_description + " TEXT,"
        + "FOREIGN KEY ( chatId ) REFERENCES chat ( id )" + ")";

    let groupTable = "CREATE TABLE IF NOT EXISTS " + table_group_chat + "("
        + id + " INTEGER PRIMARY KEY AUTOINCREMENT," + chat_id + " INTEGER,"
        + is_mute + " BOOLEAN," + name + " TEXT," + email + " TEXT,"
        + "FOREIGN KEY ( chatId ) REFERENCES chat ( id )" + ")";


    let chatItemTable = "CREATE TABLE IF NOT EXISTS " + table_chat_item + "("
        + id + " INTEGER PRIMARY KEY AUTOINCREMENT," + chat_id + " INTEGER,"
        + chat_type + " TEXT," + user_name + " TEXT," + user_id + " TEXT,"
        + text + " TEXT," + created_on + " TEXT," + is_alert + " BOOLEAN,"
        + action_name + " TEXT," + action_on_button_click + " TEXT," + action_on_list_item_click + " TEXT,"
        + button_text + " TEXT," + is_interactive_chat + " BOOLEAN," + is_interactive_list + " BOOLEAN,"
        + last_message_time + " TEXT" + ")";

    let chatItemListTable = "CREATE TABLE IF NOT EXISTS " + table_chat_item_list + "("
        + id + " INTEGER PRIMARY KEY AUTOINCREMENT," + chat_item_id + " INTEGER,"
        + list_item_key + " TEXT," + list_item_value + " TEXT,"
        + "FOREIGN KEY ( chatItemId ) REFERENCES chatItem ( id )" + ")";
}



insertIntoChat = (chat) => {
    let insertChatStatement = "INSERT INTO " + table_chat
        + " ("
        + title + ', ' + sub_title + ', ' + is_added_to_chat_list + ', ' + chat_type + ', ' + room + ', ' + image + ', ' +
        new_message_count + ', ' + last_active + ', ' + last_message_time
        + ") "
        + "VALUES" + " ("
        + chat.title + ', ' + chat.subTitle + ', ' + chat.info.isAddedToChatList + ', ' + chat.info.chatType + ', ' +
        chat.info.room + ', ' + chat.info.image + ', ' + chat.info.newMessageCount + ', ' + chat.info.lastActive + ', ' + chat.info.lastMessageTime
        + ")";

    db.executeSql(query, [], this.successCB, this.errorCB);
}

prepareInsertInto = (tableName, fields, values) => {
    let insertStatement = "INSERT INTO " + tableName + " (" + this.convertStringFromArray(fields) + ") "
        + "VALUES" + " (" + this.convertStringFromArray(values) + ")";
}


excuteSql = (query, callback) => {
    db.executeSql(query, [], this.successCB, this.errorCB);
}

convertStringFromArray = (items) => {
    let stringData = '';
    items.map((item) => {
        stringData += item + ',' + ' ';
    })
    stringData = stringData.trim().substring(0, [stringData.length - 1]);
    return stringData;
}

