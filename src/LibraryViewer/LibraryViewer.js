import React, {useEffect, useRef} from "react";
import { channels } from '../shared/constants';
import './LibraryViewer.css'

function LibraryViewer(){
    
    let library = useRef([])
    useEffect(() => {
        
        window.api.receive(channels.RECEIVE_LIBRARY, (response) =>{
            response.items.map((song) => {library.current.push(song)});
            console.log(library.current)
            if(response.next !== null ){ //response.next !== null || 
                retrieveLibrarySlice(Object.keys(library.current).length)
            } else{
                
                window.api.send(channels.SAVE_DATA, {songList: library.current})

                for (let i = 0; i < library.current.length; i+=100) {
                    let queryString = ""
                    library.current.slice(i, i+100).map(entry => { queryString+= entry.track.id+","});
                    console.log(queryString)
                    console.log(library.current.slice(i, i+100))
                    
                    //window.api.send(channels.CALL_API, {method: "GET", params: {ids:hunSongs}, channel:channels.RECEIVE_FEATURES})
                };
                
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