import React, { useState, useEffect } from 'react';
import { Alert, View } from 'react-native';
import Button from './Button';
import { Picker } from '@react-native-picker/picker';
import Text from './Text';
import { useApi } from '../context/useApi';
import ConfirmationModal from './ConfirmModal';

const DevisInterface = ({
    activeBadgeData,
    gradients,
    sizes,
    getFontSize,
    openDevis,
}) => {
    const [devisSelections, setDevisSelections] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalVisible2, setModalVisible2] = useState(false);

    const { validdevis } = useApi();
    const options = [
        { id: '1', label: 'oui' },
        { id: '2', label: 'non' },
        { id: '3', label: 'supprimer' },
    ];

    useEffect(() => {
        if (!activeBadgeData?.all_devis) return;

        const initialSelections = {};
        activeBadgeData.all_devis.forEach(devis => {
            initialSelections[devis.id_devis] = devis.valid === "1" ? "oui" : devis.valid === "2" ? "non" : "";
        });
        setDevisSelections(initialSelections);
    }, [activeBadgeData]);

    /*  const handleOptionSelect = (devisId, itemValue) => {
          setDevisSelections(prev => ({
              ...prev,
              [devisId]: itemValue
          }));
      };*/

    const updateDevisStatus = async (devisId, status) => {
        setIsSubmitting(true);
        try {
            console.log('Updating status for devis:', devisId, status);



            const response = await validdevis({
                id_devis: devisId,
                valid: status
            });

            /*  if (!response.success) {
                  throw new Error('Failed to update devis status');
              }*/




            setDevisSelections(prev => ({
                ...prev,
                [devisId]: status
            }));

            Alert.alert(
                "Confirmation",
                "Votre devis a été mis à jour avec succès",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            // TODO: Handle success state
                            console.log('Devis updated successfully:', response);
                        }
                    }
                ],
                { cancelable: false }
            );


            // TODO: Handle success state
            console.log('Devis updated successfully:', response);
        } catch (error) {
            console.error('Error updating devis:', error);
            // Revert selection on error
            setDevisSelections(prev => ({
                ...prev,
                [devisId]: prev[devisId]
            }));
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleOptionSelect = (devisId, itemValue) => {
        if (itemValue === 'supprimer') {
            setModalVisible2(true);
            return;
        }
        updateDevisStatus(devisId, itemValue);
    };

    return (
        <>
            {activeBadgeData?.all_devis && activeBadgeData.all_devis.length > 0 &&
                activeBadgeData.all_devis.map((item, index) => (
                    <View
                        key={item.id_devis || index}
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            marginHorizontal: 5,
                            marginTop: 5
                        }}
                    >
                        <Button
                            flex={1}
                            gradient={gradients.info}
                            marginBottom={sizes.base / 2}
                            rounded={false}
                            round={false}
                            onPress={() => openDevis(item.lien_devis)}
                        >
                            <Text
                                white
                                size={getFontSize(13)}
                                bold
                                style={{ textTransform: 'uppercase' }}
                            >
                                ouvrir
                            </Text>
                            <Text
                                white
                                size={getFontSize(13)}
                                bold
                                style={{ textTransform: 'uppercase' }}
                            >
                                devis {index + 1}
                            </Text>
                        </Button>

                        <View style={{
                            flex: 1,
                            flexDirection: "row",
                            width: "100%",
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: "#ccc",
                            paddingHorizontal: 1,
                            borderRadius: 10,
                            marginBottom: 5,
                            height: getFontSize(48)
                        }}>
                            <Text
                                black
                                bold
                                size={getFontSize(12)}
                                style={{
                                    width: '75%',
                                    marginLeft: 6,
                                    textAlign: "center"
                                }}
                            >
                                {devisSelections[item.id_devis] || 'valider'}
                            </Text>

                            <Picker
                                style={{ width: "10%", marginLeft: 5 }}
                                selectedValue={devisSelections[item.id_devis]}
                                onValueChange={(itemValue) => handleOptionSelect(item.id_devis, itemValue)}
                            >
                                {options.map((option) => (
                                    <Picker.Item
                                        key={option.id}
                                        label={option.label}
                                        value={option.label}
                                    />
                                ))}
                            </Picker>
                        </View>
                        <ConfirmationModal
                            visible={modalVisible2}
                            onClose={() => setModalVisible2(false)}
                            onConfirm={() => handleOptionSelect(item.id_devis, 'supprimer')}
                            onCancel={() => setModalVisible2(false)}
                            message={`Voulez-vous vraiment supprimer ce devis ?`}
                        />
                    </View>
                ))

            }

        </>
    );
};

export default DevisInterface;