import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  StatusBar,
  Image,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
} from 'react-native';
import {AppColors} from '../theme/AppColors';
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/outline';
import {MapPinIcon} from 'react-native-heroicons/solid';
import {debounce} from 'lodash';
import {fetchLocations, fetchWeatherForecast} from '../api/weather';
import {weatherImages} from '../constants';
import * as Progress from 'react-native-progress';

export default function HomeScreen() {
  const [showSearch, setShowSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  const handleLocation = loc => {
    // console.log('location', loc);
    setLocations([]);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7',
    }).then(data => {
      setWeather(data);
      setLoading(false);
      // console.log('got forecast: ', data);
    });
  };

  const handleSearch = value => {
    // console.log("value", value)
    if (value.length > 2) {
      fetchLocations({cityName: value}).then(data => {
        setLocations(data);
      });
    }
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    fetchWeatherForecast({
      cityName: 'Istanbul',
      days: '7',
    }).then(data => {
      setWeather(data);
      setLoading(false);
    });
  };
  const handleTextDebounce = useCallback(debounce(handleSearch, 1200, []));

  const {current, location} = weather;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        style={styles.backgroundImage}
        blurRadius={5}
        source={require('../assets/images/nightsky.jpg')}
      />
      {loading ? (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {/* <Text style={{color : AppColors.white, fontSize : 30}}>Loading...</Text> */}
          <Progress.CircleSnail
            thickness={10}
            size={150}
            color={AppColors.secondary}
          />
        </View>
      ) : (
        <SafeAreaView style={styles.safeArea}>
          {/* search section */}
          <View style={{marginTop : 20}}>
            <View style={styles.searchContainer}>
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  style={styles.input}
                  placeholder="Search City"
                  placeholderTextColor={AppColors.white}
                />
              ) : null}
              <TouchableOpacity
                onPress={() => setShowSearch(!showSearch)}
                style={styles.button}>
                <MagnifyingGlassIcon size={25} color={AppColors.blue} />
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearch ? (
              <View
                style={{
                  position: 'absolute',
                  width: '100%',
                  top: 45,
                  backgroundColor: AppColors.white,
                  borderRadius: 50,
                  paddingHorizontal: 20,
                }}>
                {locations.map((loc, index) => {
                  let showBorder = index + 1 != locations.length;
                  let borderClass = showBorder ? styles.touchableContainer : '';
                  return (
                    <TouchableOpacity
                      onPress={() => handleLocation(loc)}
                      style={styles.touchableContainer}
                      key={index}>
                      <MapPinIcon color={AppColors.red} />
                      <Text style={styles.explainArea}>
                        {loc?.name}, {loc?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>
          {/* forecast section */}
          <View style={styles.forecastArea}>
            {/* location detail */}
            <Text style={styles.locationDetail}>
              {location?.name},
              <Text
                style={{
                  fontSize: 25,
                  color: AppColors.secondary,
                  fontWeight: 500,
                }}>
                {' ' + location?.country}
              </Text>
            </Text>
            <View style={styles.iconDetail}>
              {/* weather image */}
              <Image
                source={weatherImages[current?.condition?.text]}
                // source={require("../assets/images/partlycloudy.png")}
                style={{width: 190, height: 190}}
              />
            </View>
            {/* degree area */}
            <View style={{marginBottom: 20, gap: 10}}>
              <Text
                style={{
                  fontSize: 60,
                  textAlign: 'center',
                  color: AppColors.secondary,
                  fontWeight: '700',
                }}>
                {current?.temp_c}&#176;
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  textAlign: 'center',
                  color: AppColors.secondary,
                  fontWeight: '700',
                  marginBottom : 30
                }}>
                {current?.condition?.text}
              </Text>
            </View>
            {/* other status */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginHorizontal: 30,
              }}>
              <View
                style={{flexDirection: 'row', gap: 10, alignSelf: 'center'}}>
                <Image
                  style={{height: 30, width: 30}}
                  source={require('../assets/icons/wind.png')}
                />
                <Text style={{color: AppColors.white, alignSelf: 'center', fontWeight: "700"}}>
                  {current?.wind_kph} km
                </Text>
              </View>

              <View
                style={{flexDirection: 'row', gap: 10, alignSelf: 'center'}}>
                <Image
                  style={{height: 30, width: 30}}
                  source={require('../assets/icons/drop.png')}
                />
                <Text style={{color: AppColors.white, alignSelf: 'center',fontWeight: "700"}}>
                  {current?.humidity}%
                </Text>
              </View>

              <View
                style={{flexDirection: 'row', gap: 10, alignSelf: 'center'}}>
                <Image
                  style={{height: 30, width: 30}}
                  source={require('../assets/icons/sun.png')}
                />
                <Text style={{color: AppColors.white, alignSelf: 'center',fontWeight: "700"}}>
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
          </View>
          {/* forecast for next day */}
          <View style={{marginBottom: 6, gap: 3}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 3,
                marginHorizontal: 20,
                marginBottom: 10,
              }}>
              <CalendarDaysIcon size="22" color={AppColors.white} />
              <Text
                style={{
                  color: AppColors.white,
                  textAlign: 'center',
                  fontSize: 16,
                }}>
                Daily Forecast
              </Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={{paddingHorizontal: 15}}
              showsHorizontalScrollIndicator={false}>
              {weather?.forecast?.forecastday?.map((item, index) => {
                let date = new Date(item.date);
                let options = {weekday: 'long'};
                let dayName = date.toLocaleDateString('en-US', options);
                dayName = dayName.split(' ')[0];
                return (
                  <View
                    key={index}
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 90,
                      height: 120,
                      borderRadius: 10,
                      backgroundColor: AppColors.transparent,
                      gap: 8,
                      marginHorizontal: 5,
                    }}>
                    <Image
                      source={weatherImages[item?.day?.condition?.text]}
                      style={{width: 50, height: 50}}
                    />
                    <Text style={{color: AppColors.white}}>{dayName}</Text>
                    <Text
                      style={{
                        color: AppColors.white,
                        fontSize: 17,
                        fontWeight: '700',
                      }}>
                      {item?.day?.avgtemp_c}&#176;
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    objectFit: 'fill',
    height: '100%',
    width: '100%',
  },
  safeArea: {
    flex: 1,
  },
  searchContainer: {
    height: '23%',
    marginHorizontal: 15,
    position: 'relative',
    zIndex: 50,
  },
  input: {
    backgroundColor: AppColors.secondary,
    height: '100%',
    borderRadius: 50,
    paddingLeft: 20,
    opacity: 0.6,
  },
  button: {
    backgroundColor: AppColors.white,
    borderRadius: 50,
    padding: 3,
    margin: 4,
    alignSelf: 'flex-end',
    position: 'absolute'
  },
  touchableContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.secondary,
  },
  explainArea: {
    color: AppColors.primary,
    alignSelf: 'center',
  },
  forecastArea: {
    flex: 1,
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  locationDetail: {
    color: AppColors.white,
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 30,
  },
  iconDetail: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
});
