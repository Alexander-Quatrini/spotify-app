import React, {useEffect, useRef} from "react";
import { channels } from '../shared/constants';
import './LibraryViewer.css'

function LibraryViewer(){
    
    let library = useRef([])
    useEffect(() => {
        
        window.api.receive(channels.RECEIVE_LIBRARY, (response) =>{
            response.items.map((song) => {library.current.push(song)});
            console.log(library.current)
            if(response.next !== null){
                retrieveLibrarySlice(Object.keys(library.current).length)
            } else{
                window.api.send(channels.SAVE_DATA, {songList: library.current})
            }
        });

    }, []);

    return(
        <div className="library-viewer">
            <button onClick={(e) => {library.current = []; retrieveLibrarySlice(0)}}>Nice</button>
            <ul>{library.current.map((entry) => {
                return( <li>{entry.track.name}</li>)
            })}</ul>
        </div>
    );
}

function retrieveLibrarySlice(offsetBy){
    window.api.send(channels.CALL_API, {url: "/api/getLibrarySlice", method: "GET", isBody: false, params: {
        limit: 50,
        offset: offsetBy,
    }, channel: channels.RECEIVE_LIBRARY})
}

export default LibraryViewer;