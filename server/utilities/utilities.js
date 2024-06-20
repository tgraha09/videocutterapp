const youtubedl = require('youtube-dl-exec');
const ffmpeg = require('fluent-ffmpeg');
const fsExtra = require('fs-extra');
const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');
const { execSync } = require('child_process');
const projectRoot = process.cwd();
const ytdlp = require('yt-dlp-exec');
const createClip = async (videoUrl ,clips, downloadAll) => {
  console.log("createClip: " + videoUrl);
  console.log("downloadAll: " + downloadAll);
   // console.log(downloadLocation);
    //const info = await youtubedl(videoUrl, { dumpSingleJson: true })
    ytdl.getInfo(videoUrl).then(async info => {
      let videoInfo =info.videoDetails;
      //console.log(videoInfo.videoDetails.title);
      //console.log(videoInfo);

      //const videoTitle = shortenString(videoInfo.title);
      
      
     // videoArtist = videoArtist.replace(" ", "")
      
      let date = new Date().getTime();
      
      //console.log(videoInfo);
      //const videoDescription = shortenString(videoInfo.description);
      //const videoAuthor = shortenString(videoInfo.author);
      //console.log(videoInfo);
      let videoArtist = videoInfo.author.name.replace(/[&%\-[\]";'.,?@#\s:]|]/g, "");
      let downloadTitle = videoInfo.title.replace(/[&%\-[\]";'.,?@#\s:]|]/g, "");
      downloadTitle = downloadTitle.replace("|", "").replace("#", "")
     // downloadTitle = downloadTitle.replace(/[&%\-[\]";'.,?@#\s]|]/g, "");
      console.log("videoArtist: \n" + videoArtist);
      /*while(downloadTitle.contains(" ")){
        downloadTitle = downloadTitle.replace(" ", "")
      }
      while(videoArtist.contains(" ")){
        videoArtist = videoArtist.replace.replace(" ", "")
      }*/
      
      let videoId = videoInfo.author.id;
      
      console.log("videoId: " + videoId);
      let videoTitle = `${shortenString(videoInfo.title.replace("|", "").replace("#", "").replace("CookinSoul", ""))}_${videoId}_${date}`;
      //console.log("videoTitle: " + videoTitle);
      let dataDir = path.join(projectRoot , '/data');
      let downloadsDir = path.join(dataDir+ '/downloads/', videoArtist);
      let videosDir = path.join(dataDir+ '/videos/', videoArtist);
      let doneDir = path.join(dataDir+ '/done/', videoArtist);
      let downloadPath = path.join(downloadsDir, `${downloadTitle}.mp4`);
      let verifyDirectories = Promise.all([
          fsExtra.ensureDir(dataDir),
          fsExtra.ensureDir(downloadsDir),
          fsExtra.ensureDir(videosDir),
          fsExtra.ensureDir(doneDir),
      ]);
    
    verifyDirectories.then(() => {
        console.log('Directories created successfully.');
        if (fs.existsSync(downloadPath)) {
          console.log(`File ${downloadPath} exists.`);
          cutVideo(downloadPath, videosDir, clips, videoTitle, downloadAll, doneDir).then(()=>{
                      
          }).finally(()=>{
            if(downloadAll==false){
              
              mergeVideos(videosDir, path.join(doneDir, `${videoTitle}_done.mp4`)).then(()=>{
                
              })
              .then(() => {
                console.log('Videos merged successfully.');
              })
              .catch((err) => {
                console.error('Error merging videos:', err);
              }).finally(()=>{
                  deleteVideosInFolder(videosDir);
                  console.log("FINISHED");
                 // deleteVideosInFolder(downloadsDir);
              })
            }
          })
        } else {
          console.log(`File ${downloadPath} does not exist.`);
          downloadVideo(videoUrl, downloadPath).then((check)=>{
            console.log(check);
          }).finally(()=>{
              //console.log(info);
              //console.log("FINALLY");
              cutVideo(downloadPath, videosDir, clips, videoTitle, downloadAll, doneDir).then(()=>{
                
              }).finally(()=>{
                  if(downloadAll==false){
                    mergeVideos(videosDir, path.join(doneDir, `${videoTitle}_done.mp4`)).then(()=>{
              
                    })
                    .then(() => {
                      console.log('Videos merged successfully.');
                    })
                    .catch((err) => {
                      console.error('Error merging videos:', err);
                    }).finally(()=>{
                        deleteVideosInFolder(videosDir);
                        console.log("FINISHED");
                      // deleteVideosInFolder(downloadsDir);
                    })
                  }
              })
              //cutVideo(downloadsDir, videosDir, clips, videoTitle, videoId)
          })
        }
        
    }).catch((err) => {
        console.error('Error creating directories:', err);
    });
    
    }).catch((err) => {
      console.error('Error getting video info:', err);
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

const downloadVideo = async (videoUrl, downloadPath) => {
  console.log("downloading Video"); 
  return await new Promise((resolve, reject) => {
      youtubedl(videoUrl, { 
        o: downloadPath, 
        format: 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/mp4', 
        })
        .then(() => {
          console.log(`Video downloaded and saved to: ${downloadPath}`);
          resolve(true);
        })
        .catch((err) => {
          console.error(`Error downloading video: ${err}`);
          reject(err);
        });
  });

}

const cutVideo = async (downloadPath, videosDir, clips, videoTitle, downloadAll, doneDir) => {
  console.log("CUTTING  VIDEO: ", downloadAll);
    try {
      //console.log('Clips Length: ', clips.length);
      for (const clip of clips) {
       // console.log('Clip: ', clip);
        const startSeconds = clip.start;
        const endSeconds = clip.end;
        let title = downloadAll ?  `${videoTitle}_${startSeconds}-${endSeconds}_done.mp4`:
        `cut_video_${videoTitle}_${startSeconds}-${endSeconds}.mp4`
       console.log('Title: ', title);
        let outputFilePath = downloadAll ? path.join(doneDir, title): path.join(videosDir, title)
       // console.log('Output file path:', outputFilePath);
        //videoTitle = vidTitle;
       // console.log('Output file path:', outputFilePath);
        await new Promise((resolve, reject) => {
          ffmpeg()
            .input(downloadPath)
            .setStartTime(startSeconds)
            .setDuration(endSeconds - startSeconds)
            .outputOptions('-c:a', 'copy', '-an')
            .output(outputFilePath)
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
      console.error('Cutting failed:', error.message);

      
    }
  };

  

  async function mergeVideos(videosDir, outputFilename) {
    console.log("MERGING");
    // Get a list of all MP4 files in the input folder
    const inputFiles = fs.readdirSync(videosDir)
      .filter(file => file.endsWith('.mp4'))
      .map(file => path.join(videosDir, file))
      .sort((a, b) => {
        const statA = fs.statSync(a);
        const statB = fs.statSync(b);
        return statA.birthtimeMs - statB.birthtimeMs;
      });
     // console.log(inputFiles);
    // Generate a text file containing the list of input files for FFmpeg
    const fileListPath = 'input_file_list.txt';
    fs.writeFileSync(fileListPath, inputFiles.map(file => `file '${file}'`).join('\n'));
  
    // Run FFmpeg to concatenate the videos
    const ffmpegCommand = `C:\\ffmpeg\\bin\\ffmpeg.exe -f concat -safe 0 -i ${fileListPath} -c copy -y ${outputFilename}`;
    execSync(ffmpegCommand);
  
    // Remove the temporary file list
    fs.unlinkSync(fileListPath);
  }

  async function countFiles(directoryPath) {
  let count = 0;
  try {
    const files = await fs.promises.readdir(directoryPath);
    for (const file of files) {
      const stats = await fs.promises.stat(`${directoryPath}/${file}`);
      if (stats.isFile()) {
        count++;
      }
    }
  } catch (err) {
    console.error('Error counting files:', err);
    return;
  }
 // console.log('Number of files:', count);
}

  const shortenString = (inputString)=> {
    inputString = inputString.replace(/[&%\-[\]";'.,?@#\s:]|]/g, "").replace(" ", "");
    if (inputString.length <= 8) {
      return inputString; // No need to shorten, already under 8 characters
    } else {
      return inputString.slice(0, 8); // Abbreviate to the first 8 characters
    }
  }

  module.exports = { createClip };