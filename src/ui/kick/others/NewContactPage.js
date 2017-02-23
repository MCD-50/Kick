
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
    EMAIL
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


class NewContactPage extends Component {
    constructor(params) {
        super(params);
        let data = this.props.route.data;
        this.input = {
            firstName: '',
            lastName: '',
            email: '',
            number: null,
        }


        this.onChageText = this.onChageText.bind(this);
        this.isAllowed = this.isAllowed.bind(this);
        this.showAlert = this.showAlert.bind(this);
        this.saveContact = this.saveContact.bind(this);
        this.getColor = this.getColor.bind(this);


        this.validateEmail = this.validateEmail.bind(this);
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
            input.firstName = text;
        } else if (whichState == 2) {
            input.lastName = text;
        } else if (whichState == 3) {
            input.email = text;
        } else if (whichState == 4) {
            input.number = text;
        }

    }


    validateEmail(email) {
        var atpos = email.indexOf("@");
        var dotpos = email.lastIndexOf(".");
        if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= email.length) {
            return false;
        }
        return true;
    }


    isAllowed() {
        let firstName = this.input.firstName;
        let lastName = this.input.lastName;
        let email = this.input.email;
        if (firstName && lastName && firstName.trim().length > 0 && lastName.trim().length > 0) {
            if (this.validateEmail(email)) {
                return true;
            } else {
                this.showAlert('Email error', 'Not a valid e-mail address');
            }
        } else {
            this.showAlert('Info...', 'Please fill in all the fields');
        }
        return false;
    }


    getColor(name) {
        const length = name.length;
        return colors[length % colors.length];
    }


    showAlert(title, body) {
        Alert.alert(
            title,
            body,
            [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
        );
    }

    saveContact() {
        if (this.isAllowed()) {
            let input = this.input;
            let title = input.firstName + ' ' + input.lastName;
            let email = input.email;
            let personal = {
                email: email,
                number: input.number,
            };

            getStoredDataFromKey(EMAIL).
                then((mail) => {
                    let room = (email.length >= mail.length) ? email + mail : mail + email;
                    let chat = CollectionUtils.createChat(title.trim(), 'No new message',
                        false, Type.PERSONAL, room, null, null, null, null, personal);
                    DatabaseHelper.addNewChat([chat], () => {
                        this.props.route.callback();
                        this.props.navigator.pop();
                    })
                })
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
                        label={'First name'}
                        labelColor='#9e9e9e'
                        highlightColor='#2e3c98'
                        onChangeText={(val) => this.onChageText(val, 1)}
                    />

                    <TextField
                        label={'Last name'}
                        labelColor='#9e9e9e'
                        highlightColor='#2e3c98'
                        onChangeText={(val) => this.onChageText(val, 2)}
                    />

                    <TextField
                        label={'Email'}
                        labelColor='#9e9e9e'
                        highlightColor='#2e3c98'
                        onChangeText={(val) => this.onChageText(val, 3)}
                    />

                    <TextField
                        label={'Phone number'}
                        labelColor='#9e9e9e'
                        keyboardType={'numeric'}
                        highlightColor='#2e3c98'
                        onChangeText={(val) => this.onChageText(val, 4)}
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
                            onPress={() => { this.saveContact() }}
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

NewContactPage.propTypes = propTypes;
NewContactPage.defaultProps = defaultProps;

export default NewContactPage;

