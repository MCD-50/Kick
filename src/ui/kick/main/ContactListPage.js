import React, { Component, PropTypes } from 'react';
import {
    View,
    StyleSheet,
    Text,
    ListView,
    BackAndroid,
} from 'react-native';



import Toolbar from '../../customUI/ToolbarUI.js';
import DatabaseHelper from '../../../helpers/DatabaseHelper.js';
import Container from '../../Container.js';
import { Page } from '../../../enums/Page.js';
import { Type } from '../../../enums/Type.js';
import Avatar from '../../customUI/Avatar.js';
import Icon from '../../customUI/Icon.js';

import ListItem from '../../customUI/ListItem.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import Progress from '../../customUI/Progress.js';
import InternetHelper from '../../../helpers/InternetHelper.js';
import { getStoredDataFromKey } from '../../../helpers/AppStore.js';
import { FULL_URL } from '../../../constants/AppConstant.js';

import {
    UPMARGIN,
    DOWNMARGIN,
    LEFTMARGIN,
    RIGHTMARGIN,
} from '../../../constants/AppConstant.js';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    progress: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        marginTop: UPMARGIN,
        marginBottom: DOWNMARGIN,
        marginLeft: LEFTMARGIN,
        marginRight: RIGHTMARGIN,
        fontSize: 16,
        color: 'black',
    }
});

const propTypes = {
    navigator: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
};



const colors = [
    '#e67e22', // carrot
    '#3498db', // peter river
    '#8e44ad', // wisteria
    '#e74c3c', // alizarin
    '#1abc9c', // turquoise
    '#2c3e50', // midnight blue
];


const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.id !== r2.id });
class ContactListPage extends Component {

    constructor(params) {
        super(params);

        this.listOfContacts = [];
        this.listOfData = [];
        this.state = {
            searchText: '',
            owner: this.props.route.owner,
            isLoading: true,
            dataSource: ds.cloneWithRows([]),
            personals: [],
            selectedContacts: [],
        };


        this.addBackEvent = this.addBackEvent.bind(this);
        this.removeBackEvent = this.removeBackEvent.bind(this);
        this.setStateData = this.setStateData.bind(this);
        this.renderListItem = this.renderListItem.bind(this);

        this.onChangeText = this.onChangeText.bind(this);
        this.getColor = this.getColor.bind(this);
        this.getTitle = this.getTitle.bind(this);
        this.renderToolbarRightElement = this.renderToolbarRightElement.bind(this);
        this.onItemSelected = this.onItemSelected.bind(this);

        this.renderElement = this.renderElement.bind(this);
        this.callback = this.callback.bind(this);
        this.loadChats = this.loadChats.bind(this);

    }

