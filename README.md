
# Vidchain

A viewing experience builder that lets you chain video clips from any youtube video by passing in a list of urls, start times and stop times.

## Table of Contents  
- About
- Tech Stack
- Installation
- Usage

## About  
Vidchain aims to solve the problem of improper curation and lengthy fluff in videos by letting anyone create their own granular playlist of clips, by passing in the video url, start time and stop time in seconds into the program to create a seamless viewing experience between them.

Usecases:
- Mastery Based Courses - Course creators can reuse segments from their videos to build seperate viewing experiences for Beginner, Intermediate and Expert learners.
- Video Compilation - Video creators can compile clips without the need of a video editor to build compilations.
- Youtube Rabbitholes - Share the rabbit hole you went down in youtube to your friends exactly how you saw it.

## Tech Stack  
- **Frontend:** React / Tailwind  
- **Backend:** Youtube Player API

## Installation  

Clone the repo:  
```bash
git clone https://github.com/thePrnvBot/vidchain-mvp.git
cd vidchain-mvp
```

## Usage
Pass in a JSON object of this type to load your own video experience, verify the videos on the preview bar and scroll to the bottom to confirm it. Your video sequence should start playing on the video player.
```json
{
  "sequenceTitle": "My Sequence",
  "clips": [
    {
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "start": 10,
      "end": 20
    },
    {
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "start": 0,
      "end": 10
    }
  ]
}
```

## Screenshots

<img width="1592" height="1193" alt="image" src="https://github.com/user-attachments/assets/025de4e0-5468-4369-a147-311d9654f156" />



