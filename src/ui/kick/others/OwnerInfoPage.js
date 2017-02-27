
import React, { Component, PropTypes } from 'react';
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    Alert,
    BackAndroid,
} from 'react-native'

import { setData } from '../../../helpers/AppStore.js';
import Container from '../../Container.js';
import Toolbar from '../../customUI/ToolbarUI.js';
import { UPMARGIN, DOWNMARGIN, LEFTMARGIN, RIGHTMARGIN, FIRST_NAME, LAST_NAME, FIRST_RUN } from '../../../constants/AppConstant.js';
import { Page } from '../../../enums/Page.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import TextField from '../../customUI/TextField.js';

const styles = StyleSheet.create({
    container: {
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

class OwnerInfoPage extends Component {
    constructor(params) {
        super(params);
        this.input = {
            fullName: '',
            mobileNumber: '',
        }

        this.onChageText = this.onChageText.bind(this);
        this.isAllowed = this.isAllowed.bind(this);
        this.showAlert = this.showAlert.bind(this);
        this.saveName = this.saveName.bind(this);
        this.saveNumber = this.saveNumber.bind(this);
        
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
        console.log(text);
        if (whichState == 1) {
            this.input.fullName = text;
        } else if (whichState == 2) {
            this.input.mobileNumber = text;
        }
    }

    isAllowed(isFullName) {
        if (isFullName) {
            let fullName = this.input.fullName;
            if (fullName && fullName.trim().length > 0)
                return true;
            return false;
        } else {
            let number = this.input.mobileNumber;
            if (number && fullName.trim().length >= 10)
                return true;
            return false;
        }
    }


    showAlert(title, body) {
        Alert.alert(
            title,
            body,
            [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
        );
    }


    saveName() {
        if (this.isAllowed(true)) {
            setData(FULL_NAME, this.input.fullName);
        } else {
            this.showAlert('Info...', 'Please enter your full name');
        }
    }

    saveNumber() {
        if (this.isAllowed(false)) {
            setData(MOBILE_NUMBER, this.input.mobileNumber);
        } else {
            this.showAlert('Info...', 'Please enter valid phone number');
        }
    }

    render() {
        return (
            <Container>
                <Toolbar centerElement={this.props.route.name}
                    rightElement='done'
                    onRightElementPress={() => this.saveName()} />
            </Container>

        )
    }
}

OwnerInfoPage.propTypes = propTypes;
OwnerInfoPage.defaultProps = defaultProps;

export default OwnerInfoPage;

