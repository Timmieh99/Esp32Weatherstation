# Esp32Weatherstation

## Overview
The project aimed to create an IoT-based weather station with an ESP32 (wroom-32), connected to a BME280 sensor for measuring temperature, humidity, and barometric pressure. The BME280 data was transmitted to AWS Timestream through AWS IoT Core, ensuring secure and efficient data transfer. Simultaneously, data from a weather API was collected and seamlessly sent to AWS Timestream using a Lambda function. This comprehensive approach allowed for the consolidation of both local sensor data and external weather information in a centralized Timestream database. A Grafana Cloud page was created to visualize and analyze this combined weather data from the BME280 sensor and OpenWeatherAPI.

## Components
- **ESP32 (wroom-32):** The device collecting weather data from the BME280 sensor.
- **BME280 Sensor:** Measures temperature, humidity, and barometric pressure.
- **Lambda Function:** Fetches data from OpenWeatherApi and sends it to Timestream.
- **AWS IoT Core:** Manages communication between the ESP32 and other AWS services.
- **AWS Timestream:** Stores and manages time-series data from the weather station.
- **Grafana Cloud:** Creates custom dashboards to visualize weather data.

## Architecture
![architecture](https://github.com/Timmieh99/Esp32Weatherstation/assets/60445245/493c5fda-8882-447d-807f-15c5fe961904)

## Project Structure
- **/src:** Source code for the ESP32 device and the Lambda function.

## Installation and Configuration
- Setup a thing and a policy connected to your thing allowing Publish,Subscribe,Connect,Receive in AWS
- Setup a message routing rule with this SQl statement "SELECT * FROM "esp32/+/pub"" and add an action rule to allow write to timestream table
- When setting up the action rule you will create a timestream db and table
- Dimensions name: DeviceID, Dimension value: ${cast(topic(2) AS DECIMAL)}
- Create an IAM role that allows timestream write and describeendpoints
- Create a free trial account for grafana
- Create an instance in grafana cloud
- Add grafana-timetream-datasource plugin to your instance
- Create a IAM User with TimestreamReadOnlyAccess permissions in AWS
- Add Timestream as a datasource and configure it using IAM Users access key
- Download src files
- Create a `secrets.h` file to hold sensitive information in the ESP32 project.
- Set up WiFi network information and AWS connection details(Private key,Device certificate,AmazonRootCA1) in the secrets.h file.
- Upload the ESP32 code to the device.
- Create and deploy the Lambda function on AWS.
- Register for an OpenWeatherApi key
- Specify the OpenWeatherApi key as an enviorment variable called openWeatherMapApiKey in the Lambda function.
- Download aws-sdk and axios packages using npm, create a zip file of the aws-sdk and axios packages and add them to Lambda as layers
- Test your function and see if you get status code 200 meaning a successful write to timestream
- Create a EventBridge Schedule with your Lambda function as a target and set a fixed rate to invoke you lambda function 1 time every minut
- Goto your grafana instance and create a new dashboard you should be able to choose your Database,Table and measure
- Add this sql statments "SELECT time, measure_value::double AS Temperature FROM $__database.$__table WHERE measure_name = '$__measure'"
- Replace "Temperature" with the measure and now you should see your data starting to populate your graph repeat for all the other measures

## Grafana Graphs
![graph](https://github.com/Timmieh99/Esp32Weatherstation/assets/60445245/c111651b-44a0-4b6a-a9e4-9f3cbbea72d1)

## References


- [AWS IoT Core documentation](https://docs.aws.amazon.com/iot/latest/developerguide/what-is-aws-iot.html)
- [AWS Timestream documentation](https://docs.aws.amazon.com/timestream/latest/developerguide/what-is-timestream.html)
- [AWS Blog posts](https://aws.amazon.com/blogs/)
- [Grafana-timestream-datasource-plugin documentation](https://grafana.com/grafana/plugins/grafana-timestream-datasource)
- [ESP32 documentation](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/)
- [BME280 documentation](https://learn.adafruit.com/adafruit-bme280-humidity-barometric-pressure-temperature-sensor-breakout)
  
## Troubleshooting
- Ensure the ESP32 device has a stable WiFi connection.
- Verify that AWS and OpenWeatherApi connection details are accurate.
- Inspect logs from Lambda and ESP32 as needed.
