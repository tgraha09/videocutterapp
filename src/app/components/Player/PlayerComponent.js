"use client"

import { formatDuration, getVideoIdFromUrl, fetchVideoTitle } from '@/app/utils/utils';
import React, { useRef, useEffect, useState } from 'react';
import YouTubePlayer from 'youtube-player';

const PlayerComponent = ({ finishedPush, pushed, shift, canShift,previewing, handlePreview, videoUrl, 
  id, markData, checkMark, previewDuration}) => {
  const playerRef = useRef(null);
  const [totalDuration, setTotalDuration] = useState(-1);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [mark, setMark] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState(0);
 

  useEffect(() => {
    if (videoUrl) {
      const videoId = getVideoIdFromUrl(videoUrl);
      console.log("initializePlayer", videoId);
      playerRef.current = YouTubePlayer(id, {
        videoId: videoId,
        playerVars: {
          showinfo: 0,
        }
      });
      if (playerRef.current && loaded === false) {
        playerRef.current.playVideo();
        
        
        playerRef.current.getDuration().then((duration) => {
        
          if(totalDuration==-1){
            setTotalDuration(duration);
           // setLoaded(true);
            
          }
        }); 

      }
      if(loaded===false && playerRef.current) {
  //      console.log("loaded");
        
    
      }
    }
  }, [videoUrl]);


  useEffect(() => {
    
    if(loaded===true && totalDuration>-1) {
 //     console.log("TotalDuration: " + totalDuration);
      
    }
    
    if (loaded === true && playerRef.current) {
      

    }

    
  }, [loaded, playerRef.current]);
  const handleStateChange = (e) => {
    setState(e.data);
    /**/
  };



  useEffect(() => {
    playerRef.current.on('stateChange', handleStateChange);
  }, [handleStateChange]);

  useEffect(() => {
    
    setInterval(() => {
      playerRef.current.getCurrentTime().then((currentTime) => {
        setCurrentDuration(currentTime);
      });
    }, 100);
    if (state === 1) { // PlayerState.PLAYING
  //    console.log("PlayerState.PLAYING");
      if(loaded===false) {
        playerRef.current.pauseVideo();
        playerRef.current.seekTo(0, true);
        setLoaded(true);
      }
      //setCurrentDuration(playerRef.current.getCurrentTime());
      
    } else if (state === 2) { 
 //     console.log("PlayerState.PAUSED");
      
    }
    else if (state === 3) { 
   //   console.log("PlayerState.ENDED");
      
    }
  }, [state]);

  useEffect(() => {
    if(shift){
   //   console.log("shifting", shift);
      playerRef.current.seekTo(checkMark.mark, true);
      canShift(false);
    }
  }, [shift]);

  useEffect(() => {
    if(pushed) {
      console.log("MARK", pushed);
      setMark(0);
      //finishedPush(false);
    }
  }, [mark]);

  useEffect(() => {
    if(pushed) {
      console.log("finishedPush", pushed);
      setMark(0);
      finishedPush(false);
    }
  }, [pushed]);

  useEffect(() => {
    
    if (id==="start" && currentDuration >= previewDuration.end && previewing) {
      playerRef.current.seekTo(previewDuration.end, true);
      playerRef.current.pauseVideo();
      handlePreview(false);
      // Update the UI whenever currentDuration changes
     // console.log(currentDuration);
    }
  }, [currentDuration]);

  

  useEffect(() => {
    if (markData) {
     
    }
  }, [markData]);
  

  useEffect(() => {
    if (Object.keys(previewDuration).length > 0) {
   //   console.log("previewDuration", previewDuration);
      if(id==="start") {
        playerRef.current.seekTo(previewDuration.start, true);
        setMark(previewDuration.start);
        markData({id, mark: previewDuration.start});
        playerRef.current.playVideo();
      }
      else if(id==="end") {
        playerRef.current.seekTo(previewDuration.end, true);
      }
    }
  }, [previewDuration]);

  const handleMark = () => {
  //  console.log("handleMark");
   // console.log("Checkmark", checkMark);
      if(id=="end" && checkMark.mark >= currentDuration) {
        alert("Start mark should be less than end mark");
        return;
      }
      else if(id=="start" && checkMark.mark <= currentDuration) {
        alert("End mark should be more than start mark");
        return;
      }
      

      setMark(currentDuration);
      //console.log({id, mark: currentDuration});
      markData({id, mark: currentDuration});
  };


  return <div className="player-column">
  <div  id={id}></div>
  <div className="mark-row">

  <div className="duration-column">
    <h3 id='duration'>{`${id.toUpperCase()}: ${formatDuration(currentDuration)}`}</h3>
    <h3 id='duration'>{`Mark: ${formatDuration(mark)}`}</h3>
  </div>
  <button id='mark' onClick={handleMark}>Mark {id}</button>
  
  </div>
  
  </div>;
};

export default PlayerComponent;

