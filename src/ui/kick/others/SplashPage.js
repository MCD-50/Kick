import React, { Component, PropTypes, } from 'react';
import {
    View,
    StyleSheet,
    Image,
    StatusBar,
    Alert,
} from 'react-native';



import InternetHelper from '../../../helpers/InternetHelper.js';
import { isFirstRun, getStoredDataFromKey, hasServerUrl, setData } from '../../../helpers/AppStore.js';
import { FULL_URL, SERVER_URL, SID, DOMAIN, EMAIL, FIRST_RUN, APP_DATA } from '../../../constants/AppConstant.js';
import { Page } from '../../../enums/Page.js';
import Progress from '../../customUI/Progress.js';
var frappeIcon = require('../../../res/images/frappe.png');



const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    image: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center'
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

let defaultBots;

class SplashPage extends Component {

    constructor(params) {
        super(params);
        this.state = {
            isFirstRun: false,
            showProgress: false,
        }

        this.navigate = this.navigate.bind(this);
        this.showAlert = this.showAlert.bind(this);
        this.renderProgressRing = this.renderProgressRing.bind(this);
        this.setServerUrl = this.setServerUrl.bind(this);
        this.resolveServerUrl = this.resolveServerUrl.bind(this);

    }


    componentDidMount() {
        InternetHelper.checkIfNetworkAvailable((isConnected) => {
            if (isConnected) {
                isFirstRun(false)
                    .then((value) => {
                        this.setState({ isFirstRun: value })
                        this.navigate(value);
                    });
            } else {
                this.showAlert('No connection', 'Please check your internet connection.', false);
            }
        })

    }

    navigate(isFirstRun) {
        let page;
        if (isFirstRun) {
            page = Page.LOGIN_PAGE;
            setTimeout(() => {
                this.props.navigator.replace({ id: page.id, name: page.name, showFirstRunPage: true });
            }, 3000);
        } else {
            this.setState({ showProgress: true });
            getStoredDataFromKey(FULL_URL)
                .then((full_url) => {
                    if (full_url) {
                        InternetHelper.login(full_url, (title, body) => {
                            this.showAlert(title, body);
                        }, () => {
                            this.resolveServerUrl(full_url);
                        })
                    } else {
                        page = Page.LOGIN_PAGE;
                        setTimeout(() => {
                            this.setState({ showProgress: false });
                            this.props.navigator.replace({ id: page.id, name: page.name, showFirstRunPage: true });
                        }, 3000);
                    }
                }, (reject) => {
                    page = Page.LOGIN_PAGE;
                    setTimeout(() => {
                        this.setState({ showProgress: false });
                        this.props.navigator.replace({ id: page.id, name: page.name, showFirstRunPage: false });
                    }, 3000);

                });
        }
    }


    resolveServerUrl(full_url) {
        let index = full_url.lastIndexOf('api');
        let ping_url = full_url.substring(0, index);

        hasServerUrl()
            .then((val) => {
                if (!val) {
                    fetch(ping_url + '/api/method/frappe.utils.bot_helper.get_dev_port')
                        .then((res) => res.json())
                        .then((data) => {
                            if (data[0] == 1) {
                                domain = domain.split(':');
                                let url = 'http://' + domain[0] + ':' + data[1];
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

    setServerUrl(server_url, setData) {
        if (setData)
            setData(SERVER_URL, server_url);
        let page = Page.CHAT_LIST_PAGE;
        setTimeout(() => {
            this.setState({ showProgress: false });
            this.props.navigator.replace({ id: page.id, name: page.name});
        }, 1000);

    }

    showAlert(title, body, navigateToOtherPage = true) {
        this.setState({ showProgress: false });
        let page = Page.LOGIN_PAGE;
        Alert.alert(
            title,
            body,
            [{
                text: 'OK', onPress: () => {
                    if (navigateToOtherPage)
                        this.props.navigator.replace({ id: page.id, name: page.name, showFirstRunPage: false })
                }
            }]
        );
    }

    renderProgressRing() {
        if (this.state.showProgress) {
            return (
                <Progress color={['#3f51b5']} size={50} duration={300} />)
        }
        return null;
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor='black' barStyle='light-content' />
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black' }}>
                    <Image source={frappeIcon} style={styles.image} resizeMode="contain" />
                    {this.renderProgressRing()}
                </View>
            </View>
        );
    }
}

SplashPage.propTypes = propTypes;

export default SplashPage;