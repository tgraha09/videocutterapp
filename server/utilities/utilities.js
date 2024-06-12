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
    const dataDir = path.join(projectRoot , '/data');
    const downloadsDir = path.join(dataDir+ '/downloads', videoId);
    const videosDir = path.join(dataDir+ '/videos', videoId);
    const doneDir = path.join(dataDir, 'done');
    const verifyDirectories = Promise.all([
        fsExtra.ensureDir(dataDir),
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
                        mergeVideos(videosDir, path.join(doneDir, `${videoTitle}_${videoId}_${new Date().getTime()}_done.mp4`)).then(()=>{
                    
                        }).finally(()=>{
                            deleteVideosInFolder(videosDir);
                           // deleteVideosInFolder(downloadsDir);
                        })
                    })
                    //cutVideo(downloadsDir, videosDir, clips, videoTitle, videoId)
                })
                
            } else if (files.length > 0){
              cutVideo(downloadsDir, videosDir, clips, videoTitle, videoId).then(()=>{
                      
              }).finally(()=>{
                  mergeVideos(videosDir, path.join(doneDir, `${videoTitle}_${videoId}_${new Date().getTime()}_done.mp4`)).then(()=>{
                    
                  }).finally(()=>{
                      deleteVideosInFolder(videosDir);
                     // deleteVideosInFolder(downloadsDir);
                  })
              })
            }
        });
    }).catch((err) => {
        console.error(`Error creating directories: ${err}`);
    });

    
}

const  deleteVideosInFolder =(folderPath)=> {
  //const subdirectoryPath = folderPath;
  fs.rm(folderPath, { recursive: true }, (err) => {
    if (err) {
      console.error('Error deleting subdirectory:', err);
    } else {
      console.log('Deleted subdirectory:', folderPath);
    }
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
      console.log('Clips Length: ', clips.length);
      for (const clip of clips) {
        const startSeconds = clip.start;
        const endSeconds = clip.end;
        //videoTitle = vidTitle;
        const outputFilename = `${videoTitle}_${videoId}.mp4`;
        const outputFilePath = path.join(downloadsDir, outputFilename);
        console.log('Output file path:', outputFilePath);
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

  

  const shortenString = (inputString)=> {
    inputString = inputString.replace(/\s/g, '');//renove spaces
    if (inputString.length <= 8) {
      return inputString; // No need to shorten, already under 8 characters
    } else {
      return inputString.slice(0, 8); // Abbreviate to the first 8 characters
    }
  }

  module.exports = { createClip };