import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

import Login from './views/Login';
import Home from './views/Home';
import Profile from './views/Profile';
import LikedSong from './views/LikedSong';
import DetailPlayList from './views/DetailPlayList';
import DetailArtists from './views/DetailArtists';
import Search from './views/Search';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const BottomTabs = () => {
    return (
        <Tab.Navigator initialRouteName='Home' screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: {
                position: 'absolute',
                bottom: 4,
                left: 10,
                right: 10,
                elevation: 0,
                borderRadius: 15,
                height: 60,
                backgroundColor: "rgba(0,0,0,0.8)",
            }
        }}>

            <Tab.Screen name='Home' component={Home} options={{
                tabBarIcon: ({ focused }) => (
                    focused ? (
                        <LinearGradient colors={['#F86D76',  '#C24F83']} start={{x: 0, y: 1}}  end={{x: 1, y: 1}} style={{width:"70%", height:40, borderRadius:40}}>
                            <View style={{ width: "100%", height: "100%",  justifyContent: "center", alignItems: "center" }}>
                                <Image source={require("./icons/home.png")}
                                    resizeMode='contain' style={{ width: 25, height: 25, tintColor:"#fff" }} />
                            </View>
                        </LinearGradient>
                    ) :
                        (
                            <View >
                                <Image source={require("./icons/home.png")}
                                    resizeMode='contain' style={{ width: 25, height: 25, tintColor:"#C24F83" }} />
                            </View>
                        )

                )
            }} />
            <Tab.Screen name='Profile' component={Profile} options={{
                tabBarIcon: ({ focused }) => (
                    focused ? (
                        <LinearGradient colors={['#F86D76',  '#C24F83']} start={{x: 0, y: 1}}  end={{x: 1, y: 1}} style={{width:"70%", height:40, borderRadius:40}}>
                            <View style={{ width: "100%", height: "100%",  justifyContent: "center", alignItems: "center" }}>
                                <Image source={require("./icons/user.png")}
                                    resizeMode='contain' style={{ width: 25, height: 25, tintColor:"#fff" }} />
                            </View>
                        </LinearGradient>
                    ) :
                        (
                            <View >
                                <Image source={require("./icons/user.png")}
                                    resizeMode='contain' style={{ width: 25, height: 25, tintColor:"#C24F83" }} />
                            </View>
                        )

                )
            }} />
            <Tab.Screen name='Search' component={Search} options={{
                tabBarIcon: ({ focused }) => (
                    focused ? (
                        <LinearGradient colors={['#F86D76',  '#C24F83']} start={{x: 0, y: 1}}  end={{x: 1, y: 1}} style={{width:"70%", height:40, borderRadius:40}}>
                            <View style={{ width: "100%", height: "100%",  justifyContent: "center", alignItems: "center" }}>
                                <Image source={require("./icons/search.png")}
                                    resizeMode='contain' style={{ width: 25, height: 25, tintColor:"#fff" }} />
                            </View>
                        </LinearGradient>
                    ) :
                        (
                            <View >
                                <Image source={require("./icons/search.png")}
                                    resizeMode='contain' style={{ width: 25, height: 25, tintColor:"#C24F83" }} />
                            </View>
                        )

                )
            }} />
        </Tab.Navigator>
        
    )
}

export default Navigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName='Login' screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Main" component={BottomTabs} />
                <Stack.Screen name="LikedSong" component={LikedSong} />
                <Stack.Screen name= "DetailPlayList" component={DetailPlayList}/>
                <Stack.Screen name= "DetailArtists" component={DetailArtists}/>
            </Stack.Navigator>
        </NavigationContainer>
    )
}

