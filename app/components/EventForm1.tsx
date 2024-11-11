import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Dimensions, KeyboardAvoidingView, TouchableOpacity, Platform } from 'react-native';
import { SwitchTextBox, TextInputWithIcon } from './TextInputWithIcon';
import MultiSelect from './MultiSelectBox';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
// import { Container } from './styles';
const options = [
  { id: '1', label: 'Congrès' },
  { id: '2', label: 'Incentive' },
  { id: '3', label: 'Convention' },
  // Add more options as needed
];
const { width, height } = Dimensions.get('window');

type Form1Props = {
  item: any;
};

const Form1: React.FC<Form1Props> = ({ item }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedOptions(selectedIds);
  };

  const [date, setDate] = useState(item.date_reception ? new Date(item.date_reception) : new Date());
  const [date2, setDate2] = useState(item.date_deb ? new Date(item.date_deb) : new Date());
  const [date3, setDate3] = useState(item.date_fin ? new Date(item.date_fin) : new Date());

  const [show, setShow] = useState(false);
  const [currentDatePicker, setCurrentDatePicker] = useState<'date' | 'date2' | 'date3'>('date');

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShow(Platform.OS === 'ios');
    switch (currentDatePicker) {
      case 'date':
        setDate(currentDate);
        break;
      case 'date2':
        setDate2(currentDate);
        break;
      case 'date3':
        setDate3(currentDate);
        break;
    }
  };

  const showDatepicker = (datePickerType: 'date' | 'date2' | 'date3') => {
    setCurrentDatePicker(datePickerType);
    setShow(true);
  };


  return <View style={styles.container}>
    <TextInputWithIcon placeholder="Titre de l'Event" value={item.evt} />

    <View style={styles.inputContainer}>

      <TextInputWithIcon

        iconName="calendar"
        placeholder="Date de creation"
        editable={false}
        value={date.toLocaleDateString()}
        style={{ width: "50%" }}
        onPress={() => showDatepicker('date')}

      />


      <TextInputWithIcon
        placeholder="REF Projet : 931"
        style={{ width: "50%" }}
        value={item.ref}
      />
    </View>
    <View style={styles.inputContainer}>
      <TextInputWithIcon
        iconName="mail"
        placeholder="Pax"
        style={{ width: "30%" }}
        value={item.pax}
      />

      <TextInputWithIcon
        placeholder="Zone geographique"
        style={{ width: "70%" }}
        value={item.zone}
      />
    </View>
    <View>
      <MultiSelect
        options={options}
        selectedOptions={selectedOptions}
        onSelectionChange={handleSelectionChange}
      />
    </View>

    <View style={styles.inputContainer}>
      <TextInputWithIcon

        iconName="calendar"
        placeholder="Début"
        editable={false}
        value={date2.toLocaleDateString()}
        style={{ width: "50%" }}
        onPress={() => showDatepicker('date2')}

      />
      <TextInputWithIcon

        iconName="calendar"
        placeholder="Fin"
        editable={false}
        value={date3.toLocaleDateString()}
        style={{ width: "50%" }}
        onPress={() => showDatepicker('date3')}

      />
    </View>
    <View style={styles.inputContainer}>
      <SwitchTextBox
        label="Dates flexibles"
        placeholder="Flexibilite"
        style={{ width: "60%" }}
        onToggle={(value) => console.log('Switch toggled:', value)}
      />
      <TextInputWithIcon

        fonsiName="euro"
        placeholder="Budget"
        style={{ width: "40%" }}
        value={item.budget}

      />

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={
            currentDatePicker === 'date' ? date :
              currentDatePicker === 'date2' ? date2 : date3
          }
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
    </View>


    <TextInputWithIcon


      placeholder="Commentaire pour le prestataire"
      multiline
      numberOfLines={4}
      style={{
        height: 100,
        borderColor: '#ccc',
        borderWidth: 2
      }}
      value={item.commentaires_dates}

    />

    <TextInputWithIcon


      placeholder="Commentaire Personnel"
      multiline
      numberOfLines={4}
      style={{
        height: 100,
        borderColor: '#ccc',
        borderWidth: 2
      }}
      value={item.format}

    />





  </View>;
}


const styles = StyleSheet.create({
  container: {
    padding: 5,
    marginHorizontal: 15,
    flex: 1

  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    height: height * 0.054,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 4,
    marginBottom: 16,
    borderRadius: 10,
    padding: 10,




  },
  inputContainer: {


    flexDirection: 'row',
    justifyContent: 'center', // Espacement égal entre les éléments
    alignItems: 'center',
    paddingHorizontal: 0, // Ajout de marges pour ne pas coller les TextInputs aux bords
    width: "100%",
    gap: 4
  },
  footer: {

    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,

    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 18,
  }, button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    marginVertical: 8,
  },
  buttonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: "center"
  },
})
export default Form1;