import React, { useState, useEffect } from 'react';
import { Alert, View } from 'react-native';
import Button from './Button';
import { Picker } from '@react-native-picker/picker';
import Text from './Text';
import { useApi } from '../context/useApi';
import ConfirmationModal from './ConfirmModal';
import Dropdown from './Dropdown';

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
    const [selectedDevisId, setSelectedDevisId] = useState(null);

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

    console.log(devisSelections)

    const updateDevisStatus = async (devisId, status) => {
        setIsSubmitting(true);
        try {
            const response = await validdevis({ id_devis: devisId, valid: status });
            setDevisSelections(prev => ({ ...prev, [devisId]: status }));
            Alert.alert("Confirmation", "Votre devis a été mis à jour avec succès");
        } catch (error) {
            console.error('Erreur lors de la mise à jour du devis:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOptionSelect = (devisId, itemValue) => {
        if (itemValue === 'supprimer') {
            setSelectedDevisId(devisId);
            setModalVisible2(true); // Ouvre la modale pour demander confirmation
        } else {
            updateDevisStatus(devisId, itemValue);
        }
    };

    const confirmDeletion = () => {
        if (selectedDevisId) {
            updateDevisStatus(selectedDevisId, 'supprimer');
            setModalVisible2(false);
        }
    };

    return (
        <>
            {activeBadgeData?.all_devis &&
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
                            marginTop: 5,
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
                            <Text white size={getFontSize(13)} bold style={{ textTransform: 'uppercase' }}>
                                ouvrir
                            </Text>
                            <Text white size={getFontSize(12)} bold style={{ textTransform: 'uppercase' }}>
                                devis {index + 1}
                            </Text>
                        </Button>

                        <View style={{
                            flex: 1,
                            flexDirection: "row",
                            width: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1,
                            borderColor: "#ccc",
                            paddingHorizontal: 1,
                            borderRadius: 10,
                            marginBottom: 5,
                            height: getFontSize(48),
                        }}>
                            <Dropdown
                                data={options}
                                onChange={(item) => handleOptionSelect(item.id_devis, item.label)}
                                placeholder="valider"
                                defaultValue={{ [item.id_devis]: devisSelections[item.id_devis] }}
                            />
                        </View>
                    </View>
                ))
            }
            <ConfirmationModal
                visible={modalVisible2}
                onClose={() => setModalVisible2(false)}
                onConfirm={confirmDeletion}
                message="Voulez-vous vraiment supprimer ce devis ?"
                onCancel={() => setModalVisible2(false)}
            />
        </>
    );
};


export default DevisInterface;