import React, { useContext } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { Button } from '../components'
import { useTheme } from '../hooks'
import { AuthContext } from '../context/AuthContext'

interface EventCardProps {
  item: any
  navigation: any
}

export const EventCard: React.FC<EventCardProps> = ({ item, navigation }) => {
  const { userdata } = useContext(AuthContext)

  //console.log(item)

  /* {
      Receiver: `Admin - ${derouleTitle}`,
      chat: {
        idevt: idevt,
        from_user: userdata.user.IDC,
        //iduser2: admin, // Admin ID
        id_deroule: derouleId,
      },*/

  const { colors, gradients, sizes } = useTheme()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{item.evt}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={{
              uri:
                'https://www.goseminaire.com/crm/upload/' + (item as any).logo,
            }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Button gradient={gradients.success} style={styles.infoButton}>
              <Text style={styles.infoText}>pax: {item.pax || 0}</Text>
            </Button>
            {true && (
              <Button gradient={gradients.info} style={styles.statusButton}>
                <Text style={styles.statusText}>Event en cours</Text>
              </Button>
            )}
          </View>
          <View style={styles.infoRow}>
            <Button gradient={gradients.secondary} style={styles.infoButton}>
              <Text style={styles.infoText}>Ref: {item.ref || 'N/A'}</Text>
            </Button>

            <Button
              gradient={gradients.black}
              style={styles.consultButton}
              onPress={() =>
                navigation.navigate('Inbox', {
                  Receiver: `Conseiller pour ${item.evt}`,
                  isForClient: true,
                  chat: {
                    idevt: item.idevt,
                    from_user: userdata.user.IDC,
                    //iduser2: admin, // Admin ID
                    id_deroule: item.idevt,
                  },
                })
              }
            >
              <Text style={styles.consultText}>Chat</Text>
            </Button>
          </View>
          <View style={styles.infoRow}>
            <Button
              gradient={gradients.primary}
              style={styles.consultButton}
              onPress={() => navigation.navigate('ClientPresta', { item })}
            >
              <Text style={styles.consultText}>Consulter</Text>
            </Button>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: 12,
    borderBlockColor: '#8B3D88',

    borderBottomWidth: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '',
    color: '#000',
    textAlign: 'center',
  },
  content: {
    flexDirection: 'row',
    padding: 16,
  },
  logoContainer: {
    marginRight: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: '#E7E1E1FF',
    borderWidth: 0.5,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoButton: {
    flex: 1,
    marginHorizontal: 4,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '',
    textTransform: 'uppercase',
  },
  statusButton: {
    flex: 1,

    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '',
    textTransform: 'uppercase',
  },
  consultButton: {
    flex: 1,

    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  consultText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '',
    textTransform: 'uppercase',
  },
})
