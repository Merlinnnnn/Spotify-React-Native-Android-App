import { SafeAreaView, StatusBar, Image, ScrollView, StyleSheet, Text, View, Pressable, Touchable, TouchableOpacity, Dimensions, TextInput } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import LinearGradient from "react-native-linear-gradient";
import { getAPI } from "../UsingAPI/CallAPI.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Player } from "./ContextTrack";

import TrackPlayer, { Capability, State, usePlaybackState, useTrackPlayerEvents, Event } from 'react-native-track-player';
import LikedSong from "./LikedSong.js";

function CurrentTrackBottom({ currentTrack, modalVisible, setModalVisible, isPlaying, setIsPlaying }: any): React.JSX.Element {
    const LikedCurrentTrack = () => {
        return (
            <TouchableOpacity
                onPress={() => setModalVisible(!modalVisible)}
                style={[style.currentTrack]}>
                <View>
                    <Image style={{ width: 60, height: 60, borderRadius: 5 }} source={{ uri: currentTrack.track.album.images[0].url }} />
                </View>
                <View style={{flex:1,marginLeft:5}}>
                    <Text numberOfLines={1} style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>{currentTrack.track.name}</Text>
                    <Text numberOfLines={1} style={{ color: "#fff", fontSize: 15 }}>{currentTrack.track.artists[0].name}</Text>
                </View>
                <TouchableOpacity
                    onPress={async () => {
                        setIsPlaying(!isPlaying);
                        const state = await TrackPlayer.getState();
                        if (state === State.Playing) {

                            await TrackPlayer.pause();
                        } else if (state === State.Paused) {
                            await TrackPlayer.play();
                        }

                    }}>
                    {
                        isPlaying === true ? <Image style={{ tintColor: "#fff" }} source={require("../icons/pause.png")} />
                            : <Image style={{ tintColor: "#fff" }} source={require("../icons/play.png")} />
                    }

                </TouchableOpacity>
            </TouchableOpacity>
        )
    }
    const ArtistTopTracks = () => {
        return (
            <TouchableOpacity
                onPress={() => setModalVisible(!modalVisible)}
                style={[style.currentTrack]}>
                <View>
                    <Image style={{ width: 60, height: 60, borderRadius: 5 }} source={{ uri: currentTrack.album.images[0].url }} />
                </View>
                <View style={{flex:1}}>
                    <Text numberOfLines={1} style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>{currentTrack.name}</Text>
                    <Text numberOfLines={1} style={{ color: "#fff", fontSize: 15 }}>{currentTrack.artists[0].name}</Text>
                </View>
                <TouchableOpacity
                    
                    onPress={async () => {
                        setIsPlaying(!isPlaying);
                        const state = await TrackPlayer.getState();
                        if (state === State.Playing) {

                            await TrackPlayer.pause();
                        } else if (state === State.Paused) {
                            await TrackPlayer.play();
                        }

                    }}>
                    {
                        isPlaying === true ? <Image style={{ tintColor: "#fff" }} source={require("../icons/pause.png")} />
                            : <Image style={{ tintColor: "#fff" }} source={require("../icons/play.png")} />
                    }

                </TouchableOpacity>
            </TouchableOpacity>
        )
    }
    if (currentTrack.track == null) {
        return (
            <ArtistTopTracks />
        )
    } else {
        return (
            <LikedCurrentTrack />
        )
    }
}
const style = StyleSheet.create({
    currentTrack: {
        backgroundColor: "#38224e",
        padding: 10,
        position: "absolute",
        borderRadius: 10,
        left: 10,
        right: 10,
        bottom: 5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    }
})

export default CurrentTrackBottom;