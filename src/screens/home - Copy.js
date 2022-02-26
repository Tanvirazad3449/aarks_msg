import React, { Component } from 'react';
import {
    View, Alert, AsyncStorage, Text, Modal, TextInput, ImageBackground, Dimensions, Button, StatusBar, FlatList,
    SafeAreaView, NativeModules, PermissionsAndroid, ToastAndroid, StyleSheet, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Image, ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import data from './../mock_data/data.json'
import FeatherIcon from 'react-native-vector-icons/Feather';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
import F5Icon from 'react-native-vector-icons/FontAwesome5';
var DirectSms = NativeModules.DirectSms;
import {Slider} from '@miblanchard/react-native-slider';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Data_Pending: [],
            loading: true,
            changeNumberModalVisible: false,
            sendAllModalVisible:false,
            own_number: null,
            viewTextModalVisible: false,
            modalTextBody: "",
            modalTextTo: "",
            loading: false,
            time_interval:0.2
        };
    }

    componentDidMount() {
        this.getOwnNumber()
    }

    async getOwnNumber() {
        var own_number = await AsyncStorage.getItem('own_number');
        if (own_number === null) {
            //this.setState({own_number:"Enter Mobile Number"})
        } else {
            this.setState({ own_number: own_number })
            this.fetchSMS(own_number)
        }
    }
    async fetchSMS(own_number) {
        this.setState({ loading: true })
        const link = "https://procourierbd.com/api/pending-order?user_id=" + own_number;
        const data = await fetch(link);
        const item = await data.json();
        this.setState({ loading: false })

    }
    async sendMessage(to_number, sms_body) {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.SEND_SMS,
                {
                    title: 'Send SMS App Sms Permission',
                    message:
                        'Send SMS App needs access to your inbox ' +
                        'so you can send messages in background.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                DirectSms.sendDirectSms(to_number, sms_body);
                ToastAndroid.show("SMS Sent", ToastAndroid.SHORT)
            } else {
                alert('SMS permission denied');
            }
        } catch (error) {
            console.warn(error);
            alert(error);
        }

    }
    showTextModal(to, body) {
        this.setState({ modalTextTo: to, modalTextBody: body, viewTextModalVisible: true })
    }
    async saveOwnNumber() {
        await AsyncStorage.setItem('own_number', this.state.own_number);
        this.setState({ changeNumberModalVisible: false })
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <LinearGradient
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.1, y: 1 }}
                    colors={['#dcf8ef', '#fee2f8']}
                    style={{ flex: 1 }}>

                    <View style={styles.container}>
                        <Image
                            source={require('./../asset/image/logo.png')}
                            style={{ height: 60, width: 60 }} />

                        <TouchableOpacity
                            onPress={() => this.setState({ changeNumberModalVisible: !this.state.changeNumberModalVisible })}
                            style={styles.editNumberButton}>
                            <Text style={styles.editNumber}>{this.state.own_number === null ? "Enter Mobile Number" : this.state.own_number}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => this.props.navigation.pop()}
                            style={styles.reload}>
                            <MIcon
                                name="reload"
                                color="#0F2F4D"
                                size={30}
                            />
                        </TouchableOpacity>
                    </View>
                    {this.state.loading &&
                        <View style={{ height: 20, width: screenWidth, backgroundColor: "orange" }}>
                            <Text style={styles.listItemTo}>Loading...</Text>
                        </View>
                    }
                    <View style={{flexDirection:"row", alignItems: 'center', justifyContent: 'space-between',marginHorizontal:10, marginVertical:10}}>
                    <Text style={{fontSize:18, color:"black", fontWeight:"bold"}}>Found 15 SMS</Text>
                    <View style={styles.sendContainerAll}>
                                            <TouchableOpacity onPress={() => this.setState({sendAllModalVisible:true})} style={styles.sendButtonAll}>
                                                <Text style={{ color: "white" }}>Send All</Text>
                                            </TouchableOpacity>
                                        </View>

                    </View>

                    <FlatList
                        data={data}
                        horizontal={false}
                        style={{ paddingTop: 0 }}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item) => {
                            return item.id;
                        }}
                        renderItem={(post) => {
                            const item = post.item;
                            return (

                                    <View style={styles.listItemContainer}>

                                        <TouchableOpacity onPress={() => this.showTextModal(item.to_number, item.message)} style={styles.listItemTextContainer}>
                                            <Text style={styles.listItemTo}>{item.to_number}</Text>
                                            <View style={styles.listItemMsgContainer}>
                                                <Text numberOfLines={2} style={styles.msg}>{item.message}</Text>
                                            </View>
                                        </TouchableOpacity>

                                        <View style={styles.sendContainer}>
                                            <TouchableOpacity onPress={() => this.sendMessage()} style={styles.sendButtonAll}>
                                                <Text style={{ color: "white" }}>Send</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                            )
                        }} />

                </LinearGradient>

                {/**---------------------------------------- CHANGE OWN NUMBER MODAL--------------------------------------------------------------------------- */}

                <Modal
                    animationType="none"
                    transparent={true}
                    visible={this.state.changeNumberModalVisible}
                    onRequestClose={() => {
                        this.setState({ changeNumberModalVisible: !this.state.changeNumberModalVisible });
                    }}>
                    <View style={styles.modalContainer}>

                        <View style={styles.modalInnerContainer}>
                            <Text style={styles.label}>
                                Please enter your mobile number
                            </Text>
                            <TextInput style={{ fontSize: 20 }}
                                underlineColorAndroid="transparent"
                                placeholder="Mobile"
                                placeholderTextColor="#0F2F4D"
                                autoCapitalize="none"
                                keyboardType="default"
                                autoFocus={true}
                                onChangeText={(own_number) => this.setState({ own_number })}
                                value={this.state.own_number}
                            />


                            <TouchableOpacity onPress={() => this.saveOwnNumber()}>
                                <View style={styles.saveButton}>
                                    <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>Save</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setState({ changeNumberModalVisible: false })}>
                                <View style={styles.modalSaveButton}>
                                    <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>Cancel</Text>
                                </View>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>

                {/**---------------------------------------- VIEW TEXT MODAL--------------------------------------------------------------------------- */}

                <Modal
                    animationType="none"
                    transparent={true}
                    visible={this.state.viewTextModalVisible}
                    onRequestClose={() => {
                        this.setState({ viewTextModalVisible: !this.state.viewTextModalVisible });
                    }}>
                    <View style={styles.modalContainer}>

                        <View style={styles.modalInnerContainer}>

                            <View style={styles.modalListItemTextContainer}>
                                <Text style={styles.modalListItemTo}>{this.state.modalTextTo}</Text>
                                <View style={styles.modalListItemMsgContainer}>
                                    <Text style={styles.msg}>{this.state.modalTextBody}</Text>
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => this.saveOwnNumber()}>
                                <View style={styles.saveButton}>
                                    <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>Send SMS</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setState({ viewTextModalVisible: false })}>
                                <View style={styles.modalSaveButton}>
                                    <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>Cancel</Text>
                                </View>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>

                {/**---------------------------------------- SEND ALL MODAL--------------------------------------------------------------------------- */}

                <Modal
                    animationType="none"
                    transparent={true}
                    visible={this.state.sendAllModalVisible}
                    onRequestClose={() => {
                        this.setState({ sendAllModalVisible: !this.state.sendAllModalVisible });
                    }}>
                    <View style={styles.modalContainer}>

                        <View style={styles.modalInnerContainer}>
                        <View style={{
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
        alignItems: 'stretch',
        justifyContent: 'center',
    }}>
                            <Slider
                                value={this.state.time_interval}
                                onValueChange={time_interval => this.setState({time_interval})}
                            />
