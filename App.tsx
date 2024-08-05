import 'react-native-gesture-handler';
import React, { useEffect } from 'react';

import { DataProvider } from './app/hooks';
import AppNavigation from './app/navigation/App';
import { View, Text, Image, StyleSheet, FlatList } from 'react-native';
import Menu from './app/navigation/Menu';


export default function App() {


    useEffect(() => {
        
    });



    return (
        <DataProvider>
            <AppNavigation />
        </DataProvider>
    );
}