import requests
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('WEATHER_API') 

def kelvin_to_celsius(kelvin):
    return round(kelvin - 273.15)

def get_temperature(lat, lon):
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}"

    response = requests.get(url).json()
    temperature = kelvin_to_celsius(response["main"]["temp"])

    return temperature

def get_humidity(lat, lon):
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}"

    response = requests.get(url).json()
    humidity = response["main"]["humidity"]

    return humidity

def refrigerator_temperature():
    # Optimum refirgerator temperature is between 0 and 5 celcius
    return 1

if __name__ == '__main__':
    None
    # Tests: 
    print(get_temperature("-33.8688", "151.2093"))
    print(get_humidity("-33.8688", "151.2093"))
