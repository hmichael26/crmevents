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
  const [categories, setCategories] = useState<ICategory[]>([])
  const [active, setActive] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [projectsData, setProjectsData] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(false)

  // Ref pour éviter les appels multiples
  const isFetching = useRef(false)
  const lastFetchTime = useRef(0)
  const isInitialLoad = useRef(true)
  const lastFocusTime = useRef(0)
  const FETCH_COOLDOWN = 1500 // 1.5 secondes de cooldown entre les appels
  const FOCUS_COOLDOWN = 3000 // 3 secondes de cooldown pour les focus

  // Fonction pour récupérer les projets avec protection contre les appels multiples
  const fetchProjects = useCallback(
    async (force = false) => {
      const now = Date.now()

      // Vérifier si un appel est déjà en cours
      if (isFetching.current && !force) {
        console.log('Fetch déjà en cours, abandon')
        return
      }

      // Vérifier le cooldown (sauf si forcé ou premier chargement)
      if (
        !force &&
        !isInitialLoad.current &&
        now - lastFetchTime.current < FETCH_COOLDOWN
      ) {
        console.log('Cooldown actif, abandon')
        return
      }

      isFetching.current = true
      lastFetchTime.current = now
      setLoadingProjects(true)

      try {
        const response = await getProjetcs()
        //   console.log('Données récupérées:', response.data.newevts)
        setProjectsData(response.data.newevts)
        isInitialLoad.current = false
      } catch (error) {
        console.error('Erreur lors du fetch:', error)
        Alert.alert(
          'Erreur',
          'Impossible de récupérer les données. Veuillez réessayer.',
          [{ text: 'OK' }],
        )
      } finally {
        setLoadingProjects(false)
        isFetching.current = false
      }
    },
    [getProjetcs],
  )

  // Utiliser useFocusEffect avec un cooldown pour éviter les refresh sur les changements d'état
  useFocusEffect(
    useCallback(() => {
      const now = Date.now()

      // Premier chargement ou vraie navigation (après un certain délai)
      if (
        isInitialLoad.current ||
        now - lastFocusTime.current > FOCUS_COOLDOWN
      ) {
        console.log('Screen focused, fetching projects...')
        lastFocusTime.current = now
        fetchProjects()
      } else {
        console.log("Focus ignoré - changement d'état local")
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
    setCategories(data?.categories)
    setSelectedCategory(data?.categories[0])
  }, [data.categories])

  useEffect(() => {
    if (Array.isArray(projectsData) && projectsData.length > 0) {
      const filteredEvents = projectsData.filter((event: any) => {
        const eventEvt = event.evt ? event.evt.toString().toLowerCase() : ''
        const eventEnt = event.ent ? event.ent.toString().toLowerCase() : ''
        const keywordLower = keyword.toString().toLowerCase()

        const matchesKeyword =
          eventEvt.includes(keywordLower) || eventEnt.includes(keywordLower)
        const matchesCategory = selectedCategory
          ? event.type == selectedCategory.id
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
      { cancelable: true },
    )
  }

  // Fonction pour gérer le refresh manuel
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await fetchProjects(true) // Forcer le refresh
    } catch (error) {
      console.error('Erreur lors du refresh:', error)
      Alert.alert(
        'Erreur',
        'Impossible de rafraîchir les données. Veuillez réessayer.',
        [{ text: 'OK' }],
      )
    } finally {
      setRefreshing(false)
    }
  }, [fetchProjects])

  const newEvents =
    projectsData.length > 0 ? projectsData : userdata?.newevts || []

  const handleTextChange = _.throttle((event) => {
    const text = event.nativeEvent.text
    setKeyword(text)
    console.log('keyword' + text)
    setInputValue(text)
  }, 3300)

  if (userdata?.user?.admin == 0) {
    return (
      <FlatList
        data={newEvents}
        showsVerticalScrollIndicator={true}
        keyExtractor={(item, index) => index.toString()}
        style={{ paddingVertical: sizes.padding }}
        contentContainerStyle={{ paddingBottom: sizes.l }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loadingProjects}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <EventCard item={item} navigation={navigation} />
          </View>
        )}
      />
    )
  }

  return (
    <Block>
      {/* search input */}
      <Block color={colors.card} flex={0} padding={sizes.padding}>
        <Input
          search
          value={InputValue}
          onChange={handleTextChange}
          placeholder={i18n.t('common.search')}
        />
      </Block>

      {/* categories list */}
      <Block color={colors.card} row flex={0} paddingVertical={sizes.padding}>
        <Block
          scroll
          horizontal
          renderToHardwareTextureAndroid
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
          data={filteredEvents}
          showsVerticalScrollIndicator={true}
          keyExtractor={(item, index) => index.toString()}
          style={{ paddingHorizontal: sizes.padding }}
          contentContainerStyle={{ paddingBottom: 180 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || loadingProjects}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <TouchableWithoutFeedback onPress={() => goToEvtsScreen(item)}>
              <Block card padding={sizes.sm} marginTop={sizes.sm}>
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 10,
                    }}
                  >
                    <Image
                      source={{
                        uri:
                          'https://www.goseminaire.com/crm/upload/' +
                          (item as any).logo,
                      }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        overflow: 'hidden',
                        marginRight: 10,
                      }}
                      resizeMode="cover"
                    />
                    <Text style={{ fontWeight: 'bold', fontSize: 13 }}>
                      {(item as any).ent}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      paddingHorizontal: 10,
                      fontSize: 13,
                    }}
                  >
                    {(item as any).evt}
                  </Text>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      paddingHorizontal: 10,
                      fontSize: 13,
                    }}
                  >
                    {(item as any).com} - Ref : {(item as any).ref}
                  </Text>

                  <Text
                    style={{
                      fontWeight: 'bold',
                      paddingHorizontal: 10,
                      fontSize: 13,
                    }}
                  >
                    {(item as any).clt}
                  </Text>
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
