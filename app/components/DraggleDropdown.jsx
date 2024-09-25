import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import BottomSheet from 'react-native-reanimated-bottom-sheet';
import Animated from 'react-native-reanimated';

const { height } = Dimensions.get('window');

const ButtonBottomSheetDropdown = ({ options, onSelect }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const sheetRef = useRef(null);
  const fall = useRef(new Animated.Value(1)).current;

  const renderContent = () => (
    <View style={styles.bottomSheetContent}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.optionItem}
          onPress={() => {
            setSelectedOption(option);
            onSelect(option);
            sheetRef.current.snapTo(1);
          }}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.bottomSheetHeader}>
      <View style={styles.bottomSheetHeaderBar} />
    </View>
  );

  const getFontSize = (size) => {
    // Implémentez votre logique de taille de police ici
    return size;
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.button,
          { flex: 0.4, marginBottom: sizes.base, borderWidth: 1, borderColor: "#ccc" }
        ]}
        onPress={() => sheetRef.current.snapTo(0)}
      >
        <Text style={[styles.buttonText, { fontSize: getFontSize(13), textTransform: 'uppercase' }]}>
          {selectedOption || "Valider"}
        </Text>
      </TouchableOpacity>

      <BottomSheet
        ref={sheetRef}
        snapPoints={[height * 0.4, 0]}
        renderContent={renderContent}
        renderHeader={renderHeader}
        initialSnap={1}
        callbackNode={fall}
        enabledGestureInteraction={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  bottomSheetContent: {
    backgroundColor: 'white',
    padding: 16,
    height: '100%',
  },
  bottomSheetHeader: {
    backgroundColor: 'white',
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetHeaderBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'gray',
    alignSelf: 'center',
    marginBottom: 10,
  },
  optionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
  },
});