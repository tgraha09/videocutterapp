const youtubedl = require('youtube-dl-exec');
const ffmpeg = require('fluent-ffmpeg');
const fsExtra = require('fs-extra');
const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');
const { execSync } = require('child_process');
const projectRoot = process.cwd();

const createClip = async (videoUrl ,clips) => {
    
    const videoInfo = await youtubedl(videoUrl, { dumpSingleJson: true })
    const videoId = videoInfo.id;
    const videoTitle = shortenString(videoInfo.title);
    const downloadsDir = path.join(projectRoot+ '/downloads', videoId);
    const videosDir = path.join(projectRoot+ '/videos', videoId);
    const doneDir = path.join(projectRoot+ '/done', videoId);
    const verifyDirectories = Promise.all([
        fsExtra.ensureDir(downloadsDir),
        fsExtra.ensureDir(videosDir),
        fsExtra.ensureDir(doneDir),
    ]);
    
    verifyDirectories.then(() => {
        console.log('Directories created successfully.');
        
        fs.readdir(downloadsDir, (err, files) => {
            if (err) {
              console.error(`Error reading the 'downloads' subfolder: ${err}`);
              return;
            }
          
            if (files.length === 0) {
                console.log('No files found in the \'downloads\' subfolder.');
                
                console.log("videoId: " + videoId);
                downloadVideo(videoUrl, videoTitle, downloadsDir, videoId).then((check)=>{
                    console.log(check);

                }).finally(()=>{
                    //console.log(info);
                    console.log("FINALLY");
                    cutVideo(downloadsDir, videosDir, clips, videoTitle, videoId).then(()=>{
                      
                    }).finally(()=>{
                        mergeVideos(videosDir, path.join(doneDir, `${videoTitle}_${videoId}_${new Date().getTime()}_done.mp4`));
                    })
                    //cutVideo(downloadsDir, videosDir, clips, videoTitle, videoId)
                })
                
            } else if (files.length > 0){
              cutVideo(downloadsDir, videosDir, clips, videoTitle, videoId).then(()=>{
                      
              }).finally(()=>{
                  mergeVideos(videosDir, path.join(doneDir, `${videoTitle}_${videoId}_${new Date().getTime()}_done.mp4`));
              })
            }
        });
    }).catch((err) => {
        console.error(`Error creating directories: ${err}`);
    });

    
}

const downloadVideo = async (videoUrl, videoTitle, downloadsDir, videoId) => {
    console.log("downloadVideo: " + videoUrl);
    
    const outputFilename = `${videoTitle}_${videoId}.mp4`;
    const outputFilePath = path.join(downloadsDir, outputFilename);
    
    return await new Promise((resolve, reject) => {
        youtubedl(videoUrl, { o: outputFilePath, format: 'mp4' })
          .then(() => {
            console.log(`Video downloaded and saved to: ${outputFilePath}`);
            resolve(true);
          })
          .catch((err) => {
            console.error(`Error downloading video: ${err}`);
            reject(err);
          });
      });

        
    

  }

