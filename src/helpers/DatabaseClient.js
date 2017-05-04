//import from system
const RNDBModel = require('../test/index.js');
const DB = {
	'CHATS': new RNDBModel.create_db('chats'),
	'CHATITEMS': new RNDBModel.create_db('chatitems')
}

export default DB;