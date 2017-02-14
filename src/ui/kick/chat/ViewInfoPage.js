import React, { Component, PropTypes } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Text,
    BackAndroid,
} from 'react-native';

import Toolbar from '../../customUI/ToolbarUI.js';
import Conatainer from '../../Container.js';
import { UPMARGIN, DOWNMARGIN, LEFTMARGIN, RIGHTMARGIN } from '../../../constants/AppConstant.js';


const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: LEFTMARGIN,
        marginRight: RIGHTMARGIN,
        marginBottom: DOWNMARGIN,
        marginTop: UPMARGIN,
    },
    view: {
        marginBottom: 10,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },

    headerText: {
        fontSize: 17,
    },

    text: {
        fontSize: 14,
    }

});

const propTypes = {
    navigator: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
};


class ViewInfo extends Component {

    constructor(params) {
        super(params);
        this.state = {
            data: this.props.route.data.info.listItems,
            fields: this.props.route.data.info.fields,
        }

        this.addBackEvent = this.addBackEvent.bind(this);
        this.removeBackEvent = this.removeBackEvent.bind(this);
        this.renderItem = this.renderItem.bind(this);
        this.renderItems = this.renderItems.bind(this);

    }

    componentWillMount() {
        this.addBackEvent();
    }

    componentWillUnmount() {
        this.removeBackEvent();
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

    renderItem(key, value) {
        let title = key[0].toUpperCase() + key.substring(1);
        return (
            <View key={key} style={styles.view}>
                <Text style={styles.headerText}>{title.trim()} </Text>
                <Text style={styles.text}> {value.trim()} </Text>
            </View>)
    }

    renderItems() {
        let data = this.state.data;

        let components = this.state.fields.map((field) => {
            return this.renderItem(field, data[field])
        })

        return (
            <ScrollView style={styles.container}>
                {components}
            </ScrollView>
        )
    }

    render() {
        return (
            <Container>
                <Toolbar
                    leftElement="arrow-back"
                    onLeftElementPress={() => {
                        this.props.navigator.pop();
                    }}
                    centerElement={this.props.route.name} />

                {this.renderItems()}
            </Container>)

    }

}

ViewInfo.propTypes = propTypes;
export default ViewInfo;
