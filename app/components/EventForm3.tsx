import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Dimensions, KeyboardAvoidingView, TouchableOpacity, Text } from 'react-native';
import { SwitchTextBox, TextInputWithIcon } from './TextInputWithIcon';
import MultiSelect from './MultiSelectBox';
import { useTheme } from '../hooks';
import Switch from './Switch';

// import { Container } from './styles';
const options = [
  { id: '1', label: 'Option 1' },
  { id: '2', label: 'Option 2' },
  { id: '3', label: 'Option 3' },
  // Add more options as needed
];
const { width, height } = Dimensions.get('window');

type Form3Props = {
  item: any;
  onDataChange: (data: any, type: string) => void;

};

type FormData = {
  idevt?: Number;
  commission_10?: boolean;
  commission_12?: boolean;
  commission_15?: boolean;
};

const Form3: React.FC<Form3Props> = ({ item, onDataChange }) => {

  const { assets, colors, gradients, sizes } = useTheme();
  const [switch1, setSwitch1] = useState(item?.commission_10);
  const [switch2, setSwitch2] = useState(item?.commission_12);
  const [switch3, setSwitch3] = useState(item?.commission_15);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({

    commission_10: item.commission_10,
    commission_12: item.commission_12,
    commission_15: item.commission_15,
  });

  //console.log(formData, "c'est le form data")
  useEffect(() => {
    onDataChange(formData, 'form3');
  }, [formData]);

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedOptions(selectedIds);
  };

  const updateFormField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };





  return <View style={styles.container}>


    <Text style={{ fontSize: 18, fontWeight: "bold", textAlign: 'center', color: colors.primary, flexWrap: "wrap", marginVertical: 15 }}>Proposition de Commission aux Prestataires</Text>

    <View style={{ flexDirection: "row", alignContent: "center", justifyContent: "space-between", borderColor: "#ccc", borderWidth: 1, padding: 5, borderRadius: 10, marginVertical: 5 }}>
      <Text style={{ fontSize: 17, fontWeight: "bold", marginHorizontal: 10 }}>10% HT sur le Total HT facturé</Text>
      <Switch checked={switch1} onPress={(checked) => { setSwitch1(checked), updateFormField('commission_10', checked) }} />
    </View>
    <View style={{ flexDirection: "row", alignContent: "center", justifyContent: "space-between", borderColor: "#ccc", borderWidth: 1, padding: 5, borderRadius: 10, marginVertical: 5 }}>
      <Text style={{ fontSize: 17, fontWeight: "bold", marginHorizontal: 10 }}>12% HT sur le Total HT facturé</Text>
      <Switch checked={switch2} onPress={(checked) => { setSwitch2(checked), updateFormField('commission_12', checked) }} />
    </View>
    <View style={{ flexDirection: "row", alignContent: "center", justifyContent: "space-between", borderColor: "#ccc", borderWidth: 1, padding: 5, borderRadius: 10, marginVertical: 5 }}>
      <Text style={{ fontSize: 17, fontWeight: "bold", marginHorizontal: 10 }}>15% HT sur le Total HT facturé</Text>
      <Switch checked={switch3} onPress={(checked) => { setSwitch3(checked), updateFormField('commission_15', checked) }} />
    </View>


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
export default Form3;