import { production } from "../environment/profile";

let webPageJsonUrl;

if (production) {
    webPageJsonUrl = "https://commentpotato.s3.eu-north-1.amazonaws.com/json_files/webpage.json";
} else {
    webPageJsonUrl = "http://localhost:3000/api/v1/webpage_data";
}

const config = {
    webPageJsonUrl: webPageJsonUrl,
    youtube: {
        channelUrl: "https://www.youtube.com/channel",
        videoUrl: "https://www.youtube.com/watch?v=",
    },
    videoList: {
        commentMaxLength: 140,
        maxLineSpaceNumber: 4
    }
};

export default config;
