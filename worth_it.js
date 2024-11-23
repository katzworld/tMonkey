// ==UserScript==
// @name         is it worth it ?
// @namespace    http://tampermonkey.net/
// @version      2024-01-27
// @description  what is the current price of ETC in USD called from the blockscout and returned value and will show you the swap * etc in USD
// @author       KaTZWorlD
// @match        https://shwamp.tmwstw.io/*
// @icon         https://shwamp.tmwstw.io/src/duck.png
// @grant        GM_xmlhttpRequest
// @connect      https://etc.blockscout.com/api/*
// @updateURL    https://raw.githubusercontent.com/katzworld/tMonkey/main/worth_it.js
// @downloadURL  https://raw.githubusercontent.com/katzworld/tMonkey/main/worth_it.js
// ==/UserScript==

(function () {
    const etcOracle = 'https://etc.blockscout.com/api/v2/stats';
    const appendDivToThis = document.querySelector("#liqudity_contrls_cont");

    // Function to fetch ETC price
    const fetchETCPrice = () => {
        GM_xmlhttpRequest({
            method: "GET",
            url: etcOracle,
            onload: function (response) {
                try {
                    const data = JSON.parse(response.responseText);
                    const etcUSD = data.coin_price;

                    // Check if #output_chain contains '$ETC'
                    const outputChainText = document.querySelector("#output_chain").textContent;
                    let swapValue = 0;
                    if (outputChainText.includes('$ETC')) {
                        swapValue = calculateSwapValue(etcUSD);
                    }

                    // Create a div and append it to appendDivToThis if swapValue is valid
                    const etcPriceDiv = document.createElement('div');
                    etcPriceDiv.id = 'etc-price';
                    updatePriceDiv(etcPriceDiv, etcUSD, swapValue);
                    appendDivToThis.appendChild(etcPriceDiv);

                    // Add MutationObserver to update swap value on text content change
                    const swapInputTo = document.querySelector("#swap_input_to");
                    const observer = new MutationObserver(() => {
                        swapValue = calculateSwapValue(etcUSD);
                        updatePriceDiv(etcPriceDiv, etcUSD, swapValue);
                    });
                    observer.observe(swapInputTo, { childList: true, subtree: true, characterData: true });

                } catch (error) {
                    console.error('Error parsing ETC price:', error);
                }
            },
            onerror: function (error) {
                console.error('Error fetching ETC price:', error);
            }
        });
    };

    // Call the function to fetch ETC price
    fetchETCPrice();

    function calculateSwapValue(etcUSD) {
        const outputChainText = document.querySelector("#output_chain").textContent;
        let swapValue = 0;
        if (outputChainText.includes('$ETC')) {
            swapValue = Number(document.querySelector("#swap_input_to").textContent) * etcUSD;
            console.log('swapValue:', swapValue.toFixed(2));
        }
        return swapValue;
    }

    function updatePriceDiv(div, etcUSD, swapValue) {
        if (!isNaN(swapValue) && swapValue > 0) {
            div.textContent = `ETC Price: $${etcUSD}\nSwap Value: $${swapValue.toFixed(2)}`;
        } else {
            div.textContent = `ETC Price: $${etcUSD}`;
        }
        div.style.color = 'white';
        div.style.fontSize = '20px';
        div.style.fontWeight = 'bold';
        div.style.padding = '10px';
    }
})();