var RNDBModel = require('react-native-db-models')

const CHATS = 'CHATS';
const CHATITEM = 'CHATITEM';

var DB = {
    'CHATS' : new RNDBModel.create_db(CHATS),
    'CHATITEM' : new RNDBModel.create_db(CHATITEM),
}

export default DB;