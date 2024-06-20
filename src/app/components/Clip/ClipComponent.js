import { formatDuration } from '@/app/utils/utils';
import React, { useState, useEffect } from 'react';
import styles from './ClipComponent.module.css';
import  axios  from 'axios';

const ClipComponent = ({ totalDuration, videoUrl,clip, idx, swapClip, clips, selectedClipIndex, setSelectedClipIndex, previewClip }) => {
  const [isSelected, setIsSelected] = useState(false);
  const [editable, setEditable] = useState(false);
  useEffect(() => {
    //setIsSelected(selectedClipIndex === idx);



  }, []);

  
  const handleSelectClick = () => {
    setIsSelected(!isSelected);
    setSelectedClipIndex(isSelected ? null : idx);
    //const selectedClip = clips[idx];
    //console.log(selectedClip);
   //previewClip({...selectedClip, idx});
  };

  const handleSwapClick = () => {
    if (selectedClipIndex !== null && selectedClipIndex !== idx) {
      const newClips = [...clips];
      const selectedClip = newClips[selectedClipIndex];
      newClips[selectedClipIndex] = clip;
      newClips[idx] = selectedClip;
      swapClip(newClips);
      setSelectedClipIndex(null);
      setIsSelected(false);
    }
  };

  const handleDeleteClick = () => {
    if (selectedClipIndex !== null) {
      const newClips = [...clips];
      newClips.splice(selectedClipIndex, 1);
      swapClip(newClips);
      setSelectedClipIndex(null);
      setIsSelected(false);
      
    }
  };

  const handleEditClick = () => {
    if (selectedClipIndex !== null) {
      const clip = clips[selectedClipIndex];
      setEditable(!editable);
      //newClips.splice(selectedClipIndex, 1);
      //swapClip(newClips);
      //setSelectedClipIndex(null);
      //setIsSelected(false);
      
    }
  };

  const handlePreviewClick = () => {
    // Code to preview the selected clip goes here\
    //const selectedClip = clips[idx];
   // console.log("handlePreviewClick", {clip, idx});
    
    previewClip({...clip, idx});
    
    //console.log(selectedClip);
  };

  const handleDownloadClick = () => {
    // Code to preview the selected clip goes here\
    //const selectedClip = clips[idx];
    //console.log("handleDownloadClick", {clip, idx});
    //...clip
    axios.post('/api/create', { videoUrl, clips: [{...clip}]}, {
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE',
        'Access-Control-Allow-Headers': '*',
      },
    })
    .then(response => {
      // Handle the response data
      //console.log(response.data);
    })
    .catch(error => {
      // Handle any errors
    });
    
    //console.log(selectedClip);
  };

  const selectButtonCSS = isSelected ?  'select-buttonSelected': 'select-button';
//[selectButtonCSS]
  return (
    <div className={styles.clip}>
      <h4>Clip {idx + 1}</h4>
      <div className={styles.clipInfo}>
        <div className={styles.clipMarkers}>
          {isSelected ? 
          <>
          {editable && isSelected ? (
          <div>
            <input
              type="text"
              placeholder="Start"
              value={clip.start}
              onChange={(e) => {
                const newClips = [...clips];
                newClips[idx].start = e.target.value;
                swapClip(newClips);
              }}
            />
            <input
              type="text"
              placeholder="End"
              value={clip.end}
              onChange={(e) => {
                const newClips = [...clips];
                newClips[idx].end = e.target.value;
                swapClip(newClips);
              }} />
          </div>
        ) : (   
          <>
            <p>Start: {formatDuration(clip.start)}</p>
            <p>End: {formatDuration(clip.end)}</p>
            <p>Total: {formatDuration(clip.end - clip.start)}</p>
          </>
        )}
          </> :<>
            <p>Start: {formatDuration(clip.start)}</p>
            <p>End: {formatDuration(clip.end)}</p>
            <p>Total: {formatDuration(clip.end - clip.start)}</p>
            </>}
          
        </div>
        <div className={styles.clipButtons}>
          <div className={styles.panel1}>
            <button className={styles[selectButtonCSS]} onClick={handleSelectClick}>{isSelected ? 'Deselect' : 'Select'}</button>
            <button onClick={handlePreviewClick}>Preview</button>
            <button onClick={handleDownloadClick}>Download</button>
          </div>
          <div className={styles.panel2}>
            {isSelected ? <button onClick={handleSwapClick}>Swap</button> : null}
            {isSelected ? <button onClick={handleEditClick}>Edit</button> : null}
            {isSelected ? <button onClick={handleDeleteClick}>Delete</button> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClipComponent;