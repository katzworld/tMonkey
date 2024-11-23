// ==UserScript==
// @name         builders of the world UI 
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  add images to the builder UI 
// @author       KaTZWorlD
// @match        https://build.tmwstw.io/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tmwstw.io
// @grant        GM_xmlhttpRequest
// @connect      https://play.tmwstw.io/*
// @updateURL    https://raw.githubusercontent.com/katzworld/tMonkey/main/builderUI.js
// @downloadURL  https://raw.githubusercontent.com/katzworld/tMonkey/main/builderUI.js
// ==/UserScript==

(function () {
    'use strict';

    ////////////////////
    // Builder front page rework
    ///////////////////////

    // Function to handle mutations
    const handleMutations = (entries, observer) => {
        observer.disconnect();
        globalTrot(entries[0].target.childNodes);
    };

    // Setup MutationObserver
    const setupObserver = (targetSelector, config) => {
        const target = document.querySelector(targetSelector);
        if (target) {
            const observer = new MutationObserver((entries) => handleMutations(entries, observer));
            observer.observe(target, config);
        } else {
            console.error(`Target element for ${targetSelector} not found.`);
        }
    };

    // Configuration for MutationObserver
    const configOfPlotas = {
        childList: true,
        subtree: true,
    };

    // Observe the target elements
    setupObserver("#plots_with_builds_cont", configOfPlotas);
    setupObserver("#select_plot_in_ownership_cont", configOfPlotas);

    let names = [];

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
                names = response.response;
            }
        });
    };

    fetchNamedPlats();

    let housing = `<img src='https://tmwttw.imamkatz.com/building-1062.png'>`
    let globalTrot = (entries) => {
        document.querySelector('#plots_in_ownership_title').innerHTML = `${housing} Select from plots with buildings in ownership ${housing}`;

        entries.forEach((entry, index) => {
            if (index === 0) return;

            let plotas = entry.textContent.split('_')[1] || entry.textContent;
            let imageUrl;

            if (plotas) {
                if (entry.textContent.split('_')[1]) {
                    imageUrl = `url('https://meta.tmwstw.io/preview_plots_${plotas}.jpg')`;
                } else {
                    let nameIndex = names.indexOf(plotas) + 1;
                    imageUrl = `url('https://meta.tmwstw.io/preview_plots_${nameIndex}.jpg')`;
                }

                entry.textContent = '';
                entry.style.backgroundImage = imageUrl;
                entry.style.width = '150px';
                entry.style.height = '150px';
                entry.style.backgroundSize = '150px 150px';
            }
        });
    }

})();