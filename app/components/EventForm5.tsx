import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Dimensions, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../hooks';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Button from './Button';

const { height } = Dimensions.get('window');

interface DateFieldProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

const DateField: React.FC<DateFieldProps> = ({ date, onDateChange }) => {
  const [show, setShow] = useState(false);

  const onChange = (event: Event, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShow(false);
    onDateChange(currentDate);
  };

  return (
    <View style={{ flex: 1, flexDirection: "row", alignContent: "center", }}>
      <TouchableOpacity onPress={() => setShow(true)} style={{ marginTop: 5, marginHorizontal: 5 }}>
        <Text style={{ textAlign: "center", fontSize: 15 }}>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is20Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
};

interface Option {
  label: string;
  value: string;
}

type FieldType = 'date' | 'text' | 'dynamic';

interface Field {
  type: FieldType;
  value: Date | string;
}

const Form5: React.FC = () => {
  const { gradients, colors } = useTheme();
  const [fields, setFields] = useState<Field[]>([]);
  const [dynamicOptions, setDynamicOptions] = useState<Option[]>([
    { label: 'En train d\'écrire', value: 'writing' },
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ]);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionValue, setNewOptionValue] = useState('');

  const addRandomField = (option: number): void => {
    const fieldTypes: FieldType[] = ['date', 'text', 'dynamic'];
    const randomType = fieldTypes[option];
    let newField: Field;

    switch (randomType) {
      case 'date':
        newField = { type: 'date', value: new Date() };
        break;
      case 'text':
        newField = { type: 'text', value: '' };
        break;
      case 'dynamic':
        newField = { type: 'dynamic', value: dynamicOptions[0].value };
        break;
    }

    setFields([...fields, newField]);
  };

  const updateField = (index: number, newValue: Date | string): void => {
    const newFields = [...fields];
    newFields[index].value = newValue;
    setFields(newFields);
  };
  const removeField = (index: number): void => {
    const newFields = [...fields];
    newFields.splice(index, 1); // Remove one item at the specified index
    setFields(newFields);
  };

  const addOption = () => {
    if (newOptionLabel && newOptionValue) {
      setDynamicOptions([...dynamicOptions, { label: newOptionLabel, value: newOptionValue }]);
      setNewOptionLabel('');
      setNewOptionValue('');
    }
  };

  const removeOption = (index: number) => {
    const newOptions = dynamicOptions.filter((_, i) => i !== index);
    setDynamicOptions(newOptions);
  };

  const renderField = (field: Field, index: number) => {
    switch (field.type) {
      case 'date':
        return (
          <View key={index} style={{ flexDirection: "row", alignContent: "center", borderColor: "#ccc", borderWidth: 1, padding: 10, borderRadius: 10 }}>
            <TouchableOpacity onPress={() => removeField(index)}>
              <Text style={{ fontSize: 20, color: colors.primary, fontWeight: "bold" }}>X</Text>
            </TouchableOpacity>
            <DateField
              date={field.value as Date}
              onDateChange={(newDate) => updateField(index, newDate)}
            />
          </View>
        );
      case 'text':
        return (
          <View key={index} style={{ flexDirection: "row", alignContent: "center", borderColor: "#ccc", borderWidth: 1, padding: 10, borderRadius: 10 }}>
            <TouchableOpacity onPress={() => removeField(index)}>
              <Text style={{ fontSize: 20, color: colors.primary, fontWeight: "bold" }}>X</Text>
            </TouchableOpacity>
            <TextInput
              style={{ fontSize: 18, color: "#000", textAlign: "center", marginLeft: 7 }}
              value={field.value as string}
              onChangeText={(newText: string) => updateField(index, newText)}
              placeholder="Enter text"
            />

          </View>


        );
      case 'dynamic':
        return (
          <View 
          key={index} 
          style={{ 
            flex: 1, 
            flexDirection: "row",
            alignItems: "center",  
            justifyContent: "space-between", 
            borderColor: "#ccc", 
            borderWidth: 1, 
            paddingHorizontal: 10, 
            borderRadius: 10 
          }}
        >
          <TouchableOpacity onPress={() => removeField(index)}>
            <Text style={{ fontSize: 20, color: colors.primary, fontWeight: "bold" }}>X</Text>
          </TouchableOpacity>
          <Picker
            selectedValue={field.value as string}
            style={[styles.picker, { flex: 1 }]} 
            onValueChange={(itemValue) => updateField(index, itemValue)}
          >
            {dynamicOptions.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {fields.map((field, index) => (
        <View key={index} style={styles.fieldContainer}>
          {renderField(field, index)}
        </View>
      ))}

      <View style={styles.buttonContainer}>
        <Button gradient={gradients.secondary} style={styles.button} onPress={() => addRandomField(0)}>
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonText, styles.centerText]}>Champ DATE</Text>
            <Text style={[styles.buttonText, { fontSize: 25, marginHorizontal: 5 }]}>+</Text>
          </View>
        </Button>
        <Button gradient={gradients.info} style={styles.button} onPress={() => addRandomField(1)}>
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonText, styles.centerText]}>Champ TEXT</Text>
            <Text style={[styles.buttonText, { fontSize: 25, marginHorizontal: 5 }]}>+</Text>
          </View>
        </Button>
        <Button gradient={gradients.success} style={styles.button} onPress={() => addRandomField(2)}>
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonText, styles.centerText]}>Champ DYNAMIQUE</Text>
            <Text style={[styles.buttonText, { fontSize: 25, marginHorizontal: 5 }]}>+</Text>
          </View>
        </Button>
        {/* <Button gradient={gradients.info} style={styles.button} onPress={() => setShowOptionsModal(true)}>
          <Text style={styles.buttonText}>Gérer les options du select box</Text>
        </Button>*/}
      </View>


      {/*  <Modal
        animationType="slide"
        transparent={true}
        visible={showOptionsModal}
        onRequestClose={() => setShowOptionsModal(false)}
        
      >
        <View style={styles.modalView}>
          <View style={styles.modalOpen}>

          
          <Text style={styles.modalTitle}>Gérer les options du select box</Text>
          {dynamicOptions.map((option, index) => (
            <View key={index} style={styles.optionContainer}>
              <Text>{option.label} ({option.value})</Text>
              <TouchableOpacity onPress={() => removeOption(index)}>
                <Text style={styles.removeButton}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TextInput
            style={styles.input}
            value={newOptionLabel}
            onChangeText={setNewOptionLabel}
            placeholder="Nouveau label"
          />
          <TextInput
            style={styles.input}
            value={newOptionValue}
            onChangeText={setNewOptionValue}
            placeholder="Nouvelle valeur"
          />

          <View style={{ flex:0.2,flexDirection: "row", justifyContent: "space-around", gap: 10, marginHorizontal: 5, marginVertical: 10 }}>
          <Button flex={1} gradient={gradients.success} style={styles.button} onPress={addOption}>
            <Text style={styles.buttonText}>Ajouter une option</Text>
          </Button>
          <Button flex={1} gradient={gradients.danger} style={styles.button} onPress={() => setShowOptionsModal(false)}>
            <Text style={styles.buttonText}>Fermer</Text>
          </Button>
          </View>
          
          </View>
        </View>
      
      </Modal>*/}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    marginHorizontal: 15,
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 10,
  },
  input: {




  },
  picker: {
   
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
  },
  buttonContainer: {
    marginTop: 10,
    marginHorizontal: 40
  },
  button: {



    marginBottom: 5,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "white",
  },
  modalView: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',

  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  removeButton: {
    color: 'red',
  },
  modalOpen: {
    margin: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row', // Arrange children horizontally
    alignItems: 'center',  // Vertically center children
    justifyContent: 'space-between', // Space out children evenly
    width: '100%', // Make the View take up the full button width
  },
  centerText: {
    textAlign: 'center', // Center the text horizontally
    flex: 1, // Allow the text to expand and take up available space
  },
});

export default Form5;