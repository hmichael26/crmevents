
import './app/constants/translations';

import 'react-native-gesture-handler';

import React, { useEffect } from 'react';

import { DataProvider } from './app/hooks';
import AppNavigation from './app/navigation/App';
import { View, Text, Image, StyleSheet, FlatList } from 'react-native';
import Menu from './app/navigation/Menu';
import 'intl-pluralrules';

export default function App() {







    return (
        <DataProvider>
            <AppNavigation />
        </DataProvider>
    );
}