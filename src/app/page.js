"use client"

import axios from 'axios';
import Image from "next/image";
import styles from "./page.module.css";
import 'bootstrap/dist/css/bootstrap.css';
import Player from "./components/Player/PlayerComponent";
import React, { useRef, useEffect, useState } from 'react';
import { formatDuration } from "./utils/utils";
import ClipComponent from "./components/Clip/ClipComponent";

//import { getVideoDuration } from "./utils/utils";
const gangstarr = 'https://www.youtube.com/watch?v=Jm0828I0GSc'

export default function Home() {
  const [videoUrl, setVideoUrl] = useState(gangstarr);
  const [searchedURL, setSearchedURL] = useState(false);
  const [pushed, setPushed] = useState(false);
  const [startMark, setStartMark] = useState({});
  const [previewing, setPreviewing] = useState(false);
  const [shift, setShift] = useState(false);
  //const [data, setData] = useState({});
  const [endMark, setEndMark] = useState({});
  const [clips, setClips] = useState([]);
  const [previewDuration, setPreviewDuration] = useState({});
  //const [videoTitle, setVideoTitle] = useState("");
  const [selectedClipIndex, setSelectedClipIndex] = useState(null);

  const [startDuration, setStartDuration] = useState(0);
  const [endDuration, setEndDuration] = useState(0);

  const durationHandler = (_data) => {
    if(_data.id==="start") { 

      setStartDuration(_data.duration);
    }
    else if(_data.id==="end"){

      setEndDuration(_data.duration);
    }
  }

  const finishedPush = (_push) => {
    setPushed(_push);
  }

  useEffect(() => {
    //  console.log("useEffect");
      if(pushed) {
        //setClips([]);
        setPushed(false);
        setSearchedURL(true);
      }
    }, [pushed]);

  const handleInputChange = (event) => {
    setVideoUrl(event.target.value);
    
  };

  const handlePreview = (_data) => {
    setPreviewing(_data);
  }

  const handleSubmit = (event) => {
   // console.log("handleSubmit");
    event.preventDefault();
    setSearchedURL(false);
    setPushed(true);
    setClips([]);
  };

  const markData = (_data) => {
    
    if(_data.id==="start") {

      setStartMark(_data);
      //setData({});
    }
    else if(_data.id==="end"){

      setEndMark(_data);
      //setData({});
    }
  };
  const canShift = (_shift) => {
    setShift(_shift);
  };
  const swapClip = (newClips) => {
    setClips(newClips);
  };

  const previewClip = (_clip) => {
   // console.log("previewClip", _clip);
    //console.log(_clip.start);
    // Code to preview the selected clip goes here
   // console.log("previewClip", _clip);
    if (_clip !== previewDuration) {
      setPreviewDuration(_clip);
      setPreviewing(true); 
    }
  };

  const addClip = (e) => {
    e.preventDefault();
    if (Object.keys(startMark).length === 0 || Object.keys(endMark).length === 0) {
      //clips.push({start: startMark.mark, end: endMark.mark});
      //console.log(pushed);
      //setPushed(false);
      return alert("Please select start and end marks");
    }
    else{

      clips.push({start: startMark.mark, end: endMark.mark});
      //setClips(clips);
      setPushed(true);
      setStartMark({});
      setEndMark({});
    }
    
  }

  const insertSelectedClip = (e) => {
    //console.log("insertSelectedClip", selectedClipIndex);
    e.preventDefault();
    if (selectedClipIndex !== null) {
      let newClips = [...clips];
      const newClip = {start: startMark.mark, end: endMark.mark};
      let part1 = newClips.slice(0, selectedClipIndex);
      let selectedClip = newClips[selectedClipIndex];
      let part2 = newClips.slice(selectedClipIndex+1, newClips.length);
      //part1.concat([newClip, selectedClip]).concat(part2);
      if(e.target.id === "before") {
       // newClips.unshift(newClip); // insert the new clip at the beginning of the array
        newClips = [...part1, newClip, selectedClip, ...part2];
      }
      else if(e.target.id === "after") { 
       // newClips.splice(selectedClipIndex + 1, 0, newClip);
        newClips = [...part1, selectedClip, newClip, ...part2];
      }
    //  console.log(newClips);
      setClips(newClips);
      setSelectedClipIndex(null);
      setStartMark({});
      setEndMark({});
    }
  }


  const create = async () => {
    
    axios.post('/api/create', { videoUrl,clips }, {
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE',
        'Access-Control-Allow-Headers': '*',
      },
    })
    .then(response => {
      // Handle the response data
      console.log(response.data);
    })
    .catch(error => {
      // Handle any errors
    });

}

const downloadAll = async () => {
    
  axios.post('/api/downloadall', { videoUrl,clips }, {
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE',
      'Access-Control-Allow-Headers': '*',
    },
  })
  .then(response => {
    // Handle the response data
    console.log(response.data);
  })
  .catch(error => {
    // Handle any errors
  });

}

  return (
    <div className="container">
      <h1 className="display-4">Hello, Bootstrap!</h1>
      <p className="lead">This is a paragraph with Bootstrap styling.</p>
      <div>
        <form className="urlForm" onSubmit={handleSubmit}>
          <input type="text" value={videoUrl} onChange={handleInputChange} />
          <button type="submit">Submit</button>
        </form>
        {
          searchedURL ? 
          <div className="player-row">
             <Player durationDifference={endDuration} durationHandler={durationHandler} finishedPush={finishedPush} pushed={pushed} canShift={canShift} shift={shift} previewing={previewing} handlePreview={handlePreview} previewDuration={previewDuration} checkMark={endMark} markData={markData} id={"start"} videoUrl={videoUrl} />
             <Player durationDifference={startDuration} durationHandler={durationHandler} finishedPush={finishedPush} pushed={pushed} previewing={previewing} handlePreview={handlePreview} previewDuration={previewDuration} checkMark={startMark} markData={markData} id={"end"} videoUrl={videoUrl} />
          </div> : null
        }
      </div>
      <div>
        <button id='add' onClick={addClip}>Add Clip</button>
       <button id='after' onClick={insertSelectedClip}>Insert After</button>
       <button id='before' onClick={insertSelectedClip}>Insert Before</button>
        <button onClick={()=>{
          if(endMark.mark>0){
            setShift(true) 
           // console.log("Shift");
          }
          }}>Shift</button>
      </div>
      <button onClick={create}>Create</button>
      <button onClick={downloadAll}>Download All</button>
      <div className={styles.clipMenu}>
      {(clips.length > 0) ? clips.map((clip, index) => {
        return (
          <ClipComponent
          key={index}  
          idx={index} 
          clip={clip} 
          clips={clips} 
          videoUrl={videoUrl}
          swapClip={swapClip}
          previewClip={previewClip}
          selectedClipIndex={selectedClipIndex}
          setSelectedClipIndex={setSelectedClipIndex}
          />
        )   
      }) : null}
      </div>
    </div>
  );
}

