
import React, { Component, PropTypes } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    Dimensions,
    TextInput,
    Button,
    TouchableOpacity,
    Linking,
    Alert,
    ScrollView,
} from 'react-native';

import TextField from 'react-native-md-textinput';

const { width, height } = Dimensions.get("window");

const passwordIcon = require("../res/images/Email.png");
const emailIcon = require("../res/images/Password.png");
import CookieManager from 'react-native-cookies';
import { DOMAIN, EMAIL, SID, FULL_URL } from '../helper/AppConstant.js';
import { setData } from '../helper/SharedReferencesHelper.js';

import Container from './Container.js';

const header = 'http://'
const loginMethod = '/api/method/login?'
const loginUrl = 'http://192.168.0.106:3000/api/method/login?'; //+ login;


const styles = StyleSheet.create({

    base: {
        flex: 1,
        backgroundColor: '#333333'
    },

    container: {
        flex: 1,
        marginLeft: 20,
        marginRight: 20,
    },

    markWrap: {
        flex: 1,
        paddingVertical: 30,
    },
    mark: {
        width: null,
        height: null,
        flex: 1,
    },

    background: {
        width,
        height,
    },

    wrapper: {
        paddingVertical: 30,
        marginLeft: 20,
        marginRight: 20
    },

    inputWrap: {
        flexDirection: "row",
        marginVertical: 10,
        height: 40,
    },

    iconWrap: {
        paddingHorizontal: 7,
        alignItems: "center",
        justifyContent: "center",
    },

    icon: {
        height: 20,
        width: 20,
    },

    input: {
        flex: 1,
        height: 70
    },

    button: {
        backgroundColor: "#333333",
        paddingVertical: 20,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30,
    },

    buttonText: {
        color: "#FFF",
        fontSize: 18,
    },

    forgotPasswordText: {
        color: "#D8D8D8",
        backgroundColor: "transparent",
        textAlign: "right",
        paddingRight: 15,
    },

    signupWrap: {
        backgroundColor: "transparent",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },

    accountText: {
        color: "#D8D8D8"
    },

    signupLinkText: {
        color: "#FFF",
        marginLeft: 5,
    }
});

const propTypes = {
    navigator: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
};

class LoginPage extends Component {

    constructor(params) {
        super(params);
        this.state = {
            domain: '',
            username: '',
            password: '',
        };

        this.login = this.login.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
        this.signUp = this.signUp.bind(this);
    }

