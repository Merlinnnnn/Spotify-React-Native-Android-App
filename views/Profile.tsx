import { SafeAreaView, StatusBar, Image, ScrollView, StyleSheet, Text, View, Pressable, Touchable, TouchableOpacity, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import LinearGradient from "react-native-linear-gradient";
import { getAPI } from "../UsingAPI/CallAPI.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation,useIsFocused } from "@react-navigation/native";
import { load } from "react-native-track-player/lib/src/trackPlayer.js";
import Loading from "./Loading";

const { width: screenWidth } = Dimensions.get("window");

function Info(): React.JSX.Element {
    
    const [userProfile, setUserProfile] = useState();
    const [followArtists, setFollowArtists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefresh,setIsRefresh] = useState(false);
    const navigation: any = useNavigation();
    const isFocused = useIsFocused();
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
    const getInfo = async () => {
        const accessToken = await AsyncStorage.getItem("token");
        console.log("Token-getProfile: ", accessToken);

        const url_user = "https://api.spotify.com/v1/me";
        const config_user = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        };
        const url_followArtists = "https://api.spotify.com/v1/me/following?type=artist";
        const config_followArtists = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        };

        try {
            const data_user = await getAPI(url_user, config_user);
            setUserProfile(data_user);
            const data_followArtists = await getAPI(url_followArtists, config_followArtists);
            setFollowArtists(data_followArtists.artists.items);
            setIsLoading(false);
        }
        catch (err: any) {
            console.log(err.message);
        }
    }
    useEffect(() => {
        getInfo();
    }, [isRefresh])
    useEffect(() => {
        if (isFocused) {
            getInfo();
        }
    }, [isFocused]);
    console.log("dsadsa: ", userProfile)
    if (isLoading) {
        return (
            <Loading />
        )
    }
    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <View style={{ flex: 1 }}>
                <LinearGradient colors={['#c24f83', '#000000']} style={{ flex: 1 }}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerText}>Information</Text>
                        </View>
                        <TouchableOpacity
                            onPress={()=>{
                                AsyncStorage.removeItem("token");
                                AsyncStorage.removeItem("expirationDate");
                                navigation.navigate("Login")
                            }}
                            style={styles.headerIcon}>
                            <Image source={require("../icons/exit.png")}
                                resizeMode='contain' style={{ marginLeft: 10, width: 25, height: 25, tintColor: "#FFFFFF" }} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 10, padding: 10 }}>
                        <Image source={{ uri: userProfile?.images[0].url }}
                            resizeMode='contain' style={styles.avatar} />
                        <Text style={styles.nameText}>

                            {userProfile.display_name}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 5, paddingLeft: 5 }}>
                        <Text style={{fontSize: 15, color: 'white', padding: 10}}>
                            Folowers:  {userProfile.followers.total}
                        </Text>
                    </View>
                </LinearGradient>
            </View>
            <View style={{ flex: 2 }}>
                <Text style={[styles.headerText, { padding: 10 }]}>Subcribe Artist</Text>
                <ScrollView style={{ marginTop: 10 , height: 120}}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}>
                    {
                        followArtists.map((item, index) => {
                            return <ArtistsComponent item={item} key={index} />
                        })
                    }
                </ScrollView>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    header: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 15
    },
    headerText: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
    },
    nameText: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        padding: 20,
    },
    headerIcon: {
        flexDirection: 'row',
        marginLeft: 20
    },
    avatar: {
        paddingBottom: 10,
        width: 80,
        height: 80,
        borderRadius: 60,
        resizeMode: 'cover'
    },
    editButton: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flex: 1,
        paddingHorizontal: 10
    }
})
export default Info;