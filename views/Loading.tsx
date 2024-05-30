import {ActivityIndicator, SafeAreaView, StatusBar, Image, ScrollView, StyleSheet, Text, View, Pressable, Touchable, TouchableOpacity, Dimensions, TextInput } from "react-native";
import React, { useContext, useEffect, useState } from "react";

function Loading(): React.JSX.Element {
    return (
        <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
            <ActivityIndicator size="large" color="#00ff00"/>
            <Text style={{color:"#000", fontSize:30, fontWeight:"bold"}}>Wait a minute :3 !!!</Text>
        </View>
    )
}

export default Loading;