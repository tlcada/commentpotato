%SystemRoot%\explorer.exe "C:\Works\git\your_comment\server\youtube_video"
@echo off
echo "example path: http://localhost:3000/api/v1/video?episode=X&videos=12345,12345"
echo "example path 2: http://localhost:3000/api/v1/video?episode=X&horizontal=false&videos=12345,12345"
echo "videos query param: limit is 9 images"
start "" http://localhost:3000/api/v1/
npm run generate-video
