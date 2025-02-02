// ==UserScript==
// @name         Clocks and Blocks
// @namespace    http://tampermonkey.net/
// @version      V1.87
// @description  Clocks and blocks with surronding plats zombies nodes and more
// @author       KaTZWorlD #370
// @match        https://play.tmwstw.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tmwstw.io
// @grant        GM_xmlhttpRequest
// @connect      https://clock.imamkatz.com/*
// @connect      https://api.tmwstw.io/*
// @updateURL    https://raw.githubusercontent.com/katzworld/tMonkey/main/clocks_blocks.js
// @downloadURL  https://raw.githubusercontent.com/katzworld/tMonkey/main/clocks_blocks.js
// ==/UserScript==

(function () {
    'use strict';
    const div = document.createElement('div');
    div.id = 'tMFilm';
    div.style = 'display: none;';
    document.querySelector("#title_container").appendChild(div);
    // add another div below the film div to display the block number
    const blockDiv = document.createElement('div');
    blockDiv.id = 'blockNumber';
    blockDiv.style = 'display: block;';
    document.querySelector("#title_container").appendChild(blockDiv);


    let BOB = [], SLAG = [], GREASE = [], INK = [];
    let SLAGMID = [], GREASEMID = [], INKMID = [];
    let BONUS = []
    let namesPlats = [];
    let averageBlockTime = '13000' //got something to start with
    let claimsPlats = [];
    let blockStart = null;
    let close, touching, folgers
    let ZOMBE_PLATS = [1100, 4076, 3998, 1316, 5407, 6368, 3886, 7302, 9976, 7673, 6358, 4106, 2320, 1540, 739, 4434, 6469, 392, 6178, 1228, 3948, 7438, 4395, 459, 1951, 4150, 3099, 415, 6522, 9710, 2827, 6000, 4992, 5797, 508, 8668, 3814, 7747, 1684, 6869, 4173, 4575, 1405, 7510, 7930, 7416, 806, 3958]
    /**
     * Fetch data from the API and log the response.
     * @param {string} state - The state to fetch (bob, slag, grease, ink).
     * @param {Function} callback - The callback function to handle the response.
     */
    const fetchData = (state, callback) => {
        const url = `https://api.tmwstw.io/faucet_state=${state}`;
        GM_xmlhttpRequest({
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            responseType: 'json',
            url: url,
            onload: function (response) {
                const data = response.response;
                //console.log(`Fetched data for ${state}:`, data);
                callback(data);
            }
        });
    };

    /**
     * Fetch data from the API for mid states and log the response.
     * @param {string} state - The state to fetch (slag, ink, grease).
     * @param {Function} callback - The callback function to handle the response.
     */
    const fetchMids = (state, callback) => {
        const url = `https://api.tmwstw.io/faucet_state_mid=${state}`;
        GM_xmlhttpRequest({
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            responseType: 'json',
            url: url,
            onload: function (response) {
                const data = response.response;
                //console.log(`Fetched mid data for ${state}:`, data);
                callback(data);
            }
        });
    };
    const states = ['bob', 'slag', 'grease', 'ink'];
    const midStates = ['slag', 'grease', 'ink'];

    function updateStateData(state, isMidState = false) {
        const fetchFunction = isMidState ? fetchMids : fetchData;

        const stateMapping = {
            bob: { array: BOB, isMidState: false },
            slag: { array: SLAG, isMidState: false },
            grease: { array: GREASE, isMidState: false },
            ink: { array: INK, isMidState: false },
            slagMid: { array: SLAGMID, isMidState: true },
            greaseMid: { array: GREASEMID, isMidState: true },
            inkMid: { array: INKMID, isMidState: true }
        };

        fetchFunction(state, (data) => {
            const key = isMidState ? `${state}Mid` : state;
            if (stateMapping[key]) {
                stateMapping[key].array.length = 0; // Clear existing array
                stateMapping[key].array.push(...data.map(item => item[0]));
            }
            data.forEach(item => {
                if (item[1] !== 0) {
                    if (claimsPlats.includes(item[0])) {
                        BONUS.push(item[0]);
                    } else {
                        claimsPlats.push(item[0]);
                    }
                }
            });
        });
    }

    function updateStatesData() {
        states.forEach(state => {
            updateStateData(state);
        });

        midStates.forEach(state => {
            updateStateData(state, true);
        });
    }

    // Fetch named plats
    const fetchNamedPlats = () => {
        const url = 'https://play.tmwstw.io/data/names.json';
        GM_xmlhttpRequest({
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            responseType: 'json',
            url: url,
            onload: function (response) {
                namesPlats = response.response;
            }
        });
    };

    //setup the data

    fetchNamedPlats();

    updateStatesData();

    const watcherOfMap = new MutationObserver((entries, observer) => {
        observer.disconnect(); // Stop observing
        whatsLocal();
    });

    const arrrrgMap = document.querySelector('#plot_owner');
    const listMap = {
        childList: true,
    };
    if (arrrrgMap) {
        watcherOfMap.observe(arrrrgMap, listMap);
    } else {
        console.error('Target element for watcherOfMap not found.');
    }

    // Updated whatsLocal function
    function whatsLocal() {
        const plat = document.getElementById('plot_id').lastChild.textContent.slice(-4).replace('#', '').replace(' ', '');

        if (plat) {
            const surPlats = 'https://clock.imamkatz.com/platall/' + plat; // close touching + 1
            //const surPlats = 'https://clock.imamkatz.com/surround/' + plat;  // close touching + 2 from postbox source code
            GM_xmlhttpRequest({
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                responseType: 'json',
                url: surPlats,
                onload: function (response) {
                    close = response.response;
                    //console.log(close);
                    checkPlats();
                    // Reconnect the observer after the function is executed
                    watcherOfMap.observe(arrrrgMap, listMap);
                }
            });
        }
        if (plat) {
            const surPlats = 'https://clock.imamkatz.com/plat/' + plat;
            GM_xmlhttpRequest({
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                responseType: 'json',
                url: surPlats,
                onload: function (response) {
                    touching = response.response;
                    //console.log(touching);
                    checkPlats();
                    // Reconnect the observer after the function is executed
                    watcherOfMap.observe(arrrrgMap, listMap);
                }
            });
        }

        if (plat) {
            // Fetch faucet data from the
            const folgerurl = 'https://clock.imamkatz.com/folgers';
            GM_xmlhttpRequest({
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                responseType: 'json',
                url: folgerurl,
                onload: function (response) {
                    folgers = response.response.filterPlots;
                    //console.log(folgers)
                    checkPlats();
                    // Reconnect the observer after the function is executed
                    watcherOfMap.observe(arrrrgMap, listMap);
                },
            });
        }

        function checkPlats() {
            if (close !== undefined && touching !== undefined && folgers !== undefined && BONUS !== undefined && ZOMBE_PLATS !== undefined) {
                //console.log('close: ' + close, 'touching: ' + touching);
                showFilmContent(close, touching, folgers, claimsPlats, BONUS, ZOMBE_PLATS);
            }
        }
    }

    // Function to fetch block number and display it
    function fetchBlockNumberAndDisplay() {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://etc.blockscout.com/api/v2/main-page/blocks",
            headers: {
                "Content-Type": "application/json"
            },
            onload: function (response) {
                const jsonResponse = JSON.parse(response.responseText);
                const blockData = jsonResponse[0]; // Assuming the response is an array and we need the first element
                const blockHeight = blockData.height;

                // Store the initial block height if not already set
                if (blockStart === null) {
                    blockStart = blockHeight;
                    //console.log('setting blockStart:' + blockStart)
                }

                // Function to apply styles to the blockDiv
                const applyBlockDivStyles = (blockDiv, blockHeight, message) => {
                    blockDiv.innerHTML = ''; // Clear existing content
                    blockDiv.style.display = 'block';
                    blockDiv.style.color = 'white';
                    blockDiv.style.fontSize = '20px';
                    blockDiv.style.padding = '10px';
                    blockDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                    blockDiv.textContent = `ETC Block # ${blockHeight} ${message}`;

                    // Create and append the iframe element
                    const iframe = document.createElement("iframe");
                    iframe.src = "https://tmwttw.imamkatz.com/Tracker/framer.html";
                    iframe.width = "100%";
                    iframe.height = "175px";
                    // iframe.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                    blockDiv.appendChild(iframe);
                    //console.log(claimsPlats);
                };

                // Check if 100 blocks have passed since the initial block height
                if (blockHeight >= blockStart + 100) {
                    const blockDiv = document.getElementById('blockNumber');
                    applyBlockDivStyles(blockDiv, blockHeight, `:: ClaimsPlats data is OLD! :: Refreshing... `);
                    blockDiv.style.color = 'red';
                    updateStatesData();
                    //set new blockStart to current blockHeight and update the blocktime average 
                    fetchBlockTime()
                    blockStart = blockHeight;
                    console.log('new block data fetched');

                    return;
                }
                const blockDiv = document.getElementById('blockNumber');
                applyBlockDivStyles(blockDiv, blockHeight, `Average Block Time: ${averageBlockTime.toString().slice(0, 2)} sec(s) -=- blockStart: ${blockStart}`);
                showFilmContent(close, touching, folgers, claimsPlats, BONUS, ZOMBE_PLATS)
            }
        });
    }

    // Function to display film content
    function showFilmContent(r, underline, folgers, readyclaims, bonus, zombePlats) {
        const filmDiv = document.getElementById('tMFilm');
        filmDiv.innerHTML = ''; // Clear existing content
        filmDiv.style.display = 'block';
        filmDiv.style.color = 'white';
        filmDiv.style.fontSize = '20px';
        filmDiv.style.padding = '10px';
        filmDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        // Split r string into array named rplats
        let rplats = r.replace('[', '').replace(']', '').split(',').map(Number);

        const styles = {
            BOB: { color: 'yellow', fontWeight: 'bold', text: 'Bob 20 ' },
            SLAGMID: { color: 'darkred', text: 'Slag 16 ' },
            SLAG: { color: 'red', fontWeight: 'bold', text: 'Slag 25 ' },
            GREASEMID: { color: 'darkgreen', text: 'Grease 150+ ' },
            GREASE: { color: 'green', fontWeight: 'bold', text: 'Grease 200+ ' },
            INKMID: { color: 'darkblue', text: 'Ink 90+ ' },
            INK: { color: 'blue', fontWeight: 'bold', text: 'Ink 150+ ' },
            FOLGERS: { color: 'orange', fontWeight: 'bold', text: 'UNTAPPED ' },
            CLAIMS: { fontWeight: 'bold', text: ' * ' },
            BONUS: { color: 'white', fontWeight: 'bold', text: ' !! ' },
            ZOMBE: { color: 'black', backgroundColor: 'white', text: 'ZOMBIE ' }
        };

        const applyStyles = (plat, name) => {
            let style = { text: `${plat} ${name}` };
            if (BOB && BOB.includes(plat)) style = { ...styles.BOB, text: `${plat} ${name} - ${styles.BOB.text} ` };
            if (SLAGMID && SLAGMID.includes(plat)) style = { ...styles.SLAGMID, text: `${plat} ${name} - ${styles.SLAGMID.text} ` };
            if (SLAG && SLAG.includes(plat)) style = { ...styles.SLAG, text: `${plat} ${name} - ${styles.SLAG.text} ` };
            if (GREASEMID && GREASEMID.includes(plat)) style = { ...styles.GREASEMID, text: `${plat} ${name} - ${styles.GREASEMID.text} ` };
            if (GREASE && GREASE.includes(plat)) style = { ...styles.GREASE, text: `${plat} ${name} - ${styles.GREASE.text} ` };
            if (INKMID && INKMID.includes(plat)) style = { ...styles.INKMID, text: `${plat} ${name} - ${styles.INKMID.text} ` };
            if (INK && INK.includes(plat)) style = { ...styles.INK, text: `${plat} ${name} - ${styles.INK.text} ` };
            if (folgers && folgers.includes(plat)) style = { ...styles.FOLGERS, text: `${plat} ${name} - ${styles.FOLGERS.text} ` };
            if (readyclaims && readyclaims.includes(plat)) style = { ...style, text: `${style.text} ${styles.CLAIMS.text}` }; // Append CLAIMS text
            if (bonus && bonus.includes(plat)) style = { ...style, text: `${style.text} ${styles.BONUS.text}` }; // Append BONUS text
            if (zombePlats && zombePlats.includes(plat)) style = { ...styles.ZOMBE, text: `${plat} ${name} - ${styles.ZOMBE.text} ` }; // Append ZOMBE text
            // separate each with a , if more than one style is applied to the plat name apply all then add comma at the end
            style.text = style.text + ', ';

            return style;
        };

        rplats.forEach(plat => {
            const name = plat < namesPlats.length ? namesPlats[plat - 1] : '';
            const style = applyStyles(plat, name);

            // Only create span if style color is defined
            if (style.color) {
                const span = document.createElement('span');
                span.style.color = style.color;
                span.style.fontWeight = style.fontWeight || '';
                span.style.backgroundColor = style.backgroundColor || '';
                span.textContent = style.text;

                if (underline.includes(plat)) {
                    span.style.textDecoration = 'underline';
                }

                filmDiv.appendChild(span);
            }
        });

    }

    function fetchBlockTime() {
        GM_xmlhttpRequest({
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            responseType: 'json',
            url: 'https://etc.blockscout.com/api/v2/stats',
            onload: function (response) {
                averageBlockTime = Number(response.response.average_block_time)
                console.log('setting average block:' + averageBlockTime)
            }
        });
    }

    fetchBlockTime()
    // Start a timer to run fetchBlockNumberAndDisplay every fetchblockTime :)
    setInterval(() => {
        const filmDiv = document.getElementById('tMFilm');
        if (filmDiv) {
            fetchBlockNumberAndDisplay(filmDiv);
        }
    }, averageBlockTime);


})();
