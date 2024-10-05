// Client/components/shared/LanguagesButton.jsx

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import CountryFlag from "react-native-country-flag";
import tw from 'twrnc';
import { useThemeColor } from '../../hooks/useThemeColor';

const LanguagesButton = ({twStyles, unselectedOpacity, text}) => {
  const textColor = useThemeColor({}, 'text');

  const { language, Texts, toggleLanguage } = useLanguage();

  const flags = [
    { isoCode: 'us', isSelected: language === 'en', langCode: 'en' },
    { isoCode: 'es', isSelected: language === 'es', langCode: 'es' },
  ];
  const sortedFlags = flags.sort((a, b) => b.isSelected - a.isSelected);

  const handleFlagClick = (langCode) => {
    if (language !== langCode) {
      toggleLanguage();
    }
  };

  return (
    <TouchableOpacity style={tw `${twStyles}`} onPress={toggleLanguage}>
      <Text style={tw`text-lg text-[${textColor}]`}>{text}</Text>
      {sortedFlags.map((flag) => (
        <CountryFlag
          key={flag.isoCode}
          isoCode={flag.isoCode}
          size={20}
          style={{ marginLeft: 8, opacity: flag.isSelected ? 1 : unselectedOpacity, cursor: 'pointer' }}
          onClick={() => handleFlagClick(flag.langCode)}
        />
      ))}
    </TouchableOpacity>
  );
};

export default LanguagesButton;