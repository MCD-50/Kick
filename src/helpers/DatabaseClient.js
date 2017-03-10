var RNDBModel = require('../test/index.js');

import { CHATITEMS, CHATS } from '../constants/AppConstant.js';

var DB = {
	'CHATS': new RNDBModel.create_db(CHATS),
	'CHATITEMS': new RNDBModel.create_db(CHATITEMS),
}

export default DB;