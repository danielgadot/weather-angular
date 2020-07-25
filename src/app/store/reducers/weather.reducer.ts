import { Action, createReducer, on } from '@ngrx/store';
import * as WeatherActions from '../actions/weather.actions';
import { CityWeather } from '../../models/city-weather.model';

interface Weather {
  weather?: any;
}
interface CurrentCity {
  id: number;
  name: string;
  weather: any;
}

export interface State extends Weather {
    currentCityWeather: CityWeather;
    currentCity: CurrentCity;
    favorites: number[];
    loading: boolean;
    loaded: boolean;
    forecastDays: any[];
    citiesFound: any[];
}

export const initialState: State = {
    currentCityWeather: {
      Temperature: {
        Metric: {
          Value: 25
        }
      }
    },
    currentCity: {
      id: 215854,
      name: 'Tel Aviv',
      weather: {}
    },
    favorites: [],
    loading: false,
    loaded: false,
    forecastDays: [],
    citiesFound: []
};

export function weatherReducer(state: State | undefined, action: Action) {
  return _weatherReducer(state, action);
}

const _weatherReducer = createReducer(
  initialState,
  on(WeatherActions.addToFav, (state, payload) => {
    return {
      ...state,
      favorites: addToFavReducer(state, payload),
    }
  }),
  on(WeatherActions.removeFromFav, (state, payload) => {
    return {
      ...state,
      favorites: removeFromFavReducer(state, payload),
    }
  }),
  // on(WeatherActions.searchCity, (state, payload) => {
  //   return {
  //     ...state,
  //     currentCity: searchCityReducer(state, payload),
  //     loading: true
  //   }
  // }),
  on(WeatherActions.fetchedCitySuccess, (state, payload) => {
    console.log(' payload :: ', payload)
    return {
      ...state,
      currentCityWeather: payload.data,
      currentCity: {
        id: 215854,
        name: 'Tel Aviv',
        weather: { WeatherText: payload.data.WeatherText, temperature: payload.data.Temperature.Metric.Value}
      },
      loading: false,
      loaded: true
    }
  }),
  on(WeatherActions.getForecastDays, (state, payload) => {

    return {
      ...state,
      forecastDays: [],
    }
  }),
  on(WeatherActions.setForecastDays, (state, payload) => {
    console.log('payload ForecastDays:: ', payload);
    return {
      ...state,
      forecastDays: payload.forecastDays,
    }
  }),
  on(WeatherActions.setSearchResult, (state, payload) => {
    console.log('payload cities:: ', payload);
    return {
      ...state,
      citiesFound: payload.cities,
    }
  })
);




function addToFavReducer(state, payload) {
  console.log(' payload in add :: ', payload);

  let newFavs = Object.assign([], state.favorites);
  newFavs.push(payload.cityKey)
  return newFavs;
}

function removeFromFavReducer(state, payload) {
  console.log(' payload in remove :: ', payload);
  let newFavs = Object.assign([], state.favorites);
  newFavs = newFavs.filter(key => key !== payload.cityKey)
  return newFavs;
}

function searchCityReducer(state, payload) {
  if (payload.id) {
    return payload.id
  }
  else {
    return payload.searchWord;
  }
}
