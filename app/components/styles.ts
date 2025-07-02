import { StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: '#f8f9fa',
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        fontSize: 15,
       
        marginBottom: 5,
        color: '#343a40',
        textTransform: 'uppercase'

    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ced4da',
        padding: 5,
        marginBottom: 5,
        borderRadius: 10,
        backgroundColor: '#fff'
    }, inputGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        marginBottom: 5

    }, label: {
        fontSize: 14,
        marginBottom: 8,
        color: '#666',
    },
    fileUploadButton: {
        flexDirection: 'row',
       // backgroundColor: '#007bff',
        padding: 6,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        width: '90%'
    },
    fileUploadButtonText: {
        color: 'white',
        marginLeft: 10,
        
        fontSize: 14,
        textTransform: 'uppercase',
    },
    fileListContainer: {
        width: '90%',
        maxHeight: 120,
        marginBottom: 15
    },
    fileListContent: {
        paddingBottom: 5
    },
    fileItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        padding: 6,
        borderRadius: 10,
        marginBottom: 5
    },
    fileItemText: {
        flex: 1,
        marginRight: 10,
        color: '#495057'
    },
    fileRemoveButton: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginHorizontal: 20,
       
    },
    button: {
       
        borderRadius: 10,
       
        alignItems: 'center'
    },
    buttonCancel: {
        backgroundColor: '#6c757d'
    },
    buttonSubmit: {
        backgroundColor: '#28a745'
    },
    buttonTextCancel: {
        color: 'white',
       
    },
    buttonTextSubmit: {
        color: 'white',
        fontWeight: 'bold'
    },
    commissionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    commissionButton: {
        backgroundColor: '#e9ecef',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },

    commissionButtonText: {
        color: '#212529',
       
    },
    commentInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 16,
        textAlignVertical: 'top'
    },
    formSection: {
        width: '100%',
        marginBottom: 5,




    },
    sectionTitle: {
        fontSize: 18,
       
        marginBottom: 12,
        color: '#343a40',
    }, hotelNameContainer: {
        backgroundColor: '#B8B8D1',
        borderRadius: 10,
        padding: 10,
        marginVertical: 10,
        marginBottom: 25,
        width: '88%',
    },
    hotelName: {
        color: 'white',
        textAlign: 'center',
        fontSize: 15,
       
    },
});