const cutVideo = async (downloadsDir, videosDir, clips, videoTitle, videoId) => {
    try {
      for (const clip of clips) {
        const startSeconds = clip.start;
        const endSeconds = clip.end;
        //videoTitle = vidTitle;
        const outputFilename = `${videoTitle}_${videoId}.mp4`;
        const outputFilePath = path.join(downloadsDir, outputFilename);
        await new Promise((resolve, reject) => {
          ffmpeg()
            .input(outputFilePath)
            .setStartTime(startSeconds)
            .setDuration(endSeconds - startSeconds)
            .outputOptions('-c:a', 'copy')
            .output(path.join(videosDir, `cut_video_${videoTitle}_${videoId}_${startSeconds}-${endSeconds}.mp4`))
            .on('end', () => {
              console.log(`Video cutting for ${startSeconds}-${endSeconds} seconds complete!`);
              resolve();
            })
            .on('error', (err) => {
              console.error(`Error cutting video for ${startSeconds}-${endSeconds} seconds:`, err);
              reject(err);
            })
            .run();
        });
       /// await cutClip(downloadsDir, videosDir, clip, videoTitle, videoId);

        // Log before starting the cutting process
      }
    } catch (error) {
      console.error('Download failed:', error.message);
    }
  };

  

  async function mergeVideos(videosDir, outputFilename) {
    console.log("videosDir: "+videosDir);
    console.log("videosDir: "+outputFilename);
    // Get a list of all MP4 files in the input folder
    const inputFiles = fs.readdirSync(videosDir)
      .filter(file => file.endsWith('.mp4'))
      .map(file => path.join(videosDir, file));
    console.log(inputFiles);
  
    // Generate a text file containing the list of input files for FFmpeg
    const fileListPath = 'input_file_list.txt';
    fs.writeFileSync(fileListPath, inputFiles.map(file => `file '${file}'`).join('\n'));
  
    // Run FFmpeg to concatenate the videos
    const ffmpegCommand = `C:\\ffmpeg\\bin\\ffmpeg.exe -f concat -safe 0 -i ${fileListPath} -c copy -y ${outputFilename}`;
    execSync(ffmpegCommand);
  
    // Remove the temporary file list
    fs.unlinkSync(fileListPath);
  }






  






const downloadClip = async(videoUrl, downloadsDir, videosDir, clip, vidTitle)=>{
    const videoInfo = await youtubedl(videoUrl, { dumpSingleJson: true });
      videoTitle = vidTitle;
  
      const startSeconds = clip.startDuration.totalSeconds;
      const endSeconds = clip.endDuration.totalSeconds;
  
      const outputFilename = `${videoTitle}.mp4`;
      const outputFilePath = path.join(downloadsDir, outputFilename);
  
      // Download video using youtube-dl
      console.log(`Downloading video to: ${outputFilePath}`);
      await youtubedl(videoUrl, { o: outputFilePath, format: 'mp4' });
}



const createClips = async (videoUrl, clips, videoTitle) => {
    console.log(videoUrl);
    if (!videoUrl) {
        throw new Error('No video URL specified');
    }
    console.log("createClips", videoUrl);
    const isYouTubeVideo = videoUrl.includes('youtube.com/watch?v=');
    if (isYouTubeVideo) {
        // Download the YouTube video using ytdl-core
       
        const videoId = getVideoIdFromUrl(videoUrl);
        const videoPath = path.join(downloadsDir, `${videoId}.mp4`);
        const videoInfo = await ytdl.getInfo(videoId);
        const videoTitle = shortenString(videoTitle);
        const videoLength = videoInfo.videoDetails.lengthSeconds;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        console.log(videoTitle, videoLength, videoUrl);
        
        const createdClips = [];
    
        const ffmpegInstance = ffmpeg();
        
        for (const clip of clips) {
        const { start, end } = clip;
    
        const clipPath = `clip_${start}_${end}.mp4`;
    
        ffmpegInstance.inputOptions([
            '-map', '0:v:0',
            '-map', '0:a:0',
            '-ss', `${start}`,
            '-t', `${end - start}`,
            '-c', 'copy'
        ]);
        
        ffmpegInstance.input(videoUrl);
    
        ffmpegInstance.output(clipPath);
    
        createdClips.push(clipPath);
        }
    
        const outputFilePath = 'combined.mp4';
    
        ffmpegInstance.outputOptions([
        '-c copy',
        '-map 0:v:0',
        '-map 0:a:0',
        ]);
    
        ffmpegInstance.output(outputFilePath);
    
        await new Promise((resolve, reject) => {
        ffmpegInstance
            .on('end', resolve)
            .on('error', reject)
            .run();
        });
    
        return [outputFilePath, ...createdClips];
    }
};

  

  const shortenString = (inputString)=> {
    inputString = inputString.replace(/\s/g, '');//renove spaces
    if (inputString.length <= 8) {
      return inputString; // No need to shorten, already under 8 characters
    } else {
      return inputString.slice(0, 8); // Abbreviate to the first 8 characters
    }
  }

  const getVideoIdFromUrl = (url) => {
    const regex = /(?:\?v=|\/embed\/|\/v\/|\.be\/)([^&?#]+)/;
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  };

  module.exports = { createClip };