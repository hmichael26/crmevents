import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const ConditionalPicker = ({ initialData }) => {

    console.log(initialData);
    const [selectedValue, setSelectedValue] = useState('');

    const options = [
        { id: '1', label: 'oui' },
        { id: '2', label: 'non' },
        { id: '3', label: 'supprimer' },
    ];

    useEffect(() => {
        // Si valid est 1, on présélectionne "oui"
        if (initialData?.valid === 1) {
            setSelectedValue('oui');
        }
    }, [initialData]);

    return (
        <View>
            <Picker
                style={{ width: "10%", marginLeft: 5 }}
                selectedValue={selectedValue}
                onValueChange={(itemValue) => setSelectedValue(itemValue)}

            >
                {options.map((option, index) => (
                    <Picker.Item
                        key={option.id}
                        label={option.label}
                        value={option.label}
                    />
                ))}
            </Picker>
        </View>
    );
};

export default ConditionalPicker;