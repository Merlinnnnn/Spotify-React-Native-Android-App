import { SafeAreaView, StatusBar, Image, ScrollView, StyleSheet, Text, View, Pressable, Touchable, TouchableOpacity,Dimensions, TextInput } from "react-native";
import React, {createContext, useEffect, useState } from "react";
import LinearGradient from "react-native-linear-gradient";
import { getAPI } from "../UsingAPI/CallAPI.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const Player = createContext<any>(null);

const ContextTrack = ({children}:any) => {
    const [currentTrack,setCurrentTrack] = useState(null);
    const [currentList,setCurrentList] = useState([]);
    return (
        <Player.Provider value={{currentTrack,setCurrentTrack,currentList,setCurrentList}}>
            {children}
        </Player.Provider>
    )
}
export {ContextTrack, Player}