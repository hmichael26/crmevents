import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput, FlatList, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useApi } from '../context/useApi';

// Define an interface for Item for better type checking
interface Item {
    id: number;
    nom: string;
}

interface ModalPrestaProps {
    onClose: () => void;
    onSelectItem: (item: Item) => void;
}

const ModalPresta: React.FC<ModalPrestaProps> = ({
    onClose,
    onSelectItem,
}) => {
    const { getPrestaBy } = useApi();
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [selectPresta, setSelectPresta] = useState<any | null>(null);

    const fetchItems = useCallback(async (page: number) => {
        setIsLoading(true);
        try {
            const response = await getPrestaBy({ "current_page": page });
            setItems(response.data.all_prests || []);

            setTotalPages((response.data.nb_tot_presta / 30).toFixed(0));
        } catch (error) {
            console.error("Error loading items:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (modalVisible) {
            fetchItems(currentPage);
        }
    }, [modalVisible, currentPage]);

    const handleSelectItem = (item: Item) => {
        console.log(item);
        setSelectPresta(item);
        onSelectItem(item);
        setModalVisible(false);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(current => current + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(current => current - 1);
        }
    };

    return (
        <View>
            <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setModalVisible(true)}
            >



                <Text style={styles.clientName}>
                    {selectPresta ? selectPresta.nom : "Select Prestataire"}
                </Text>


            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    onClose();
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {isLoading ? (
                            <Text>Loading...</Text>
                        ) : (
                            <>
                                <View style={styles.searchContainer}>
                                    <Icon name="search" color="#666" size={20} />
                                    <TextInput
                                        placeholder="Search for a provider"
                                        style={styles.searchInput}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                </View>
                                <FlatList
                                    data={items}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => handleSelectItem(item)}
                                            style={styles.itemContainer}
                                        >
                                            <Text style={styles.itemName}>{item.nom}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                                <View style={styles.paginationContainer}>
                                    <Button title="Prev" onPress={handlePreviousPage} disabled={currentPage <= 1} />
                                    <Text>{currentPage} of {totalPages}</Text>
                                    <Button title="Next" onPress={handleNextPage} disabled={currentPage >= totalPages} />
                                </View>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.closeButtonText}>Close</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',

        borderColor: '#ccc',
        borderRadius: 10,
        padding: 15,
        backgroundColor: 'white',
    }, itemContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    inputText: {
        marginLeft: 10,
        color: '#666',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        padding: 10,
    },
    clientItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    clientItemDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    clientTextContainer: {
        marginLeft: 15,
    },
    clientName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    clientSubtitle: {
        color: '#666',
        fontSize: 14,
    },
    clientActions: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 15,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: '#666',
    },
    closeButton: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    closeButtonText: {
        fontWeight: 'bold',
        color: '#333',
    },
});

export default ModalPresta;
