import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import {switchMap, map, tap, catchError, mergeMap, exhaustMap} from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { initialState }  from './weather/reducers/weather.reducer'
import {
  searchCity,
  addToFav,
  removeFromFav,
  getForecastDays,
  setForecastDays,
  getCityWeatherById,
  setSearchResult,
  setFavorites,
  setCurrentCity
} from './weather/actions/weather.actions';
import { of, Observable } from "rxjs";
import { City } from '../models/city.model';
import { State } from './weather/reducers/weather.reducer';
import { Store, select } from "@ngrx/store";
import * as WeatherActions from "./weather/actions/weather.actions";
import {action} from "../models/action.model";

@Injectable()
export class WeatherEffects {
  constructor(private apiService: ApiService, private actions$: Actions, private store: Store<State>) {}

  ngrxOnInitEffects(): Action {
    const favorites = JSON.parse(localStorage.getItem('favorites'));
    this.store.dispatch(setFavorites({ favorites }))
    this.store.dispatch(WeatherActions.getCityWeatherById(initialState.currentCity));
    this.store.dispatch(WeatherActions.getForecastDays({ id: initialState.currentCity.id }))
    return { type: '[WeatherEffects]: Init' };
  }

  getCurrentWeather$ = createEffect(
    (): any => this.actions$.pipe(
        ofType(searchCity),
        switchMap((action: Action) => {
          return this.searchLocationStream(action)
        })
  ));

  getCurrentWeatherbyId$ = createEffect(
    (): any => this.actions$.pipe(
      ofType(getCityWeatherById),
      switchMap((payload) => {
        return this.apiService.getCurrentWeather(payload.id).pipe(
          map(cities => cities[0]),
          tap(cities => console.log('%c payload :: ', 'color: red;font-size:16px', cities)),
          map(cities => ({ type: '[weather Effect] getCityWeatherByIdSuccess', payload: cities})),
          catchError(error => of({ type: '[weather Effect] getCityWeatherByIdError', payload: error})),
        )
      })
    ));


    private searchLocationStream(action) {
      return this.apiService.searchLocation(action.searchWord).pipe(
        map((citiesFound) => {
          this.store.dispatch(setSearchResult({ cities: citiesFound }))
          return {type: 'dispatched cities found'}
        })
      )
    }

    // private getCurrentWeather(payload) {
    //   return this.apiService.getCurrentWeather(payload.id).pipe(
    //     map(cities => cities[0]),
    //     tap(cities => console.log('%c payload :: ', 'color: red;font-size:16px', cities)),
    //     tap(cities => this.store.dispatch({ type: 'getCityWeatherByIdSuccess'})),
    //     catchError(error => of(console.log(' err :: ', error))),
    //   ).subscribe()
    // }

    getForecast$ = createEffect(
      () => this.actions$.pipe(
        ofType(getForecastDays),
        map((res) => { return this.apiService.getForecast(res.id).pipe(

        map(forecastDays => (forecastDays as any).DailyForecasts),
        map(forecastDays => {
          let newForecastDays;
          if (forecastDays) {
            newForecastDays = forecastDays.map(day => {
              return {
                date: day.Date,
                weatherText: day.Day.IconPhrase,
                temperature: {
                  min: day.Temperature.Minimum.Value,
                  max: day.Temperature.Maximum.Value,
                }
              }
            })
          }
          return newForecastDays
        }),
          tap((forecastDays) => {
            this.store.dispatch(setForecastDays({ forecastDays }));
          }),
        ).subscribe() }),
      )
    , { dispatch: false })

}