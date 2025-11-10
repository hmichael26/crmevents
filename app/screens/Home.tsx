import React, {
  useCallback,
  useState,
  useContext,
  useEffect,
  useRef,
} from 'react'
import {
  FlatList,
  View,
  Image,
  TouchableWithoutFeedback,
  Alert,
  RefreshControl,
  Text as TextField,
  Platform, // 👈 Ajout pour iOS
} from 'react-native'
import { useData, useTheme } from '../hooks/'
import { Block, Button, Input, Text } from '../components/'
import { ICategory } from '../constants/types'
import { AuthContext } from '../context/AuthContext'
import _ from 'lodash'
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer'
import { useFocusEffect } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { EventCard } from '../components/EventCard'
import { useApi } from '../context/useApi'

const Home = (props: DrawerContentComponentProps) => {
  const { t, i18n } = useTranslation()

  const { getProjetcs } = useApi()
  const { navigation } = props
  const data = useData()
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null,
  )

  const [tab, setTab] = useState<number>(0)
  const { following, trending } = useData()
  const [products, setProducts] = useState(following)
  const { colors, gradients, sizes } = useTheme()
  const {
    isLoading,
    location,
    userdata,
    usertoken,
    setUserData,
    getUserData,
  } = useContext(AuthContext)
  const [keyword, setKeyword] = useState('')
  const [InputValue, setInputValue] = useState('')
  const [filteredEvents, setFilteredEvents] = useState([])
  const [categories, setCategories] = useState<any>([
    {
      id: 5,
      label: 'Nouveau',
      value: 'Nouveau',
      color: '#03a9f5',
      name: 'Nouveau Projet',
    },
    {
      id: 7,
      label: 'A valider',
      value: 'a_valider',
      color: '#404fe9',
      name: 'Devis à Valider',
    },
    {
      id: 1,
      label: 'A affiner',
      value: 'a_affiner',
      color: '#4f37da',
      name: 'Recherche à Affiner',
    },
    {
      id: 3,
      label: 'Envoyé',
      value: 'Envoyer',
      color: '#690ec2',
      name: 'Devis Envoyé',
    },
    { id: 4, label: 'Hot', value: 'Hot', color: '#f025b6', name: 'HOT' },
    {
      id: 6,
      label: 'Gagnés',
      value: 'Conclu',
      color: 'green',
      name: ' Projets Gagnés',
    },
    {
      id: 8,
      label: 'Perdus',
      value: 'Perdu',
      color: '#f025b6',
      name: 'Projets Perdus',
    },
  ])

  const [active, setActive] = useState('')

  // 🔧 FIX 1: Un seul état pour le loading
  const [refreshing, setRefreshing] = useState(false)
  const [projectsData, setProjectsData] = useState([])

  // 🔧 FIX 2: Ajout d'un état pour forcer le re-render sur iOS
  const [refreshKey, setRefreshKey] = useState(0)

  // Ref pour éviter les appels multiples
  const isFetching = useRef(false)
  const lastFetchTime = useRef(0)
  const isInitialLoad = useRef(true)
  const lastFocusTime = useRef(0)
  const FETCH_COOLDOWN = 1500
  const FOCUS_COOLDOWN = 3000

  // 🔧 FIX 3: Fonction helper pour arrêter le loading proprement
  const stopLoading = useCallback(() => {
    setRefreshing(false)

    // Force re-render sur iOS pour débloquer le loader
    if (Platform.OS === 'ios') {
      setTimeout(() => {
        setRefreshKey((prev) => prev + 1)
      }, 100)
    }
  }, [])

  // 🔧 FIX 4: Fonction de fetch améliorée avec gestion d'erreur robuste
  const fetchProjects = useCallback(
    async (force = false) => {
      const now = Date.now()

      if (isFetching.current && !force) {
        //  console.log('Fetch déjà en cours, abandon')
        return
      }

      if (
        !force &&
        !isInitialLoad.current &&
        now - lastFetchTime.current < FETCH_COOLDOWN
      ) {
        //  console.log('Cooldown actif, abandon')
        return
      }

      isFetching.current = true
      lastFetchTime.current = now

      // 🔧 Important: un seul setState pour le loading
      setRefreshing(true)

      try {
        const response = await getProjetcs()
        setProjectsData(response.data.newevts)
        isInitialLoad.current = false

        // 🔧 FIX 5: Délai pour iOS avant d'arrêter le loader
        if (Platform.OS === 'ios') {
          setTimeout(() => {
            stopLoading()
          }, 300)
        } else {
          stopLoading()
        }
      } catch (error) {
        console.error('Erreur lors du fetch:', error)

        // 🔧 FIX 6: Toujours arrêter le loader même en cas d'erreur
        stopLoading()

        Alert.alert(
          'Erreur',
          'Impossible de récupérer les données. Veuillez réessayer.',
          [{ text: 'OK' }],
        )
      } finally {
        // 🔧 FIX 7: Nettoyage robuste
        isFetching.current = false

        // Double sécurité: arrêter le loader après un délai max
        setTimeout(() => {
          if (refreshing) {
            //  console.log('Force stop loading après timeout')
            stopLoading()
          }
        }, 5000) // 5 secondes max
      }
    },
    [getProjetcs, refreshing, stopLoading],
  )

  // Utiliser useFocusEffect avec un cooldown
  useFocusEffect(
    useCallback(() => {
      const now = Date.now()

      if (
        isInitialLoad.current ||
        now - lastFocusTime.current > FOCUS_COOLDOWN
      ) {
        //     console.log('Screen focused, fetching projects...')
        lastFocusTime.current = now
        fetchProjects()
      } else {
        // console.log("Focus ignoré - changement d'état local")
      }
    }, [fetchProjects]),
  )

  const handleProducts = useCallback(
    (tab: number) => {
      setTab(tab)
      setProducts(tab === 0 ? following : trending)
    },
    [following, trending, setTab, setProducts],
  )

  useEffect(() => {
    setSelectedCategory(categories[0])
  }, [categories])

  //console.log(projectsData)
  useEffect(() => {
    if (Array.isArray(projectsData) && projectsData.length > 0) {
      const filteredEvents = projectsData.filter((event: any) => {
        const eventEvt = event.evt ? event.evt.toString().toLowerCase() : ''
        const eventEnt = event.ent ? event.ent.toString().toLowerCase() : ''
        const keywordLower = keyword.toString().toLowerCase()

        const matchesKeyword =
          eventEvt.includes(keywordLower) || eventEnt.includes(keywordLower)
        const matchesCategory = selectedCategory
          ? event.type == selectedCategory.value
          : true

        return matchesKeyword && matchesCategory
      })

      setFilteredEvents(filteredEvents)
    } else {
      setFilteredEvents([])
    }
  }, [keyword, projectsData, selectedCategory])

  const handleNavigation = useCallback(
    (to: string, item: any) => {
      setActive(to)
      navigation.navigate(to, { item })
    },
    [navigation, setActive],
  )

  const goToEvtsScreen = (item: any) => {
    Alert.alert(
      'Confirmation',
      'Souhaitez-vous ouvrir ce projet ? ',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            const isActive = active === 'EventMenu'
            handleNavigation('EventMenu', item)
          },
        },
      ],
      { cancelable: true, userInterfaceStyle: 'light' },
    )
  }

  // 🔧 FIX 8: Fonction de refresh simplifiée
  const onRefresh = useCallback(async () => {
    console.log('Manual refresh triggered')
    await fetchProjects(true)
  }, [fetchProjects])

  const newEvents =
    projectsData.length > 0 ? projectsData : userdata?.newevts || []

  const handleTextChange = _.throttle((event) => {
    const text = event.nativeEvent.text
    setKeyword(text)
    console.log('keyword' + text)
    setInputValue(text)
  }, 3300)

  // 🔧 FIX 9: RefreshControl avec configuration iOS optimisée
  const refreshControlProps = {
    refreshing: refreshing,
    onRefresh: onRefresh,
    colors: [colors.primary],
    tintColor: colors.primary,
    // Options spécifiques iOS
    ...(Platform.OS === 'ios' && {
      title: 'Actualisation...',
      titleColor: colors.primary,
    }),
  }

  if (userdata?.user?.admin == 0) {
    if (Array.isArray(projectsData) && projectsData.length > 0) {
      return (
        <FlatList
          key={refreshKey} // 🔧 Force re-render sur iOS
          data={newEvents}
          showsVerticalScrollIndicator={true}
          keyExtractor={(item, index) => index.toString()}
          style={{ paddingVertical: sizes.padding }}
          contentContainerStyle={{ paddingBottom: sizes.l }}
          refreshControl={<RefreshControl {...refreshControlProps} />}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <EventCard item={item} navigation={navigation} />
            </View>
          )}
        />
      )
    } else {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
          }}
        >
          <Text size={16}>Aucun projet à afficher</Text>
        </View>
      )
    }
  }

  return (
    <Block>
      {/* search input */}
      <Block color={colors.card} flex={0} padding={sizes.padding}>
        <Input
          search
          value={InputValue}
          onChange={handleTextChange}
          placeholder={'Nom de projet'}
        />
      </Block>

      {/* categories list */}
      <Block color={colors.card} row flex={0} paddingVertical={sizes.padding}>
        <Block
          scroll
          horizontal
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: -sizes.padding, y: 0 }}
        >
          {categories?.map((category) => {
            const isSelected = category?.id === selectedCategory?.id
            return (
              <Button
                radius={sizes.m}
                marginHorizontal={sizes.s}
                key={`category-${category?.id}}`}
                onPress={() => setSelectedCategory(category)}
                gradient={gradients?.[isSelected ? 'primary' : 'light']}
              >
                <Text
                  p
                  bold={isSelected}
                  white={isSelected}
                  black={!isSelected}
                  transform="capitalize"
                  marginHorizontal={sizes.m}
                >
                  {category?.name}
                </Text>
              </Button>
            )
          })}
        </Block>
      </Block>

      {/* products list */}
      <View>
        <FlatList
          key={refreshKey} // 🔧 Force re-render sur iOS
          data={filteredEvents}
          showsVerticalScrollIndicator={true}
          keyExtractor={(item, index) => index.toString()}
          style={{ paddingHorizontal: sizes.padding }}
          contentContainerStyle={{ paddingBottom: 180 }}
          refreshControl={<RefreshControl {...refreshControlProps} />}
          renderItem={({ item }) => (
            <TouchableWithoutFeedback onPress={() => goToEvtsScreen(item)}>
              <Block card padding={20} marginTop={sizes.sm}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'column',
                      alignItems: 'start',
                      gap: 5,
                    }}
                  >
                    <TextField style={{ fontWeight: 'bold', fontSize: 30 }}>
                      {(item as any).ent}
                    </TextField>

                    <TextField style={{ fontSize: 12 }}>
                      {(item as any).evt}
                    </TextField>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        gap: 10,
                      }}
                    >
                      <TextField style={{ fontSize: 13 }}>
                        {(item as any).com}
                      </TextField>

                      <TextField
                        style={{
                          paddingHorizontal: 20,
                          fontSize: 13,
                        }}
                      >
                        Ref :
                        <TextField
                          style={{
                            fontSize: 13,
                            color: '#FF3B30',
                          }}
                        >
                          {(item as any).ref}
                        </TextField>
                      </TextField>
                    </View>

                    <TextField style={{ fontSize: 13 }}>
                      {(item as any).clt}
                    </TextField>
                  </View>
                  <Image
                    source={{
                      uri:
                        'https://www.goseminaire.com/crm/upload/' +
                        (item as any).logo,
                    }}
                    style={{
                      width: 125,
                      height: 125,
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}
                    resizeMode="contain"
                  />
                </View>
              </Block>
            </TouchableWithoutFeedback>
          )}
        />
      </View>
    </Block>
  )
}

export default Home
