
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
            userId: owner.userId,
            userName: owner.userName,
            domain: owner.domain,
            groupName: '',
        }

        this.onChageText = this.onChageText.bind(this);
        this.isAllowed = this.isAllowed.bind(this);
        this.showAlert = this.showAlert.bind(this);
        this.saveGroup = this.saveGroup.bind(this);

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
            let room = 'GROUP' + title.replace(/\s/g, '') + this.input.userId;
            getStoredDataFromKey(MOBILE_NUMBER)
                .then((number) => {
                    let _number = number ? number : null;

                    let contact = CollectionUtils.createGroupPeopleObject({
                        title: this.input.userName,
                        email: this.input.userId,
                        number: _number,
                    });

                    let _contacts = this.input.contacts.map((con) => {
                        return {
                            title: con.title,
                            email: con.personal.email,
                            number: con.personal.number,
                        }
                    })

                    let group = CollectionUtils.createGroupObject({
                        isMute: false,
                        people: _contacts.concat(contact),
                    });

                    let chat = CollectionUtils.createChat(title.trim(), 'No new message', true,
                        Type.GROUP, room, null, null, null, null, null, group);

                    DatabaseHelper.addNewChat([chat], () => {
                        this.props.route.callback(Page.NEW_GROUP_PAGE);
                        this.props.navigator.pop();
                    })
                })
        } else {
            this.showAlert('Info...', 'Please fill in all the fields');
        }
    }


    render() {
        return (
            <Container>
                <Toolbar centerElement={this.props.route.name}
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

                    </View>

                </ScrollView>
            </Container >

        )
    }
}

NewGroupPage.propTypes = propTypes;
NewGroupPage.defaultProps = defaultProps;

export default NewGroupPage;

