
import React, { Component, PropTypes } from 'react';
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    Alert,
    BackAndroid,
    TouchableOpacity,
} from 'react-native'

import { setData } from '../../../helpers/AppStore.js';
import Container from '../../Container.js';
import Toolbar from '../../customUI/ToolbarUI.js';
import {
    UPMARGIN,
    DOWNMARGIN,
    LEFTMARGIN,
    RIGHTMARGIN,
    FIRST_NAME,
    LAST_NAME,
    EMAIL,
    MOBILE_NUMBER
} from '../../../constants/AppConstant.js';
import { Page } from '../../../enums/Page.js';
import { Type } from '../../../enums/Type.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import TextField from '../../customUI/TextField.js';
import DatabaseHelper from '../../../helpers/DatabaseHelper.js';
import Avatar from '../../customUI/Avatar.js';
import { getStoredDataFromKey } from '../../../helpers/AppStore.js';
import InternetHelper from '../../../helpers/InternetHelper.js';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: UPMARGIN,
        marginBottom: DOWNMARGIN,
        marginLeft: LEFTMARGIN,
        marginRight: RIGHTMARGIN,
    },

    innerContainer: {
        flex: 1,
    },

    text: {
        fontSize: 15,
        fontWeight: '300',
        color: '#b2b2b2'
    },

    textInput: {
        fontSize: 18,
        fontWeight: '300',
        color: 'black',
    }

});

const propTypes = {
    navigator: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    text: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    placeholderTextColor: React.PropTypes.string,
    multiline: React.PropTypes.bool,
    autoFocus: React.PropTypes.bool,
};

const defaultProps = {
    text: '',
    placeholder: 'Text...',
    placeholderTextColor: '#b2b2b2',
    multiline: false,
    autoFocus: false,
};


const colors = [
    '#e67e22', // carrot
    '#3498db', // peter river
    '#8e44ad', // wisteria
    '#e74c3c', // alizarin
    '#1abc9c', // turquoise
    '#2c3e50', // midnight blue
];


class NewGroupPage extends Component {
    constructor(params) {
        super(params);
        let owner = this.props.route.owner;
        this.input = {
            contacts: this.props.route.contacts,
            owner: this.props.route.owner,
            groupName: '',
        }
        this.state = {
            title: 'New group',
        }
        this.onChageText = this.onChageText.bind(this);
        this.isAllowed = this.isAllowed.bind(this);
        this.showAlert = this.showAlert.bind(this);
        this.saveGroup = this.saveGroup.bind(this);
        this.renderButton = this.renderButton.bind(this);
        this.addBackEvent = this.addBackEvent.bind(this);
        this.removeBackEvent = this.removeBackEvent.bind(this);
    }

    addBackEvent() {
        BackAndroid.addEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
                this.props.navigator.pop();
                return true;
            }
            return false;
        });
    }

    removeBackEvent() {
        BackAndroid.removeEventListener('hardwareBackPress', () => {
            if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1) {
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

    onChageText(text, whichState) {
        let input = this.input;
        if (whichState == 1) {
            input.groupName = text;
        }
    }

    isAllowed() {
        let groupName = this.input.groupName;
        if (groupName && groupName.trim().length > 0) {
            return true;
        }
        return false;
    }


    showAlert(title, body) {
        Alert.alert(
            title,
            body,
            [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
        );
    }


    saveGroup() {
        if (this.isAllowed()) {
            let title = this.input.groupName;
            let room = this.input.owner.userId + 'group@' + title.replace(/\s/g, '').toLowerCase();
            let contact = CollectionUtils.createChatPersonObject({
                title: this.input.owner.userName,
                email: this.input.owner.userId,
                number: this.input.owner.number,
            });
            this.setState({ title: 'Creating...' });
            let _contacts = this.input.contacts.map((con) => {
                return {
                    title: con.title,
                    email: con.person.email,
                    number: con.person.number,
                }
            })

            let group = CollectionUtils.createChatGroupObject({
                people: _contacts.concat(contact),
            });

            let welcome_text = this.input.owner.userName + ' created this group.';
            let chatItem = CollectionUtils.createChatItem(this.input.owner.userName,
                this.input.owner.userId, welcome_text, CollectionUtils.getCreatedOn(), true,
                room, Type.GROUP);


            let chat = CollectionUtils.createChat(title.trim(), chatItem.message.text, true, Type.GROUP,
                room, 0, chatItem.message.created_on,
                CollectionUtils.getLastActive(chatItem.message.created_on), null, group);

            let obj = CollectionUtils.prepareBeforeSending(Type.GROUP,
                title.trim(), room, 0, null, null, chatItem);
            console.log(obj);

            InternetHelper.checkIfNetworkAvailable((isConnected) => {
                if (isConnected) {
                    InternetHelper.setUsersInARoom(this.input.owner.domain, group.people, room, (msg) => {
                        DatabaseHelper.addNewChat([chat], (msg) => {
                            console.log(msg);
                            DatabaseHelper.addNewChatItem([chatItem], (msg) => {
                                InternetHelper.sendData(this.input.owner.domain, obj, this.input.owner.userId);
                                this.setState({ title: 'New group' });
                                console.log(msg);
                                this.props.route.callback(Page.NEW_GROUP_PAGE, chat);
                                this.props.navigator.pop();
                            });
                        });
                    });
                } else {
                    this.setState({ title: 'New group' });
                }
            });

        } else {
            this.setState({ title: 'New group' });
            this.showAlert('Info...', 'Please fill in all the fields');
        }
    }

    renderButton() {
        if (this.state.title.toLowerCase() == 'new group') {
            return (
                <TouchableOpacity style={{
                    borderRadius: 3,
                    backgroundColor: '#5E64FF',
                    width: 100
                }}
                    onPress={() => { this.saveGroup() }}
                    accessibilityTraits="button">
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{
                            padding: 10,
                            paddingLeft: 10,
                            paddingRight: 10,
                            fontSize: 17,
                            color: 'white'
                        }}>CREATE</Text>
                    </View>

                </TouchableOpacity>
            );
        }
        return null;
    }


    render() {
        return (
            <Container>
                <Toolbar centerElement={this.state.title}
                    leftElement="arrow-back"
                    onLeftElementPress={() => {
                        this.props.navigator.pop();
                    }} />
                <ScrollView style={styles.container} keyboardDismissMode='interactive'>
                    <TextField
                        label={'Group name'}
                        labelColor='#9e9e9e'
                        highlightColor='#2e3c98'
                        onChangeText={(val) => this.onChageText(val, 1)}
                    />
                    <View style={{
                        marginTop: 10,
                        alignItems: 'flex-end',

                    }}>
                        {this.renderButton()}
                    </View>
                </ScrollView>
            </Container >

        )
    }
}

NewGroupPage.propTypes = propTypes;
NewGroupPage.defaultProps = defaultProps;

export default NewGroupPage;

