import { useTheme } from '@/hooks/useTheme';
import { AntDesign, FontAwesome, SimpleLineIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StatusBar, View } from 'react-native';

const Layout = () => {
  const theme = useTheme();
  
  return (
    <>
    <Tabs screenOptions={{
      tabBarStyle: {
        backgroundColor: theme.surface,
        position: 'absolute',
        bottom: 40,
        justifyContent: 'center',
        alignSelf: 'center',
        height: 63,
        marginHorizontal: 100,
        padding: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        paddingBottom: 8,
        borderRadius: 40,
        borderWidth: 1,
        borderTopWidth: 1,
        borderColor: theme.border,
        borderTopColor: theme.border,
      },
      tabBarShowLabel: false,
      tabBarInactiveTintColor: theme.textSecondary,
      tabBarActiveTintColor: theme.white,
    }}>
      <Tabs.Screen 
        name="index" 
        options={{
          tabBarIcon: ({color,size,focused}) => (
            <View 
              style={{
                top: 10,
                borderRadius: 30,
                backgroundColor: focused ? theme.tint : theme.surface,
                padding: 8, 
                width: 36, 
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SimpleLineIcons name='pie-chart' size={18} color={color} />
            </View>
          ),
        }} 
      />
      <Tabs.Screen 
        name="transactions" 
        options={{
          tabBarIcon: ({color,size,focused}) => (
            <View 
              style={{
                top: 10,
                borderRadius: 30,
                backgroundColor: focused ? theme.tint : theme.surface,
                padding: 8,
                width: 36, 
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AntDesign name='swap' size={18} color={color} />
            </View>
          ),
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          tabBarIcon: ({color,size,focused}) => (
            <View 
              style={{
                top: 10,
                borderRadius: 30,
                backgroundColor: focused ? theme.tint : theme.surface,
                padding: 8,
                width: 36, 
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FontAwesome name='user-o' size={18} color={color} />
            </View>
          ),
        }} 
      />
    </Tabs>
    <StatusBar barStyle={'default'} />
    
    </>
  );
};

export default Layout