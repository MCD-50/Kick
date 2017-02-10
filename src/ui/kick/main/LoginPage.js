
import React, { Component, PropTypes } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    Linking,
    Alert,
    ScrollView,
} from 'react-native';


import InternetHelper from '../../../helpers/InternetHelper.js';
import { hasServerUrl, setData } from '../../../helpers/AppStore.js';
import Progress from '../../customUI/Progress.js';
import {
    FULL_URL, SERVER_URL, DOMAIN, EMAIL,
    UPMARGIN, DOWNMARGIN, LEFTMARGIN, RIGHTMARGIN, COLOR,
    USERNAME, STATUS
} from '../../../constants/AppConstant.js';

import Container from '../../Container.js';
import ToolbarUI from '../../customUI/ToolbarUI.js';
import { Page } from '../../../enums/Page.js';

var frappeIcon = require('../../../res/images/frappe.png');


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    view: {
        flex: 1,
        marginLeft: LEFTMARGIN,
        marginRight: RIGHTMARGIN,
        marginTop: UPMARGIN,
        marginBottom: DOWNMARGIN,
    },

    text: {
        flex: 1,
        color: 'white',
        fontSize: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },

    textInput: {
        color: 'black',
        fontSize: 17,
        borderWidth: 1.2,
        borderColor: '#b2b2b2',
        borderRadius: 3,
        padding: 5,
        paddingLeft: 10,
        paddingRight: 10
    },
    image: {
        width: 80,
        height: 80,
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


const colors = [
    '#e67e22', // carrot
    '#3498db', // peter river
    '#8e44ad', // wisteria
    '#e74c3c', // alizarin
    '#1abc9c', // turquoise
    '#2c3e50', // midnight blue
];

const defaultProps = {
    text: '',
    placeholder: 'Text...',
    placeholderTextColor: '#b2b2b2',
    multiline: false,
    autoFocus: false,
};


class LoginPage extends Component {

    constructor(params) {
        super(params);
        this.state = {
            domain: '',
            email: '',
            password: '',
            showProgress: false,
            showFirstRunPage: this.props.route.showFirstRunPage,
        };

        this.login = this.login.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
        this.signUp = this.signUp.bind(this);
        this.isAllowed = this.isAllowed.bind(this);
        this.showAlert = this.showAlert.bind(this);
        this.cleanDomain = this.cleanDomain.bind(this);
        this.setServerUrl = this.setServerUrl.bind(this);
        this.resolveServerUrl = this.resolveServerUrl.bind(this);
        this.onType = this.onType.bind(this);
        this.renderSignIn = this.renderSignIn.bind(this);
    }


    signUp() {
        Linking.openURL('https://erpnext.com/login#signup');
    }

    forgotPassword() {
        Linking.openURL('https://erpnext.com/login#forgot');
    }

    login() {
        this.setState({ showProgress: true, });
        if (this.isAllowed()) {

            let domain = this.state.domain;
            let email = this.state.email;
            let password = this.state.password;

            let full_url = 'http://' + domain + '/api/method/login?' + 'usr=' + email + '&pwd=' + password;
            InternetHelper.login(full_url, (title, body) => {
                this.showAlert(title, body);
            }, () => {
                setData(DOMAIN, domain);
                setData(EMAIL, email);
                setData(FULL_URL, full_url);
                this.resolveServerUrl();
            })
        } else {
            this.showAlert('Info...', 'Please fill in all the details');
        }
    }

    cleanDomain(domain) {
        let array = domain.split("/");
        length = array.length;
        return array[length - 1];
    }

    isAllowed() {
        let state = this.state;
        let domain = state.domain;
        let email = state.email;
        let password = state.password;
        if (domain && email && password && domain.trim().length > 0 && email.trim().length > 0 && password.trim().length > 0)
            return true;
        return false;
    }

    resolveServerUrl() {
        let domain = this.state.domain;
        hasServerUrl()
            .then((val) => {
                if (!val) {
                    fetch('http://' + domain + '/api/method/frappe.utils.bot_helper.get_dev_port')
                        .then((res) => res.json())
                        .then((data) => {
                            if (data.message[0] == 1) {
                                domain = domain.split(':');
                                let url = 'http://' + domain[0] + ':' + data.message[1];
                                this.setServerUrl(url, true);
                            } else {
                                domain = domain.split(':');
                                let url = 'http://' + domain[0];
                                this.setServerUrl(url, true);
                            }
                        }, (reject) => {
                            this.showAlert('Error...', 'Something went wrong.');
                        })
                } else {
                    this.setServerUrl('', false);
                }
            })
    }

    setServerUrl(server_url, set) {
        if (set) {
            setData(SERVER_URL, server_url);
        }
        let page;
        if (this.state.showFirstRunPage)
            page = Page.FIRST_RUN_PAGE;
        else
            page = Page.CHAT_LIST_PAGE;

        setTimeout(() => {
            this.setState({ showProgress: false, });
            this.props.navigator.replace({ id: page.id, name: page.name })
        }, 1000);
    }

    showAlert(title, body) {
        this.setState({ showProgress: false, });
        Alert.alert(
            title,
            body,
            [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
        );
    }

    onType(e, whichState) {
        if (whichState == 1) {
            this.setState({ domain: this.cleanDomain(e.nativeEvent.text) });
        } else if (whichState == 2) {
            this.setState({ email: e.nativeEvent.text });
        } else if (whichState == 3) {
            this.setState({ password: e.nativeEvent.text });
        }
    }


    renderSignIn() {
        if (this.state.showProgress) {
            return (
                <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 20 }}>
                    <Progress color={colors} size={50} duration={500} />
                </View>
            )
        }
        return null;
    }


    render() {
        return (
            <Container color='black'>
                <ScrollView style={styles.container} keyboardDismissMode='interactive'>

                    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 20 }}>
                        <Image source={frappeIcon} style={styles.image} />
                    </View>

                    <View style={styles.view}>
                        <TextInput style={styles.textInput}
                            placeholder='Domain...'
                            editable={!this.state.showProgress}
                            onChange={(e) => this.onType(e, 1)}
                            placeholderTextColor={this.props.placeholderTextColor}
                            multiline={this.props.multiline}
                            autoCapitalize='sentences'
                            enablesReturnKeyAutomatically={true}
                            underlineColorAndroid="transparent" />
                    </View>

                    <View style={styles.view}>
                        <TextInput style={styles.textInput}
                            placeholder='Email...'
                            editable={!this.state.showProgress}
                            onChange={(e) => this.onType(e, 2)}
                            placeholderTextColor={this.props.placeholderTextColor}
                            multiline={this.props.multiline}
                            autoCapitalize='sentences'
                            enablesReturnKeyAutomatically={true}
                            underlineColorAndroid="transparent"
                        />
                    </View>

                    <View style={styles.view}>
                        <TextInput style={styles.textInput}
                            placeholder='Password...'
                            editable={!this.state.showProgress}
                            onChange={(e) => this.onType(e, 3)}
                            placeholderTextColor={this.props.placeholderTextColor}
                            multiline={this.props.multiline}
                            autoCapitalize='sentences'
                            secureTextEntry={true}
                            enablesReturnKeyAutomatically={true}
                            underlineColorAndroid="transparent"
                        />
                    </View>

                    <TouchableOpacity style={{
                        alignItems: 'flex-end', justifyContent: 'flex-end', marginLeft: LEFTMARGIN,
                        marginRight: RIGHTMARGIN,
                        marginTop: RIGHTMARGIN,
                        marginBottom: RIGHTMARGIN,
                    }}
                        disabled={this.state.showProgress}
                        onPress={() => { this.forgotPassword() }}
                        accessibilityTraits="button">
                        <Text style={[styles.text, { color: '#5E64FF', fontSize: 14 }]}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.view, {
                        borderRadius: 3,
                        backgroundColor: '#5E64FF',
                    }]}
                        disabled={this.state.showProgress}
                        onPress={() => { this.login() }}
                        accessibilityTraits="button">
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={[styles.text, {
                                padding: 10,
                                paddingLeft: 10,
                                paddingRight: 10
                            }]}>Sign In</Text>
                        </View>

                    </TouchableOpacity>


                    <TouchableOpacity style={{
                        alignItems: 'center', justifyContent: 'center', marginLeft: LEFTMARGIN,
                        marginRight: RIGHTMARGIN,
                        marginTop: RIGHTMARGIN,
                        marginBottom: RIGHTMARGIN
                    }}
                        disabled={this.state.showProgress}
                        onPress={() => { this.signUp() }}
                        accessibilityTraits="button">
                        <Text style={[styles.text, { color: '#5E64FF', fontSize: 14 }]}>Don't have an account? Sign Up</Text>
                    </TouchableOpacity>

                    {this.renderSignIn()}
                </ScrollView>
            </Container>
        );
    }
}


//  <TextField
//                             label={'Domain'}
//                             height={40}
//                             highlightColor={'#333333'}
//                             value={this.state.domain}
//                             onChangeText={(text) => this.setState({ domain: text })} />

//                         <TextField
//                             label={'Email'}
//                             height={40}
//                             highlightColor={'#333333'}
//                             value={this.state.email}
//                             onChangeText={(text) => this.setState({ email: text })} />

//                         <TextField
//                             label={'Password'}
//                             height={40}
//                             highlightColor={'#333333'}
//                             value={this.state.password}
//                             secureTextEntry
//                             onChangeText={(text) => this.setState({ password: text })} />

//                         <TouchableOpacity activeOpacity={.7} onPress={this.login}>
//                             <View style={styles.button} >
//                                 <Text style={styles.buttonText}>Sign In</Text>
//                             </View>
//                         </TouchableOpacity>





LoginPage.propTypes = propTypes;
export default LoginPage;