    addBackEvent() {
        BackAndroid.addEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
                this.props.route.callback(Page.CONTACT_LIST_PAGE);
                this.props.navigator.pop();
                return true;
            }
            return false;
        });
    }

    removeBackEvent() {
        BackAndroid.removeEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
                this.props.route.callback(Page.CONTACT_LIST_PAGE);
                this.props.navigator.pop();
                return true;
            }
            return false;
        });
    }

    componentWillMount() {
        this.addBackEvent();
    }

    componentWillUnmount() {
        this.removeBackEvent();
    }

    componentDidMount() {
        this.setStateData();
    }


    setStateData() {
        InternetHelper.checkIfNetworkAvailable((isAvailable) => {
            if (isAvailable) {
                getStoredDataFromKey(FULL_URL)
                    .then((url) => InternetHelper.getAllUsers(url, (array, msg) => {
                        if (array && array.length > 0) {
                            let people = array.map((item) => {
                                if (item.email.toLowerCase() != this.state.owner.userId) {
                                    let title = item.last_name ? item.first_name + ' ' + item.last_name : item.first_name;
                                    let number = item.number ? item.number : null;
                                    return CollectionUtils.createChat(title, 'No new message', false,
                                        Type.PERSONAL, CollectionUtils.getRoom(this.state.owner.userId, true, null, item.email),
                                        null, null, CollectionUtils.getLastActive(item.last_active),
                                        CollectionUtils.createChatPersonObject({
                                            title: title,
                                            email: item.email,
                                            number: number,
                                        }));
                                }
                                return null;
                            });
                            people.splice(people.indexOf(null), 1)
                            DatabaseHelper.addNewChat(people, (msg) => {
                                this.loadChats()
                            }, true);
                        } else {
                            this.loadChats();
                        }
                    }));
            } else {
                this.loadChats();
            }
        })
    }


    loadChats() {
        DatabaseHelper.getAllChatsByQuery({ chat_type: Type.PERSONAL }, (results) => {
            let personals = results.map((result) => {
                return CollectionUtils.convertToChat(result, true);
            })
            if (this.props.route.isForGroupChat) {
                let _personals = personals.map((person) => {
                    return {
                        ...person,
                        title_copy: person.title,
                    }
                })
                this.listOfData = _personals;
                this.setState({
                    dataSource: ds.cloneWithRows(_personals),
                    isLoading: false
                });
            } else {
                this.setState({
                    dataSource: ds.cloneWithRows(personals),
                    isLoading: false
                });
            }
        })
    }




    onChangeText(e) {
        this.setState({ searchText: e });
    }

    callback() {
        this.setStateData();
    }

    getColor(name) {
        const length = name.length;
        return colors[length % colors.length];
    }

    //<Avatar bgcolor='#cbe3f5' icon='done' iconColor='#0078fd' />

    renderListItem(contact) {
        const searchText = this.state.searchText.toLowerCase();
        if (searchText.length > 0 && contact.title.toLowerCase().indexOf(searchText) < 0) {
            return null;
        }

        return (
            <ListItem
                divider
                leftElement={<Avatar bgcolor={this.getColor(contact.title)} text={this.getTitle(contact)} />}
                onLeftElementPress={() => {
                    if (this.props.route.isForGroupChat) {
                        this.onItemSelected(contact);
                    }
                }}
                centerElement={{
                    primaryText: contact.title,
                    secondaryText: contact.info.last_active,
                    tertiaryText: 'person'
                }}

                onPress={() => {
                    if (this.props.route.isForGroupChat) {
                        this.onItemSelected(contact);
                    } else {
                        let page = Page.CHAT_PAGE;
                        let state = this.state;
                        this.props.navigator.replace({
                            id: page.id,
                            name: page.name,
                            chat: contact,
                            callback: this.props.route.callback,
                            owner: state.owner,
                        })
                    }

                }} />
        );
    }

    onItemSelected(contact) {
        let index = this.listOfContacts.indexOf(contact);
        if (index > -1) {
            this.listOfContacts.splice(index, 1);
            contact.title_copy = contact.title;
        } else {
            this.listOfContacts.push(contact);
            contact.title_copy = '###icon';
        }

        this.listOfData[this.listOfData.indexOf(contact)] = contact;

        this.setState({
            dataSource: ds.cloneWithRows(this.listOfData),
            selectedContacts: this.listOfContacts,
        });
    }

    rightElementPress(action) {
        if (this.props.route.isForGroupChat && this.state.selectedContacts.length > 0) {
            let page = Page.NEW_GROUP_PAGE;
            this.props.navigator.replace({ id: page.id, name: page.name, callback: this.props.route.callback, contacts: this.state.selectedContacts, owner: this.props.route.owner });
        }
        else if (action && action.index == 0) {
            let page = Page.NEW_CONTACT_PAGE;
            this.props.navigator.push({ id: page.id, name: page.name, callback: this.callback })
        }
    }

    getTitle(contact) {
        if (contact.title_copy == '###icon')
            return contact.title_copy;
        return (contact.title.length > 1) ? contact.title[0] + contact.title[1].toUpperCase() : ((contact.title.length > 0) ? contact.title[0] : 'UN');
    }

    renderElement() {
        if (this.state.isLoading) {
            return (
                <View style={styles.progress}>
                    <Progress color={['#3f51b5']} size={50} duration={300} />
                </View>)
        } else if (this.state.dataSource._cachedRowCount < 1) {
            return (
                <Text style={styles.text}>It's empty in here.</Text>
            );
        }

        return (
            <ListView
                dataSource={this.state.dataSource}
                keyboardShouldPersistTaps='always'
                keyboardDismissMode='interactive'
                enableEmptySections={true}
                ref={'LISTVIEW'}
                renderRow={(item) => this.renderListItem(item)}
            />
        );
    }

    renderToolbarRightElement() {
        if (this.props.route.isForGroupChat) {
            if (this.state.selectedContacts.length > 0)
                return 'done';
            else
                return null;
        }

        return ({
            menu: {
                labels: ['Add contact']
            }
        });
    }

    render() {
        return (
            <Container>
                <Toolbar
                    leftElement="arrow-back"
                    onLeftElementPress={() => {
                        this.props.route.callback(Page.CONTACT_LIST_PAGE);
                        this.props.navigator.pop();
                    }}
                    centerElement={this.props.route.isForGroupChat ? 'Select contact' : this.props.route.name}
                    rightElement={this.renderToolbarRightElement()}
                    onRightElementPress={(action) => this.rightElementPress(action)}
                />
                {this.renderElement()}

            </Container>
        )
    }
}

ContactListPage.propTypes = propTypes;

export default ContactListPage;