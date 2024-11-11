import React, {useCallback, useState, useContext, useEffect} from 'react';
import { FlatList, View, Image, TouchableWithoutFeedback, Alert } from 'react-native';
import {useData, useTheme} from '../hooks/';
import {Block, Button, Input, Text} from '../components/';
import {ICategory} from '../constants/types';
import { AuthContext } from '../context/AuthContext';
// import EventDetails from './EventDetails';
import _ from 'lodash';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';

//const Home = () => {
const Home = (props: DrawerContentComponentProps) => {
  const { navigation } = props;
  const data = useData();
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);
  const [tab, setTab] = useState<number>(0);
  const {following, trending} = useData();
  const [products, setProducts] = useState(following);
  const {colors, gradients, sizes} = useTheme();
  const {isloading, location, userdata, usertoken, setUserData, getUserData} = useContext(AuthContext);
  const [keyword, setKeyword] = useState('');
  const [InputValue, setInputValue] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [active, setActive] = useState('');

  const handleProducts = useCallback(
    (tab: number) => {
      setTab(tab);
      setProducts(tab === 0 ? following : trending);
    },
    [following, trending, setTab, setProducts],
  );

  useEffect(() => {
    setCategories(data?.categories);
    setSelectedCategory(data?.categories[0]);
  }, [data.categories]);

  useEffect(() => {
    if (Array.isArray(userdata?.newevts)) {
      const filteredEvents = userdata.newevts.filter((event: any) => {
        const eventEvt = event.evt ? event.evt.toString().toLowerCase() : '';
        const eventEnt = event.ent ? event.ent.toString().toLowerCase() : '';
        const keywordLower = keyword.toString().toLowerCase();

        const matchesKeyword = eventEvt.includes(keywordLower) || eventEnt.includes(keywordLower);
        const matchesCategory = selectedCategory ? event.type == selectedCategory.id : true;

        return matchesKeyword && matchesCategory;
      });

      setFilteredEvents(filteredEvents);
    } else {
      setFilteredEvents([]);
    }
  }, [keyword, userdata?.newevts, selectedCategory]);

  const handleNavigation = useCallback(
    (to: string, item: any) => {
      setActive(to);
      navigation.navigate(to, { item }); // Passer l'item dans la navigation
    },
    [navigation, setActive],
  );

  const goToEvtsScreen = (item: any) => {
    Alert.alert(
      "Confirmation",
      "Souhaitez-vous ouvrir ce projet ? ",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => {
            // const isActive = active === 'Eventdetails';
            // handleNavigation('Eventdetails', item);
            const isActive = active === 'EventMenu';
            handleNavigation('EventMenu', item);
          }
        }
      ],
      { cancelable: true }
    );
  };

  const handleTextChange = _.throttle((event) => {
    const text = event.nativeEvent.text;
    setKeyword(text);
    console.log('keyword' + text);
    setInputValue(text);
  }, 3300);

  return (
    <Block>
      {/* search input */}
      <Block color={colors.card} flex={0} padding={sizes.padding}>
        <Input search value={InputValue} onChange={handleTextChange} placeholder={"t('common.search')"} />
      </Block>

      {/* toggle products list */}
      {/* categories list */}
      <Block color={colors.card} row flex={0} paddingVertical={sizes.padding}>
        <Block
          scroll
          horizontal
          renderToHardwareTextureAndroid
          showsHorizontalScrollIndicator={false}
          contentOffset={{x: -sizes.padding, y: 0}}>
          {categories?.map((category) => {
            const isSelected = category?.id === selectedCategory?.id;
            return (
              <Button
                radius={sizes.m}
                marginHorizontal={sizes.s}
                key={`category-${category?.id}}`}
                onPress={() => setSelectedCategory(category)}
                gradient={gradients?.[isSelected ? 'primary' : 'light']}>
                <Text
                  p
                  bold={isSelected}
                  white={isSelected}
                  black={!isSelected}
                  transform="capitalize"
                  marginHorizontal={sizes.m}>
                  {category?.name}
                </Text>
              </Button>
            );
          })}
        </Block>
      </Block>

      {/* products list */}
      <View>
        <FlatList
          data={filteredEvents}
          showsVerticalScrollIndicator={true}
          keyExtractor={(item, index) => index.toString()}
          style={{paddingHorizontal: sizes.padding}}
          contentContainerStyle={{paddingBottom: sizes.l}}
          renderItem={({ item }) => (
            <TouchableWithoutFeedback onPress={() => goToEvtsScreen(item)}>
            <Block card padding={sizes.sm} marginTop={sizes.sm}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }}>
                <Image 
                  source={{ uri: 'https://www.goseminaire.com/crm/upload/'+ (item as any).logo }}// Afficher l'image du logo
                  style={{ 
                    width: 40,  // Taille de l'image (largeur)
                    height: 40,  // Taille de l'image (hauteur)
                    borderRadius: 20,  // Rend l'image circulaire (la moitié de la taille)
                    overflow: 'hidden',  // S'assure que l'image est coupée au bord
                    marginRight: 10,  // Espace entre l'image et le texte
                  }}
                  resizeMode="cover"  // Garde l'image proportionnée tout en remplissant le contour
                />
                <Text style={{ fontWeight: 'bold', fontSize: 13 }}>
                  {(item as any).ent} - {(item as any).com} - {(item as any).ref}
                </Text>
              </View>
              <Text style={{ fontWeight: 'bold', paddingHorizontal: 10, fontSize: 13 }}>{(item as any).evt}</Text>
              <Text style={{ fontWeight: 'bold', paddingHorizontal: 10, fontSize: 13 }}>{(item as any).clt}</Text>
            </View>
            </Block>
            </TouchableWithoutFeedback>
          )}
        />
      </View>
    </Block>
  );
};

export default Home;
