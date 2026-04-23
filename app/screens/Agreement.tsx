import React from 'react';
import {Block, Text} from '../components/';
import {useTheme} from '../hooks/';
import {useTranslation} from 'react-i18next';

const Agreement = () => {
  const {sizes} = useTheme();
  const {t} = useTranslation();

  return (
    <Block padding={sizes.padding} marginBottom={sizes.sm}>
      <Block
        card
        scroll
        paddingHorizontal={sizes.sm}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingVertical: sizes.padding}}>
        <Text h5 marginBottom={sizes.sm} semibold>
          {t('common.agreement.title')}
        </Text>
        <Text p marginBottom={sizes.sm} align="justify">
          {t('common.agreement.content1')}
        </Text>
        <Text p marginBottom={sizes.sm} align="justify">
          {t('common.agreement.content2')}
        </Text>
        <Text p marginBottom={sizes.sm} align="justify">
          {t('common.agreement.content3')}
        </Text>
      </Block>
    </Block>
  );
};

export default Agreement;
