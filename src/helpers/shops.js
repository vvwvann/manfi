import * as Utils from "@/utils";
import * as Ali from "../stores/aliexpress";

let _sessions = {};
let _deletes = {};

chrome.runtime.onMessageExternal.addListener(function(
  request,
  sender,
  senderResponse
) {
  console.log({ sender, senderResponse });
  switch (request.type) {
    case "orderInfo": {
      const id = request.sessionId;
      if (_deletes[id]) return;

      _sessions[id] = request.data;

      console.log("order:", request.data);
      break;
    }
  }

  //if(!validate(request.sender)) // Check the URL with a custom function
  //return;
  /* do work */
});

export async function orderInfoAsync(store, tabUrl, sessionId) {
  let info;
  console.log({ store, tabUrl, sessionId });
  switch (store) {
    case "aliexpress": {
      executeScript(sessionId);
      let data;
      for (let i = 0; i < 5; i++) {
        await Utils.delayAsync(500);
        data = _sessions[sessionId];
        if (data) break;
      }
      if (data) info = await Ali.getInfo(data, tabUrl);
      _deletes[sessionId] = true;
      delete _sessions[sessionId];
      break;
    }
    case "lamoda":
      info = await lamodaInfo(tabUrl);
      break;
  }

  return info;
}

function executeScript(sessionId) {
  const code = `
  if(chrome && chrome.runtime && chrome.runtime.sendMessage && window.runParams && window.runParams.data) {
    chrome.runtime.sendMessage(
      "${chrome.runtime.id}",
      {
        type: 'orderInfo',
        data: window.runParams.data,
        sessionId: ${sessionId}
      });
  }
  `;
  chrome.tabs.executeScript(null, {
    code: `
    function injectScript(node) {
      var th = document.getElementsByTagName(node)[0];
      var s = document.createElement('script');
      s.appendChild(document.createTextNode(\`${code}\`));
      th.appendChild(s);
    }    
    injectScript('body');
    `,
  });
}

// lamoda

async function lamodaInfo(percent, tabUrl) {
  let response = await fetch(tabUrl);
  let data = await response.text();
  let image = "";

  let regExp = /property="og:image" content="(.*?)"/;
  let matches = regExp.exec(data);
  image = matches != null ? matches[1].trim() : null;

  regExp = /property="og:description" content="(.*?)"/;
  matches = regExp.exec(data);
  let description = matches != null ? matches[1].trim() : null;

  let sum;
  if (percent > 0) {
    regExp = /current: '(.*?)'/;
    matches = regExp.exec(data);
    sum = matches != null ? matches[1].trim() : null;

    if (sum) {
      regExp = /currency: '(.*?)'/;
      matches = regExp.exec(data);

      let currency = matches != null ? matches[1].trim() : null;

      if (currency) {
        sum = (parseFloat(sum) * percent).toFixed(2);

        sum = isNaN(sum) ? undefined : sum + " " + currency;
      }

      console.log("price", sum, currency);
    }
  }

  console.log("price", sum);

  return {
    description,
    image,
    sum,
  };
}
