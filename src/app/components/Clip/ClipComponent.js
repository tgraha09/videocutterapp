import { formatDuration } from '@/app/utils/utils';
import React, { useState, useEffect } from 'react';
import styles from './ClipComponent.module.css';

const ClipComponent = ({ clip, idx, swapClip, clips, selectedClipIndex, setSelectedClipIndex, previewClip }) => {
  const [isSelected, setIsSelected] = useState(false);

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
      //setIsSelected(false);
    }
  };

  const handleDeleteClick = () => {
    if (selectedClipIndex !== null) {
      const newClips = [...clips];
      newClips.splice(selectedClipIndex, 1);
      swapClip(newClips);
      setSelectedClipIndex(null);
      
    }
  };

  const handlePreviewClick = () => {
    // Code to preview the selected clip goes here\
    //const selectedClip = clips[idx];
    console.log("handlePreviewClick", {clip, idx});
    
    previewClip({...clip, idx});
    
    //console.log(selectedClip);
  };

  const selectButtonCSS = isSelected ?  'select-buttonSelected': 'select-button';
//[selectButtonCSS]
  return (
    <div className={styles.clip}>
      <h4>Clip {idx + 1}</h4>
      <div className={styles.clipInfo}>
        <div className={styles.clipMarkers}>
          <p>Start: {formatDuration(clip.start)}</p>
          <p>End: {formatDuration(clip.end)}</p>
        </div>
        <div className={styles.clipButtons}>
          <button className={styles[selectButtonCSS]} onClick={handleSelectClick}>{isSelected ? 'Deselect' : 'Select'}</button>
          <button onClick={handlePreviewClick}>Preview</button>
          {isSelected ? <button onClick={handleSwapClick}>Swap</button> : null}
          {isSelected ? <button onClick={handleDeleteClick}>Delete</button> : null}
        </div>
      </div>
    </div>
  );
};

export default ClipComponent;