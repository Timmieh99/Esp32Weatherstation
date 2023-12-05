import axios from 'axios';
import AWS from 'aws-sdk';


const openWeatherMapApiKey = process.env.openWeatherMapApiKey;
const city = 'Stockholm';

const timestream = new AWS.TimestreamWrite({ region: 'eu-central-1' });

export async function handler(event){
    try {
        const weatherData = await fetchWeatherData();
        await writeToTimestream(weatherData);
        
        return {
            statusCode: 200,
            body: JSON.stringify('Data successfully written to Timestream'),
        };
    } catch (error) {
        console.error('Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify('Error writing to Timestream'),
        };
    }
};

async function fetchWeatherData() {
    try {
        const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherMapApiKey}`);

        // Extract relevant data from the OpenWeatherMap response
        const temperature = response.data.main.temp - 273.15; // -273.15 to convert from kelvin to celcius
        const humidity = response.data.main.humidity;
        const pressure = response.data.main.pressure;

        return {
            temperature,
            humidity,
            pressure,
        };
    } catch (error) {
        console.error('Error fetching data from OpenWeatherMap API:', error.message);
        throw error;
    }
}

async function writeToTimestream(data) {
    try {
        const currentTimeEpoch = new Date().getTime(); // Current time in epoch milliseconds
        const currentTime = `${currentTimeEpoch}`; // Convert to string
        const apiSuffix = 'OpenWeatherMap'; // Add a suffix to distinguish API data from device data
        console.log('Timestamp:', currentTime);
        const params = {
            DatabaseName: 'ESP32BME280_Data',
            TableName: 'WeatherData',
            Records: [
                {
                    Dimensions: [
                        { Name: 'location', Value: city },
                    ],
                    MeasureName: `temperature_${apiSuffix}`,
                    MeasureValue: `${data.temperature}`,
                    MeasureValueType: 'DOUBLE',
                    Time: currentTime,
                },
                {
                    Dimensions: [
                        { Name: 'location', Value: city },
                    ],
                    MeasureName: `humidity_${apiSuffix}`,
                    MeasureValue: `${data.humidity}`,
                    MeasureValueType: 'DOUBLE',
                    Time: currentTime,
                },
                {
                    Dimensions: [
                        { Name: 'location', Value: city },
                    ],
                    MeasureName: `pressure_${apiSuffix}`,
                    MeasureValue: `${data.pressure}`,
                    MeasureValueType: 'DOUBLE',
                    Time: currentTime,
                },
            ],
        };

        await timestream.writeRecords(params).promise();
        console.log('Data successfully written to Timestream');
    } catch (error) {
        console.error('Error writing to Timestream:', error.message);
        throw error;
    }
}
