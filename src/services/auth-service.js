const keytar = require('keytar');

const keytarService = 'electron-openid-oauth';

let accessToken = null;

function getAccessToken(username, func){
        keytar.getPassword(keytarService, username).then(result => {
            func(result);
        }).catch(error => {
            console.log(error);
        });
}
    
function storeAuthCredentials(username, url){
    accessToken = parseURL(url);
    keytar.setPassword(keytarService, username, accessToken).catch(error => {
        console.log(error);
    });
}

function deleteAuthCredentials(username){
    return keytar.deletePassword(keytarService, username).catch(error => {
        console.log(error);
    });
}

function parseURL(urlString){
    const url = new URL(urlString);
    return url.hostname;   
}

module.exports = {
    parseURL,
    storeAuthCredentials,
    getAccessToken,
    deleteAuthCredentials,
}