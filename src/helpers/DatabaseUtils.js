var RNDBModel = require('react-native-db-models')

import {BOTS, CHATITEMS, CHATS} from '../constants/AppConstant.js';

var DB = {
    'CHATS' : new RNDBModel.create_db(CHATS),
    'BOTS' : new RNDBModel.create_db(BOTS),
    'CHATITEMS' : new RNDBModel.create_db(CHATITEMS),
}

export default DB;