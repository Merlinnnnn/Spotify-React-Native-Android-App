import { SafeAreaView, StatusBar, Image, ScrollView, StyleSheet, Text, View, Pressable, Touchable, TouchableOpacity, Dimensions, TextInput } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import LinearGradient from "react-native-linear-gradient";
import { getAPI } from "../UsingAPI/CallAPI.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation ,useIsFocused } from "@react-navigation/native";
import TrackPlayer, { Capability, State, usePlaybackState, useTrackPlayerEvents, Event } from 'react-native-track-player';
import Loading from "./Loading";
import { Player } from "./ContextTrack";
import { BottomModal, ModalContent } from 'react-native-modals';
import { CreatePlaylist } from "../UsingAPI/PlayListAPI.js";
import SongPlayer from "./SongPlayer";
import CurrentTrackBottom from "./CurrentTrackBottom";

const { width: screenWidth } = Dimensions.get("window");

function isSameArray(array1: any, array2: any) {
    return array1.length === array2.length && array1.every((value: any, index: any) => value === array2[index])
}


function Home(): React.JSX.Element {
    const navigation: any = useNavigation();
    const [userProfile, setUserProfile] = useState();
    const [recentPlayed, setRecentPlayed] = useState([]);
    const [topArtists, setTopArtists] = useState([]);
    const [playList, setPlayList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currentTrack, setCurrentTrack, currentList, setCurrentList }: any = useContext(Player);
    const [modalVisible, setModalVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [modalNewPLaylistVisible, setModalNewPlaylistVisible] = useState(false);
    const [isRefresh,setIsRefresh] = useState(false);
    useTrackPlayerEvents([Event.PlaybackState], async (event) => {
        if (event.type === Event.PlaybackState) {
            const state = await TrackPlayer.getState();
            if (state === State.Playing) {
                setIsPlaying(true);
            } else if (state === State.Paused) {
                setIsPlaying(false);
            }

        }
    });

    useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
        if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== null) {
            const nextTrackId = event.nextTrack;
            setCurrentTrack(currentList[nextTrackId]);
        }
    });

    const NameForPlaylist = ({isRefresh,setIsRefresh}:any) => {
        const [text, setText] = useState('');
        return (
            <View style={{ justifyContent: "center", alignItems: "center", width: "100%", height: "100%", backgroundColor: "#000", paddingHorizontal: 30 }}>
                <Text numberOfLines={2} style={{ color: "#fff", fontSize: 30, fontWeight: "bold" }}>Name your playlist</Text>
                <View style={{ width: "100%", height: 60, paddingHorizontal: 20, borderBottomColor: "#fff", borderBottomWidth: 2, marginTop: 20 }}>
                    <TextInput
                        onChangeText={setText}
                        placeholder="Enter Your Playlist's Name"
                        placeholderTextColor={"#fff"}
                        style={{ textAlign: "center", color: "#fff", fontSize: 20, fontWeight: "bold", width: "100%", height: "100%" }} />
                </View>
                <View style={{ flexDirection: "row", marginTop: 30, justifyContent: "space-around", width: "100%" }}>
                    <TouchableOpacity
                        onPress={() => {  
                            setModalNewPlaylistVisible(false);
                        }}
                        style={{ justifyContent: "center", alignItems: "center", width: 100, height: 50, backgroundColor: "#000", borderRadius: 30, borderColor: "#fff", borderWidth: 1 }}>
                        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "bold" }}>Cancle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={async () => {
                            const accessToken = await AsyncStorage.getItem("token");
                            const res_addPll = await CreatePlaylist(userProfile.id, text, accessToken);
                            if (res_addPll.ok) {
                                setIsRefresh(!isRefresh);
                                setModalNewPlaylistVisible(false);
                            } else {
                                console.log("Cannot create the playlist!");
                            }
                        }}
                        style={{ justifyContent: "center", alignItems: "center", width: 100, height: 50, backgroundColor: "#18b14c", borderRadius: 30 }}>
                        <Text style={{ color: "#000", fontSize: 15, fontWeight: "bold" }}>Create</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const RenderPlaylist = ({ item }: any) => {
        return (
            <View style={{ marginRight: 10 }}>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate("DetailPlayList", { data: item, user_id: userProfile.id, isRefreshHome:isRefresh, setIsRefreshHome:setIsRefresh });
                    }}
                    style={{ flex: 1, borderRadius: 10, overflow: "hidden" }}>
                    <LinearGradient style={{ alignItems: "center" }} colors={["#232323", "#282828"]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 1 }}>
                        {
                            item.images ? (
                                <Image source={{ uri: item.images[0].url }} style={{ width: (screenWidth - 40) / 3, height: (screenWidth - 40) / 3 }} />
                            ) : <Image source={{ uri: "https://t3.ftcdn.net/jpg/01/95/82/02/360_F_195820215_3qBs8o8cUenR6H9ZWIjnKe60IXSb1xjv.jpg" }} style={{ width: (screenWidth - 40) / 3, height: (screenWidth - 40) / 3 }} />
                        }
                        <Text ellipsizeMode="middle" numberOfLines={2} style={{ width: (screenWidth - 40) / 3, fontSize: 17, fontWeight: "bold", color: "#fff" }}>{item.name}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        )
    }
    const setContentTracksPlayer = async (data_saveTracks: any) => {
        const listTracks = data_saveTracks.map((item: any, index: any) => {
            return {
                id: item.track.id,
                url: item.track.preview_url,
                title: item.track.name,
                artist: item.track.artists[0].name
            }
        })

        await TrackPlayer.reset();
        await TrackPlayer.add(listTracks);
    }
    const RenderRecentPlayed = ({ item, trackIndex }: any) => {
        return (
            <View style={{ marginRight: 10 }}>
                <TouchableOpacity
                    onPress={async () => {

                        if (!isSameArray(recentPlayed, currentList)) {
                            await setContentTracksPlayer(recentPlayed);
                            setCurrentList(recentPlayed);
                        }
                        setCurrentTrack(item);
                        setModalVisible(!modalVisible);
                        const state = await TrackPlayer.getState();
                        if (state === State.Playing || state === State.Paused) {
                            await TrackPlayer.stop();
                        }
                        await TrackPlayer.skip(trackIndex);
                        TrackPlayer.play();
                    }}
                    style={{ flex: 1, borderRadius: 10, overflow: "hidden" }}>
                    <LinearGradient style={{ alignItems: "center" }} colors={["#232323", "#282828"]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 1 }}>
                        <Image source={{ uri: item.track.album.images[0].url }} style={{ width: (screenWidth - 40) / 3, height: (screenWidth - 40) / 3 }} />
                        <Text ellipsizeMode="middle" numberOfLines={2} style={{ width: (screenWidth - 40) / 3, fontSize: 17, fontWeight: "bold", color: "#fff" }}>{item.track.name}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        )
    }

    const ArtistsComponent = ({ item }: any) => {
        return (
            <TouchableOpacity
                onPress={() => {
                    navigation.navigate("DetailArtists", { data: item ,isRefreshHomeArtist:isRefresh, setIsRefreshHomeArtist: setIsRefresh});
                }}
                style={{ alignItems: "center", marginRight: 20 }}>
                <Image style={{ width: (screenWidth - 40) / 3, height: (screenWidth - 40) / 3, borderRadius: (screenWidth - 40) / 3 }} source={{ uri: item.images[0].url }} />
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: "bold", marginTop: 10 }}>{item.name}</Text>
            </TouchableOpacity>
        )
    }

    useEffect(() => {
        const getProfile = async () => {
            const accessToken = await AsyncStorage.getItem("token");
            console.log("Token-getProfile: ", accessToken);

            const url_user = "https://api.spotify.com/v1/me";
            const config_user = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            };

            const config_songs = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            };
            const url_songs = "https://api.spotify.com/v1/me/player/recently-played?limit=8";

            const config_artists = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            };
            const url_artists = "https://api.spotify.com/v1/me/top/artists";

            const url_playlist = "https://api.spotify.com/v1/me/playlists?offset=0&limit=20";
            try {
                const data_user = await getAPI(url_user, config_user);

                const data_songs = await getAPI(url_songs, config_songs);

                const data_artists = await getAPI(url_artists, config_artists);
                const data_playList = await getAPI(url_playlist, config_user);
                setUserProfile(data_user);
                setRecentPlayed(data_songs.items);
                setTopArtists(data_artists.items);
                setPlayList(data_playList.items);
                await TrackPlayer.setupPlayer();
                // console.log("=================");
                // console.log("userProfile-data: ", data_user);

                // console.log("=================");
                // console.log("recentPlayed-data: ", data_songs);

                // console.log("=================");
                // console.log("Top artists-data: ", data_artists);
                setIsLoading(false);
            } catch (err: any) {
                console.log(err.message);
            }
        }
        console.log("Dang vao home")
        getProfile();
    }, [isRefresh]);
    console.log("user-prf: ", userProfile);
    console.log("recent-pld: ", recentPlayed);
    console.log("top-arts: ", topArtists);
    console.log("userPlaylist: ", playList);
    if (isLoading) {
        return (
            <Loading />
        )
    }
    return (
        <>
            <View style={{ flex: 1, backgroundColor: "#282828" }}>
                <StatusBar backgroundColor={"black"} />
                <SafeAreaView style={{ flex: 1, paddingBottom: 50 }}>
                    <LinearGradient colors={["#232323", "#282828"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[style.largestContainer]}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={[style.headingContainer]}>
                                <TouchableOpacity>
                                    <Image source={require("../icons/menu.png")} style={{ tintColor: "#fff" }} />
                                </TouchableOpacity>
                                <Text style={[style.helloText]}>Hello, Love you</Text>
                                <Image style={[style.avatar]} source={{ uri: userProfile?.images[0].url }} />
                            </View>
                            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", marginTop: 30 }}>Your self</Text>
                            <View style={[{ marginTop: 10, flexWrap: "wrap", flexDirection: "row" }]}>
                                <View style={[style.topButtonContainer]}>
                                    <TouchableOpacity style={{ flex: 1, borderRadius: 15, overflow: "hidden" }}
                                        onPress={() => { navigation.navigate("LikedSong"); }}>
                                        <LinearGradient style={[style.likedSongsButton]} colors={["#F87275", "#c24f83"]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 1 }}>
                                            <Image source={require("../icons/heart-d-24.png")} style={{ tintColor: "#fff", width: 30, height: 30 }} />
                                            <Text style={{ fontSize: 17, fontWeight: "bold", color: "#fff" }}>Liked songs</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ marginTop: 30 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>Your Playlist</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setModalNewPlaylistVisible(true);
                                        }}
                                        style={{ justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#fff", padding: 10, borderRadius: 5 }}>
                                        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "bold" }}>New PlayList</Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView
                                    horizontal

                                    showsHorizontalScrollIndicator={false}
                                    style={{ marginTop: 20 }}>
                                    {
                                        playList.map((item, index) => {
                                            return <RenderPlaylist item={item} key={index} />
                                        })
                                    }
                                </ScrollView>
                            </View>
                            <View>
                                <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", marginTop: 10 }} >Top Artists</Text>
                                <ScrollView style={{ marginTop: 20 }}
                                    horizontal

                                    showsHorizontalScrollIndicator={false}>
                                    {
                                        topArtists.map((item, index) => {
                                            return <ArtistsComponent item={item} key={index} />
                                        })
                                    }
                                </ScrollView>
                            </View>
                            <View style={{ marginTop: 10 }}>
                                <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", marginTop: 10 }} >Recently Played</Text>
                                <ScrollView style={{ marginTop: 20 }}
                                    horizontal

                                    showsHorizontalScrollIndicator={false}>
                                    {
                                        recentPlayed.map((item, index) => {
                                            return <RenderRecentPlayed item={item} key={index} trackIndex={index} />
                                        })
                                    }
                                </ScrollView>
                            </View>
                        </ScrollView>
                        {
                            currentTrack && (<View style={{ height: 100 }}>
                                <CurrentTrackBottom currentTrack={currentTrack} modalVisible={modalVisible}
                                    setModalVisible={setModalVisible} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
                            </View>
                            )
                        }

                    </LinearGradient>
                </SafeAreaView>
            </View>
            <BottomModal
                visible={modalVisible}
                onHardwareBackPress={() => setModalVisible(false)}
                swipeDirection={["up", "down"]}
                swipeThreshold={200}>
                <ModalContent style={{ height: "100%", width: "100%", backgroundColor: "#453249" }}>
                    <SongPlayer item={currentTrack} modalVisible={modalVisible} setModalVisible={setModalVisible} isRefresh={isRefresh} setIsRefresh={setIsRefresh}/>
                </ModalContent>
            </BottomModal>
            <BottomModal
                visible={modalNewPLaylistVisible}
                onHardwareBackPress={() => setModalNewPlaylistVisible(false)}
                swipeDirection={["up", "down"]}
                swipeThreshold={200}>
                <ModalContent style={{ height: "100%", width: "100%", backgroundColor: "#000" }}>
                    <NameForPlaylist isRefresh={isRefresh} setIsRefresh={setIsRefresh}/>
                </ModalContent>
            </BottomModal>
        </>
    )
}

const style = StyleSheet.create({
    largestContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 20
    },
    headingContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    avatar: {
        width: 60,
        height: 60,
        resizeMode: "cover",
        borderRadius: 60
    },
    helloText: {
        fontSize: 30,
        fontWeight: "600",
        color: "white"
    },
    topButtonContainer: {
        width: "50%",
        height: 80,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 5,
        paddingVertical: 10
    },
    likedSongsButton: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flex: 1,
        paddingHorizontal: 10
    }
})
export default Home;