import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { Button } from '../components'
import { useTheme } from '../hooks'

interface EventCardProps {
  item: any
}

export const EventCard: React.FC<EventCardProps> = ({ item }) => {
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
            resizeMode="cover"
          />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Button gradient={gradients.secondary} style={styles.infoButton}>
              <Text style={styles.infoText}>pax: {item.pax || 0}</Text>
            </Button>
            {true && (
              <Button gradient={gradients.primary} style={styles.statusButton}>
                <Text style={styles.statusText}>Event en cours</Text>
              </Button>
            )}
          </View>
          <View style={styles.infoRow}>
            <Button gradient={gradients.secondary} style={styles.infoButton}>
              <Text style={styles.infoText}>Ref: {item.ref || 'N/A'}</Text>
            </Button>

            <Button gradient={gradients.info} style={styles.consultButton}>
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
    backgroundColor: '#8B3D88',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
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
    fontWeight: '500',
  },
  statusButton: {
    flex: 1,

    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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
    fontWeight: '600',
    textTransform: 'uppercase',
  },
})
