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


export default function Home() {
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=Jm0828I0GSc');
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
  useEffect(() => {
  //  console.log("useEffect");
    if(pushed){
      
    }
  }, [pushed]); //, canPreview

  const finishedPush = (_push) => {
    setPushed(_push);
  }

  useEffect(() => {
    //  console.log("useEffect");
      if(pushed) {
        
        setPushed(false);
      }
    }, [pushed, startMark, endMark]);

  const handleInputChange = (event) => {
    setVideoUrl(event.target.value);
  };

  const handlePreview = (_data) => {
    setPreviewing(_data);
  }

  const handleSubmit = (event) => {
   // console.log("handleSubmit");
    event.preventDefault();

   setSearchedURL(true);
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
    console.log("previewClip", _clip);
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
             <Player finishedPush={finishedPush} pushed={pushed} canShift={canShift} shift={shift} previewing={previewing} handlePreview={handlePreview} previewDuration={previewDuration} checkMark={endMark} markData={markData} id={"start"} videoUrl={videoUrl} />
             <Player finishedPush={finishedPush} pushed={pushed} previewing={previewing} handlePreview={handlePreview} previewDuration={previewDuration} checkMark={startMark} markData={markData} id={"end"} videoUrl={videoUrl} />
          </div> : null
        }
      </div>
      <div>
        <button onClick={addClip}>Add Clip</button>


        <button onClick={()=>{
          if(endMark.mark>0){
            setShift(true) 
            console.log("Shift");
          }
          }}>Shift</button>
      </div>
      <button onClick={create}>Create</button>
      <div className={styles.clipMenu}>
      {(clips.length > 0) ? clips.map((clip, index) => {
        return (
          <ClipComponent
          key={index}  
          idx={index} 
          clip={clip} 
          clips={clips} 
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

