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


const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    view: {
        margin: 10,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    text: {
        fontSize: 15,
    }

});

const propTypes = {
    navigator: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
};


class ViewInfo extends Component {

    constructor(params) {
        super(params);

        console.log(this.props);
        this.state = {
            data: this.props.route.item,
            fields: this.props.route.fields,
        }

        this.addBackEvent = this.addBackEvent.bind(this);
        this.removeBackEvent = this.removeBackEvent.bind(this);
        this.renderItem = this.renderItem.bind(this);
        this.renderItems = this.renderItems.bind(this);

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


    renderItem(key, value) {
        return (
            <View key={key} style={styles.view}>
                <Text style={styles.headerText}>{key[0].toUpperCase() + key.substring(1)} </Text>
                <Text style={styles.text}>{value} </Text>
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
