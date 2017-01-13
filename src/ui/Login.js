
// import React, { Component } from 'react';
// import {
//     AppRegistry,
//     StyleSheet,
//     Text,
//     View,
//     Button
// } from 'react-native';


// import {
//     Card,
//     CardImage,
//     CardTitle,
//     CardContent,
//     CardAction
// } from 'react-native-card-view';


// import MaterialsIcon from 'react-native-vector-icons/MaterialIcons';
// import { Kohana } from 'react-native-textinput-effects';
// import { MessageAction } from '../action/MessageAction.js';
// import { Message } from '../model/Message.js';
// import CookieManager from 'react-native-cookies';


// export class Login extends Component {

//     contructor() {
//         this.state = { input: '', password: '' };
//         this.submitData = this.submitData.bind(this);
//         this.login = this.login.bind(this);
//     }


//     submitData() {
//         //let text = this.state.input;
//         //let password = this.state.password;
//         //console.log(this.refs['EMAIL_BOX']);
//         //const login = 'usr=' + text + '&pwd=' + password;
//         //const loginUrl = 'http://192.168.0.106:3000/api/method/login?' + login;
//         //MessageAction.sendMessage(new Message('Me', 'You', text, 'Today'));
//         this.setState({ input: '', password: '' })
//         //login(loginUrl);
//     }

//     login(loginUrl) {
//         CookieManager.get(loginUrl, (err, cookie) => {
//             console.log(cookie);
//             //let isAuthenticated;
//             if (cookie && cookie.sid && cookie.sid !== 'Guest') {
//                 //isAuthenticated = true;
//                 this.props.navigator.pop();
//             }
//         });
//     }

//     render() {
//         return (
//             <Card style={styles.card}>
//                 <CardTitle>
//                     <Text style={styles.title}>Login </Text>
//                 </CardTitle>
//                 <CardContent style={{ padding: 10 }}>
//                     <Kohana
//                         ref={'EMAIL_BOX'}
//                         style={{ backgroundColor: '#f9f5ed' }}
//                         label={'Email'}
//                         iconClass={MaterialsIcon}
//                         iconName={'directions-send'}
//                         iconColor={'#f4d29a'}
//                         labelStyle={{ color: '#91627b' }}
//                         inputStyle={{ color: '#91627b' }}
//                         onSubmitEditing={this.submitData} />

//                     <Kohana
//                         ref={'PASSWORD_BOX'}
//                         style={{ backgroundColor: '#f9f5ed' }}
//                         label={'Password'}
//                         secureTextEntry={true}
//                         iconClass={MaterialsIcon}
//                         iconName={'directions-send'}
//                         iconColor={'#f4d29a'}
//                         labelStyle={{ color: '#91627b' }}
//                         inputStyle={{ color: '#91627b' }}
//                         onSubmitEditing={this.submitData} />

//                 </CardContent>
//                 <CardAction>
//                     <Button
//                         title='LOGIN'
//                         style={styles.button}
//                         onPress={() => submitData} />
//                 </CardAction>
//             </Card>
//         )

//     }
// }

// const styles = StyleSheet.create({
//     title: {
//         fontSize: 38,
//         backgroundColor: 'transparent'
//     },
//     card: {
//         padding: 10,
//         justifyContent: 'center',
//         alignItems: 'center'
//     },
//     button: {
//         margin: 10,
//         justifyContent: 'center',
//         alignItems: 'center'
//     }
// });

