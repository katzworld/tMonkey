// ==UserScript==
// @name         ETC is it worth it ?
// @namespace    http://tampermonkey.net/
// @version      112624
// @description  what is the current price of ETC in USD called from the blockscout and returned value and will show you the swap * etc in USD
// @author       KaTZWorlD
// @match        https://shwamp.tmwstw.io/*
// @icon         https://shwamp.tmwstw.io/src/duck.png
// @grant        GM_xmlhttpRequest
// @connect      https://etc.blockscout.com/api/*
// @updateURL    https://raw.githubusercontent.com/katzworld/tMonkey/main/etcworth.js
// @downloadURL  https://raw.githubusercontent.com/katzworld/tMonkey/main/etcworth.js
// ==/UserScript==

(function () {
    const etcOracle = 'https://etc.blockscout.com/api/v2/stats';
    const appendDivToThis = document.querySelector("#swap-page")

    // Function to fetch ETC price
    const fetchETCPrice = () => {
        GM_xmlhttpRequest({
            method: "GET",
            url: etcOracle,
            onload: function (response) {
                try {
                    const data = JSON.parse(response.responseText);
                    const etcUSD = data.coin_price;

                    // Create a div and append it to appendDivToThis if swapValue is valid
                    const etcPriceDiv = document.createElement('div');
                    etcPriceDiv.id = 'etc-price';
                    //updatePriceDiv(etcPriceDiv, etcUSD, swapValue);
                    appendDivToThis.appendChild(etcPriceDiv);
                    //put the value in the div and make it nice and clean visible and style 
                    etcPriceDiv.innerHTML = `<div style="background-color: green;  solid #ddd; padding: 10px; margin: 10px 0; border-radius: 15px; text-align: center; color: black;">ETC Price: $${etcUSD}</div>`;
                    const observer = new MutationObserver(() => {
                        const inputValue = document.querySelector("#swap-currency-output > div > div.SwapCurrencyInputPanel__InputRow-sc-eee9053-4.iXhZbq > div:nth-child(1)").innerHTML.split('value=')[1].split('"')[1]
                        const swapCurrencyText = document.querySelector("#swap-currency-output > div > div.SwapCurrencyInputPanel__InputRow-sc-eee9053-4.iXhZbq > div:nth-child(2) > div").innerText;
                        if (swapCurrencyText === 'ETC') {
                            observer.disconnect();
                            const swapValue = etcUSD * inputValue;
                            // console.log('swapValue:', swapValue);
                            // console.log('inputValue:', inputValue);
                            // console.log('etcUSD:', etcUSD);

                            etcPriceDiv.innerHTML = `<div style="background-color: green;  solid #ddd; padding: 10px; margin: 10px 0; border-radius: 15px; text-align: center; color: black;">ETC Price: $${etcUSD}</div>`;
                            etcPriceDiv.innerHTML += `<div style="background-color: green; solid #ddd; padding: 10px; margin: 10px 0; border-radius: 15px; text-align: center; color: black;">Swap Value: $${swapValue.toFixed(2)}</div>`;
                            // start the observer again
                            observer.observe(document.querySelector('#swap-currency-output'), { attributes: true, childList: true, subtree: true });
                        } else {

                            etcPriceDiv.innerHTML = `<div style="background-color: green;  solid #ddd; padding: 10px; margin: 10px 0; border-radius: 15px; text-align: center; color: black;">ETC Price: $${etcUSD}</div>`;
                        }

                    });

                    observer.observe(document.querySelector('#swap-currency-output'), { attributes: true, childList: true, subtree: true });

                } catch (error) {
                    console.error('Error parsing ETC price:', error);
                }
            },
            onerror: function (error) {
                console.error('Error fetching ETC price:', error);
            }
        });
    };
    fetchETCPrice();
})();