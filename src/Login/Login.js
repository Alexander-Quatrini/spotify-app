import React, { useEffect } from 'react';
import { channels } from '../shared/constants';

function Login(props) {

    let libraryData = null;

    useEffect(() => {
        window.api.receive(channels.RECEIVE_API, (response) =>{
            console.log(response);
            libraryData = response;
        })
    });

    return(
        <div className="login">
            <a href='http://localhost:5000/api/login' target='_blank'>Login</a>
            <input type="button" data-testid="library-load" value="Load Library!" onClick={loadLibrary}/>
        </div>
    );
}

function loadLibrary(){
    window.api.send(channels.CALL_API, {url: "/api/getlibrary", method: "GET", isBody: false, channel: channels.RECEIVE_API});
}

export default Login;