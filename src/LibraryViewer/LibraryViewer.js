import React, {useEffect, useRef} from "react";
import { channels } from '../shared/constants';
import './LibraryViewer.css'

function LibraryViewer(props){
    
    let library = props.library
    

    return(
        <div className="library-viewer">
            <ul>{library.map((entry) => {
                return( <li>{entry.track.name}</li>)
            })}</ul>
        </div>
    );


}
export default LibraryViewer;