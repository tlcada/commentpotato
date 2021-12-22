# Commentpotato Client

[https://www.commentpotato.com](https://www.commentpotato.com/)

## Prerequisites

Before you run the project you have to create .env file to the project root directory. Add the following lines to the file:

* REACT_APP_SERVER_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTU4MTg1NjQ1MX0.6chz9zCwm3PmiHcAerToTSHdclmdSofB1yXKXWH_y8E

## How to run client side

Server side has folder called json_files. Inside this folder is webpage.json file with pre-created content on client side, so you can get started easily. All you have to do is remember to launch the **client side** and **server side**.

| Command       | Description |
|:--------------| :--- |
| npm install   | `Install packages` |
| npm start     | `Run app` |
| npm run test  | `Run tests` |

### Page Configurations

* src > config > config.tsx

## Test Coverage

You will find the test report from the "coverage" folder after running the tests. 

## Where is the site hosted? 

Client side is hosted by [Vercel](https://vercel.com/). You will find Dockerfile in root dir. With Docker, you can host client side wherever you want. 
