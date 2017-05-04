//import from system
import Fluxify from 'fluxify';
import { dispatcher as Dispatcher } from 'fluxify';

const StateClient = Fluxify.createStore({
	id: 'StateClient',
	initialState: {
		appData: null,
		currentPageId: null,
		chatList: [],
		currentChat: null,
		currentChatMessages: [],
	},

	actionCallbacks: {
		updateChatList: (updater, chatList) => {
			const list = chatList.slice();
			updater.set({ chatList: list });
		},
		setAppData: (updater, appData) => {
			const obj = Object.assign({}, appData);
			updater.set({ appData: obj });
		},
		updateCurrentChatMessages: (updater, currentChatMessages) => {
			const list = currentChatMessages.slice();
			updater.set({ currentChatMessages: list });
		},
		updateCurrentChat: (updater, currentChat) => {
			const obj = Object.assign({}, currentChat);
			updater.set({ currentChat: obj });
		},
		updateCurrentPageId: (updater, currentPageId) => {
			updater.set({ currentPageId: currentPageId })
		},
		removeData: (updater) => {
			updater.set({
				currentChat: null,
				currentChatMessages: []
			});
		}
	}
});

export default StateClient;