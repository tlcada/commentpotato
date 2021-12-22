# Commentpotato Server

CommentPotato Server is a tool that allows you to automatically fetch [* random YouTube videos and the most liked comment on a video].

Features
* Can automatically create images based on [*]. You can post these images, for example to Instagram ([examples](https://www.instagram.com/commentpotato/))
* Can automatically post the created image to Twitter as often as you like. Based on [*]. ([examples](https://twitter.com/commentpotato))
* Can automatically create YouTube videos, music for them and description. Based on [*]. ([examples](https://www.youtube.com/channel/UCXmQk4PYoq5v9jIvmRgfXYg))
* Create new videos for the Client side

## How to start

These instructions will help you to run the project on your local machine for development and testing purposes.

### Prerequisites

**Note!** The project may not work in production mode if the REST APIs have changed.

Before you can run the project on localhost you have to create .env file to the project root directory. Add the following lines to the file:

* BASIC_AUTH_USERNAME=root
* BASIC_AUTH_PASSWORD=12345

* IG_BASIC_AUTH_USERNAME=root
* IG_BASIC_AUTH_PASSWORD=12345

* YOUTUBE_API_KEY=12345

* LANGUAGE_DETECTION_API_KEY=12345

* JWT_SECRET=0nTq1qD2TySiwnUMNBLsykxMbfqTIhbB

* TWITTER_API_KEY=12345
* TWITTER_API_SECRET=12345
* TWITTER_ACCESS_TOKEN=12345
* TWITTER_ACCESS_TOKEN_SECRET=12345

* AWS_ACCESS_KEY_ID=12345
* AWS_SECRET_ACCESS_KEY=12345

#### Production usage

In production use this project is designed to work with: AWS CloudWatch, AWS S3, AWS ECR and AWS Elastic Beanstalk. You have to change Commentpotato S3 bucket names to config.tsx file, AWS region etc.

For production use, you need to obtain the following api keys:

* Get API key for [YouTube](https://developers.google.com/youtube/v3/docs)
* Get API key for [Language Detection](https://detectlanguage.com)
* Get API key for [Twitter](https://developer.twitter.com/en/docs/twitter-api/getting-started/getting-access-to-the-twitter-api)
* [AWS account](https://aws.amazon.com/console/)

## Server REST APIs

You can find all the project API endpoints in the Postman collection. There are also ready-made YouTube endpoints to help you test the YouTube API.

### Some video examples for YouTube queries

* Video without comments
    * Use video id: ogJq1oQGLxk
* Comments disabled
    * Use video id: pdTWQb6ncNQ
* Search query without items
    * Use q: basquines
* Statistics example
    * Use video id: BPeogtGMA-g
      Video with comments
    * Use video id: BPeogtGMA-g

## How to run server side

By default, the server side uses dummy data with localhost. You can change this in config.ts. 

**Note!** By default Twitter handler is on, which creates instagram_weekly_file folder in root dir. Inside it, you will find the instagram.zip when the operation is done. You can turn on more handlers from the config.ts file.

| Command                | Description                      |
|:-----------------------|:---------------------------------|
| npm install            | `Install packages`               |
| npm start              | `Run server`                     |
| npm run test           | `Run tests`                      |
| npm run generate-video | `Generate videos with prod data` |

## Test Coverage

You will find the test report from the "coverage" folder after running the tests.

## Test project with Docker

1. Download Docker https://www.docker.com/community-edition
2. Start the Docker if it does not start automatically after installation
3. Use Dockerfile.template
4. Go to the root directory
    * Dockerfile
        * docker build -t commentpotato_server .
        * docker run -d -p 3000:3000 --name commentpotato_server commentpotato_server

## Miscellaneous information

* The application uses generated dictionaries
    * handler > assets >
        * medium-english-words.json
        * mixed-english-words.json
        * long-english-words.json
    * Use words-snippet.html to create new dictionaries
* Music has been downloaded: [https://filmmusic.io](https://filmmusic.io)
  * i-can-feel-it-coming-by-kevin-macleod-from-filmmusic-io.mp3
    * https://filmmusic.io/song/3893-i-can-feel-it-coming
  * thatched-villagers-by-kevin-macleod-from-filmmusic-io.mp3
    * https://incompetech.filmmusic.io/song/4481-thatched-villagers
  * the-path-of-the-goblin-king-by-kevin-macleod-from-filmmusic-io.mp3
    * https://incompetech.filmmusic.io/song/4503-the-path-of-the-goblin-king
    
