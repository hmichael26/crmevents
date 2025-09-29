import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '../hooks'

interface Notification {
  id: string
  title: string
  description: string
  actionText?: string
  actionLink?: string
  time: string
  read: boolean
}

interface NotificationsScreenProps {
  navigation: any
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  navigation,
}) => {
  const { colors } = useTheme()
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Your request for vacuum cleaner is accepted',
      description: 'Continue with the payment to rent the item.',
      actionText: 'Go to payment',
      actionLink: 'Payment',
      time: '2 Hours ago',
      read: false,
    },
    {
      id: '2',
      title:
        "Order#234353 is completed from the Owner's side. You get a dispute.",
      description: 'Check-out the inspection list to verify the dispute.',
      actionText: 'Go to check-out list',
      actionLink: 'CheckoutList',
      time: '2 Hours ago',
      read: false,
    },
    {
      id: '3',
      title: "Order#234353 is completed from the Owner's side.",
      description:
        'Order is completed. Kindly leave your review how was your experience.',
      actionText: 'Leave a Review',
      actionLink: 'Review',
      time: '2 Hours ago',
      read: true,
    },
    {
      id: '4',
      title: 'Received Product Request Offer',
      description: 'Custom request offer received go and check',
      time: '2 Hours ago',
      read: true,
    },
    {
      id: '5',
      title: 'Acceptance for Booking Request',
      description: 'Lorem ipsum is a dummy text',
      time: '2 Hours ago',
      read: true,
    },
  ])

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    )
  }

  const handleActionPress = (actionLink: string) => {
    if (actionLink == 'Payment') {
      console.log('ok')
      navigation.navigate('VerifyChecklist')
    } else {
      navigation.navigate(actionLink)
    }
  }

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationIconContainer}>
        <Feather name="bell" size={18} color={colors.text} />
        {!item.read && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationDescription}>{item.description}</Text>

        <Text style={styles.timeText}>{item.time}</Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Today Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Today</Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={[styles.markAllText, { color: colors.primary }]}>
            Mark all as read
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  markAllText: {
    fontSize: 14,
    color: '#FF3B30',
    textDecorationLine: 'underline',
  },
  notificationsList: {
    paddingHorizontal: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  actionLink: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
    marginBottom: 4,
    textDecorationLine: 'underline',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingVertical: 8,
    backgroundColor: '#FFF',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    flex: 1,
  },
  navText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
})

export default NotificationsScreen