    login() {
        let email = this.state.email;
        let password = this.state.password;
        let domain = this.state.domain;

        console.log(email + domain + password);

        if (domain && email && password) {

            let fullUrl = header + domain + loginMethod + 'usr=' + email + '&pwd=' + password;

            fetch(header + domain + '/api/method/ping', {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            })
                .then((val) => {
                    fetch(fullUrl, {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                    })
                        .then((response) => response.json())
                        .then((responseData) => {
                            console.log(responseData);
                            if (responseData.message.includes('Incorrect password')) {
                                Alert.alert(
                                    'Network request failed.',
                                    'Incorrect Password, make sure the entered password is correct and try again in a little bit.',
                                    [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
                                );
                            } else if (responseData.message.includes('User disabled or missing')) {
                                Alert.alert(
                                    'Network request failed.',
                                    'Incorrect Username / Email, make sure the entered username / email is correct and try again in a little bit.',
                                    [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
                                );
                            } else {
                                CookieManager.get(fullUrl, (err, cookie) => {
                                    if (cookie && cookie.sid && cookie.sid !== 'Guest') {
                                        setData(DOMAIN, domain);
                                        setData(EMAIL, email);
                                        setData(SID, cookie.sid);
                                        setData(FULL_URL, fullUrl);
                                        this.props.navigator.replace({ id: 'HomePage', name: 'Home', data: {} })
                                    } else {
                                        Alert.alert(
                                            'Network request failed.',
                                            'Something went wrong at our end, try again in a little bit.',
                                            [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
                                        );
                                    }
                                });

                            }


                        })
                }, (reject) => {
                    Alert.alert(
                        'Network request failed.',
                        'Failed to connect to given domain, make sure the entered domain is correct and try in a little bit.',
                        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
                    );
                })




        } else {
            CookieManager.clearAll((err, res) => {
                console.log('cookies cleared!');
                console.log(err);
                console.log(res);
            });

            let msg;
            if (!email)
                msg = 'Email field cannot be empty.';
            else if (!password)
                msg = 'Password field cannot be empty.';
            else if (!domain)
                msg = 'Domain field cannot be empty.';
            else
                msg = 'Something went wrong, try in a little bit.';

            Alert.alert(
                'Something went wrong',
                msg,
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
            );

        }
    }

    signUp() {
        Linking.openURL('https://erpnext.com/login#signup');
    }

    forgotPassword() {
        Linking.openURL('https://erpnext.com/login#forgot');
    }

    render() {

        return (
            <Container>
                <View style={styles.container}>
                    <ScrollView>

                        <TextField
                            label={'Domain'}
                            height={40}
                            highlightColor={'#333333'}
                            value={this.state.domain}
                            onChangeText={(text) => this.setState({ domain: text })} />

                        <TextField
                            label={'Email'}
                            height={40}
                            highlightColor={'#333333'}
                            value={this.state.email}
                            onChangeText={(text) => this.setState({ email: text })} />

                        <TextField
                            label={'Password'}
                            height={40}
                            highlightColor={'#333333'}
                            value={this.state.password}
                            secureTextEntry
                            onChangeText={(text) => this.setState({ password: text })} />

                        <TouchableOpacity activeOpacity={.7} onPress={this.login}>
                            <View style={styles.button} >
                                <Text style={styles.buttonText}>Sign In</Text>
                            </View>
                        </TouchableOpacity>

                    </ScrollView>
                </View>
            </Container>
        );
    }
}


LoginPage.propTypes = propTypes;

export default LoginPage;


//   <View style={styles.container}>
//                             <View style={styles.signupWrap}>
//                                 <Text style={styles.accountText}>Don't have an account?</Text>
//                                 <TouchableOpacity activeOpacity={.5} onPress={this.signUp}>
//                                     <View>
//                                         <Text style={styles.signupLinkText}>Sign Up</Text>
//                                     </View>
//                                 </TouchableOpacity>
//                             </View>
//                         </View>



//  <View style={styles.wrapper}>
//                             <View style={styles.inputWrap}>
//                                 <View style={styles.iconWrap}>
//                                     <Image source={emailIcon} style={styles.icon} resizeMode="contain" />
//                                 </View>
//                                 <TextInput value={this.state.domain} placeholder="Domain" placeholderTextColor="#FFF" style={styles.input} />
//                             </View>
//                             <View style={styles.inputWrap}>
//                                 <View style={styles.iconWrap}>
//                                     <Image source={emailIcon} style={styles.icon} resizeMode="contain" />
//                                 </View>
//                                 <TextInput value={this.state.username} placeholder="Username" placeholderTextColor="#FFF" style={styles.input} />
//                             </View>
//                             <View style={styles.inputWrap}>
//                                 <View style={styles.iconWrap}>
//                                     <Image source={passwordIcon} style={styles.icon} resizeMode="contain" />
//                                 </View>
//                                 <TextInput value={this.state.password} placeholder="Password" placeholderTextColor="#FFF" style={styles.input} secureTextEntry />
//                             </View>
//                             <TouchableOpacity activeOpacity={.5} onPress={this.forgotPassword}>
//                                 <View>
//                                     <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//                                 </View>
//                             </TouchableOpacity>
//                             <TouchableOpacity activeOpacity={.8} onPress={this.login}>
//                                 <View style={styles.button} >
//                                     <Text style={styles.buttonText}>Sign In</Text>
//                                 </View>
//                             </TouchableOpacity>
//                         </View>