</View>
                            <TouchableOpacity onPress={() => this.saveOwnNumber()}>
                                <View style={styles.saveButton}>
                                    <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>Start Sending {this.state.time_interval}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setState({ viewTextModalVisible: false })}>
                                <View style={styles.modalSaveButton}>
                                    <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>Cancel</Text>
                                </View>
                            </TouchableOpacity>

                        </View>
                    </View>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: { backgroundColor: "white",elevation:5, height: 60, width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center",  },
    editNumberButton: { height: 60, width: screenWidth * 0.6, flexDirection: "row", alignItems: "center", justifyContent: 'center', },
    editNumber: { fontSize: 16, textDecorationLine: "underline", fontWeight: "bold", color: "#1d71f2" },
    reload: { height: 60, width: 60, alignItems: "center", justifyContent: 'center', },
    listItemContainer: { flexDirection: "row", justifyContent: "space-between",elevation:2, alignItems: "flex-end", marginLeft: 0, backgroundColor: "white", width: screenWidth - 20, alignSelf: "center", borderRadius: 10, marginBottom: 15 },
    listItemTextContainer: { alignItems: "flex-start", paddingVertical: 10, width: (screenWidth - 30) * 0.7, paddingLeft: 15 },
    modalListItemTextContainer: { alignItems: "flex-start", paddingVertical: 10, width: (screenWidth - 30), },
    listItemTo: { color: "#003d42", fontSize: 13, textAlign: "center", fontWeight: "bold" },
    modalListItemTo: { color: "#003d42", fontSize: 13, textAlign: "center", fontWeight: "bold", marginLeft: 20 },
    listItemMsgContainer: { padding: 6, backgroundColor: "#D2E3EC", borderRadius: 6 },
    modalListItemMsgContainer: { padding: 6, backgroundColor: "#D2E3EC", borderRadius: 6, marginHorizontal: 20 },
    msg: { color: "#0F2F4D", fontSize: 14, textAlign: "left", },
    sendContainer: { alignItems: "flex-start", width: (screenWidth - 30) * 0.17, height: (screenWidth - 30) * 0.15, justifyContent: 'center', },    
    sendContainerAll: { alignItems: "flex-start",  justifyContent: 'center', },
    sendButtonAll: { backgroundColor: "#1d71f2",  borderRadius: 3, elevation: 5,paddingHorizontal:8, height: 30, alignItems: "center", justifyContent: 'center', },
    modalContainer: { backgroundColor: 'rgba(0, 0, 0, 0.6)', flex: 1, flexDirection: "row", justifyContent: 'center', },
    modalInnerContainer: { backgroundColor: 'white', width: screenWidth - 40, alignSelf: "center", borderRadius: 20, alignItems: 'center', justifyContent: 'flex-start', },
    label: { fontSize: 16, fontWeight: "bold", marginHorizontal: 20, textAlign: "center", color: "grey", marginTop: 20 },
    saveButton: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        width: screenWidth - 80,
        alignSelf: "center",
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: "#1d71f2",
    },
    modalSaveButton: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        width: screenWidth - 80,
        alignSelf: "center",
        borderRadius: 5,
        marginBottom: 20,
        backgroundColor: "grey",

    }



})
export default Home;
