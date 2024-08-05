import React, {useCallback, useState, useContext, useEffect} from 'react';

import { FlatList, View } from 'react-native';

import {useData, useTheme} from '../hooks/';
import {Block, Button, Image, Input, Product, Text} from '../components/';
import {IArticle, ICategory} from '../constants/types';

import { AuthContext } from '../context/AuthContext';

import _ from 'lodash';

const Home = () => {
  // const {t} = useTranslation();
  const data = useData();
  const [selected, setSelected] = useState<ICategory>();
  const [tab, setTab] = useState<number>(0);
  const {following, trending} = useData();
  const [products, setProducts] = useState(following);
  const {assets, colors, fonts, gradients, sizes} = useTheme();
  const {isloading, location, userdata, usertoken, setUserData, getUserData} = useContext(AuthContext);

  const [keyword, setKeyword] = useState('');
  const [InputValue, setInputValue] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categories, setCategories] = useState<ICategory[]>([]);

  const handleProducts = useCallback(
    (tab: number) => {
      setTab(tab);
      setProducts(tab === 0 ? following : trending);
    },
    [following, trending, setTab, setProducts],
  );

  useEffect(() => {
    setCategories(data?.categories);
    setSelected(data?.categories[0]);
  }, [data.categories]);

  useEffect(() => {

    const category = data?.categories?.find(
      (category) => category?.id === selected?.id,
    );

    if (Array.isArray(userdata?.newevts)) {
      const filteredEvents = userdata.newevts.filter((event: any) => {
        // event.evt.toLowerCase().includes(keyword.toLowerCase())
        const eventEvt = event.evt ? event.evt.toString().toLowerCase() : '';
        const keywordLower = keyword.toString().toLowerCase();
        return eventEvt.includes(keywordLower);
      }
      );
      setFilteredEvents(filteredEvents);
    } else {
      setFilteredEvents([]);
    }
  }, [keyword, userdata?.newevts]);

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
            const isSelected = category?.id === selected?.id;
            return (
              <Button
                radius={sizes.m}
                marginHorizontal={sizes.s}
                key={`category-${category?.id}}`}
                onPress={() => setSelected(category)}
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
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={{ fontWeight: 'bold', paddingHorizontal: 10, fontSize: 13 }}>{(item as any).evt}</Text>
            )}
          />
      </View>
    </Block>
  );
};

export default Home;
