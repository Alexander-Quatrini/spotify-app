import React, {useEffect, useState, useRef} from "react";
import { channels } from "../shared/constants";
import LibraryViewer from "../LibraryViewer/LibraryViewer";


function DashBoard(props){

    const [username, setUsername] = useState('default');
    const [currentlyPlaying, setCurrentlyPlaying] = useState({})
    const [queue, setQueue] = useState([])
    const [currentlyPlayingStats, setCurrentlyPlayingStats] = useState('default')

    const time1 = 1
    let library = useRef([])
    const initialized = useRef(false);
    if(!initialized.current){
        initialized.current = true;
        getUserInfo();
    }

    useEffect(() => {
        
        setInterval(() => {
            getUserInfo();
            //only implement the listen counter in electron.js once its built
            
            //MAKE SURE THAT YOU DONT KEEP LOGGING THE SAME SONG OVER AND OVER WHILE ITS STILL PLAYING
            /*
            if(currentlyPlayingStats.progress_ms > (currentlyPlaying.duration_ms/2)){
            let songInfo = currentlyPlaying.id + "," + currentlyPlaying.name;
            window.api.send(channels.SAVE_DATA_STATS, {songList: songInfo})
            */
            
        }, 30000);
        
        window.api.receive(channels.RECEIVE_CURRENTLY_PLAYING, (response) =>{
            setCurrentlyPlayingStats(response.progress_ms)
            console.log(response.progress_ms);
            
        });

        window.api.receive(channels.RECEIVE_USER, (response) =>{
            console.log(response);
            setUsername(response['display_name'])
        });
        
        window.api.receive(channels.RECEIVE_QUEUE, (response) =>{

            console.log(response);
            console.log(response.queue);
            setQueue(response.queue);
            if(response.currently_playing != null){
                setCurrentlyPlaying(response.currently_playing);
            }

        })

        window.api.receive(channels.RECEIVE_LIBRARY, (response) =>{
            response.items.map((song) => {library.current.push(song)});
            console.log(library.current)
            if(response.next !== null ){ //response.next !== null || 
                retrieveLibrarySlice(Object.keys(library.current).length)
            } else{
                //once we have reached this part of the loop which WILL happen once the full song list has been achieved
                //this will save the data locally in electron.js

                window.api.send(channels.SAVE_DATA, {songList: library.current})

                //this is where we split the full library we recieved and comma delimit the full list and send it in 100 id chunks 
                //we are doing this bc we want to grab the song features
                //we are using the "get several song feautres" end point which reqiures song ids to be comma delimited

                // we are not yet calling for the feautres
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
        <div>
            <h1>{currentlyPlaying.name}</h1>
            
            <p data-testid="username">{username}</p>
            <button onClick={getUserInfo}>Nicce</button>
            <ul className="list-group">{queue !== undefined && queue.length > 0 ? (queue.map((value) => {
                return (<li className="list-group-item">{value.name}</li>)
            })) : <li>Nothing in Queue!</li>}
            
            </ul>
            <button onClick={e => {retrieveLibrarySlice(0)}}>Library</button>
            <button onClick={e => {saveStats(currentlyPlaying.id, currentlyPlaying.name);console.log(currentlyPlaying.id,currentlyPlaying.name)}}>Stats</button>
            
            <LibraryViewer library={library.current}/>           
            
        </div>
    )
}

function getUserInfo(){
    window.api.send(channels.CALL_API, {url: "/api/getuserinfo", method: "GET", isBody: false, channel: channels.RECEIVE_USER});
    window.api.send(channels.CALL_API, {url: "/api/getqueue", method: "GET", isBody: false, channel: channels.RECEIVE_QUEUE});
    window.api.send(channels.CALL_API, {url: "/api/getCurrentlyPlaying", method: "GET", isBody: false, channel: channels.RECEIVE_CURRENTLY_PLAYING});
}

function retrieveLibrarySlice(offsetBy){
    window.api.send(channels.CALL_API, {url: "/api/getLibrarySlice", method: "GET", isBody: false, params: {
        limit: 50,
        offset: offsetBy,
    }, channel: channels.RECEIVE_LIBRARY})
}

function saveStats(id, name){
    window.api.send(channels.SAVE_DATA_STATS, {song_id: id, song_name: name})
    console.log(id, name)

}

export default DashBoard;