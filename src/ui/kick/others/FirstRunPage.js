
import React, { Component, PropTypes } from 'react';
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    Alert,
    TouchableOpacity,
    Button,
} from 'react-native'

import { setData } from '../../../helpers/AppStore.js';
import Container from '../../Container.js';
import Toolbar from '../../customUI/ToolbarUI.js';
import { UPMARGIN, DOWNMARGIN, LEFTMARGIN, RIGHTMARGIN, FULL_NAME, MOBILE_NUMBER, FIRST_RUN } from '../../../constants/AppConstant.js';
import { Page } from '../../../enums/Page.js';
import CollectionUtils from '../../../helpers/CollectionUtils.js';
import TextField from '../../customUI/TextField.js';

const styles = StyleSheet.create({
    container: {
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

class FirstRunPage extends Component {
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
    }

    onChageText(text, whichState) {
        if (whichState == 1) {
            this.input.fullName = text;
        } else if (whichState == 2) {
            this.input.mobileNumber = text;
        }
    }

    isAllowed() {
        let fullName = this.input.fullName;
        if (fullName && fullName.trim().length > 0)
            return true;
        return false;
    }


    showAlert(title, body) {
        Alert.alert(
            title,
            body,
            [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
        );
    }


    saveName() {
        if (this.isAllowed()) {
            setData(FULL_NAME, this.input.fullName);
            setData(MOBILE_NUMBER, this.input.mobile);
            setData(FIRST_RUN, 'false');
            CollectionUtils.addDefaultBots(() => {
                let page = Page.CHAT_LIST_PAGE;
                this.props.navigator.replace({ id: page.id, name: page.name });
            })

        } else {
            this.showAlert('Info...', 'Please fill in all the fields');
        }
    }


    render() {
        return (
            <Container>
                <Toolbar centerElement={this.props.route.name} />
                <ScrollView style={styles.container} keyboardDismissMode='interactive'>

                    <TextField
                        label={'Full name'}
                        labelColor='#9e9e9e'
                        highlightColor='#2e3c98'
                        onChangeText={(val) => this.onChageText(val, 1)}
                    />


                    <TextField
                        label={'Mobile number'}
                        labelColor='#9e9e9e'
                        highlightColor='#2e3c98'
                        keybo
                        onChangeText={(val) => this.onChageText(val, 2)}
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
                            onPress={() => { this.saveName() }}
                            accessibilityTraits="button">
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{
                                    padding: 10,
                                    paddingLeft: 10,
                                    paddingRight: 10,
                                    fontSize: 17,
                                    color: 'white'
                                }}>DONE</Text>
                            </View>

                        </TouchableOpacity>

                    </View>

                </ScrollView>
            </Container>

        )
    }
}

FirstRunPage.propTypes = propTypes;
FirstRunPage.defaultProps = defaultProps;

export default FirstRunPage;

