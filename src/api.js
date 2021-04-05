import * as Utils from '@/utils';

export let TOKEN;
export let U_ID;

export function init({ auth, id }) {
  TOKEN = auth;
  U_ID = id;
}

export async function login(username, password) {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  try {
    let response = await fetch('https://api.manfi.ru/api/users/login/', {
      method: 'POST',
      headers: {
        'cache-control': 'no-cache',
      },
      body: formData,
    });

    let result = (await response.json()) || {};
    if (result.err_core == '' || result.err_core == undefined) {
      return result.data;
    }
  } catch (e) {
    console.log(e);
  }
}

export function activate() {
  // ???
}

export async function partnersList() {
  try {
    let response = await fetch(`https://api.manfi.ru/api/getpartner/list/`, {
      method: 'GET',
      headers: {
        'cache-control': 'no-cache',
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    let result = (await response.json()) || {};
    if (
      (result.err_core == '' || result.err_core == undefined) &&
      result.data
    ) {
      return result.data.partners;
    }
  } catch (e) {
    return;
  }
}

export async function partners(url) {
  try {
    let response = await fetch(
      `https://api.manfi.ru/api/getpartner/domain/?url=${url}`,
      {
        method: 'GET',
        headers: {
          'cache-control': 'no-cache',
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    let result = (await response.json()) || {};
    console.log(result);
    if (
      (result.err_core == '' || result.err_core == undefined) &&
      result.data
    ) {
      return result.data.partners;
    }
  } catch (e) {
    console.log(e);
  }
}

export async function track(code) {
  const result = {
    events: [],
  };
  try {
    let response = await fetch(
      `https://api.manfi.ru/api/pochtarf/percelhistory/?track_id=${code}`,
      {
        method: 'GET',
        headers: {
          'cache-control': 'no-cache',
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    response = await response.json();

    if (response) {
      response = response.data;
    }

    if (!response) return result;

    const history = response.history; // array

    if (history == undefined || history['0'] == undefined) return undefined;

    let op = history[0];
    let start = new Date(op.OperationParameters.OperDate);
    let end;

    result.status = response.OperType;
    result.type = response.MailType;
    result.from = op.AddressParameters.OperationAddress.Description;
    result.to = response.DestinationAddress;
    result.weight = response.Mass;

    for (let i in history) {
      op = history[i];
      let address = op.AddressParameters.OperationAddress;

      if (address) {
        address = address.Description;
      }

      let date = new Date(op.OperationParameters.OperDate);
      end = date;

      result.events.push({
        type: op.OperationParameters.OperType.Name,
        date: getDate(date),
        time: getTime(date),
        address,
      });
    }

    result.days = Math.round((end - start) / (1000 * 60 * 60 * 24));

    result.events.reverse();

    return result;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export async function deplinkFromPartners(url) {
  let list = await partners(url);
  if (!list) return;

  let prevPartners = (await Utils.getAsync('partners')) || {};

  for (const i in list) {
    const item = list[i];
    const prev = prevPartners[i];

    if (prev) continue;

    const dep = await deplink(item.link, item.pid);
    if (dep) {
      item.link = dep.url;
      prevPartners[i] = item;
    }
  }

  await Utils.setAsync('partners', prevPartners);

  return prevPartners;
}

export async function deplink(original_url, pId) {
  try {
    const url = new URL('https://api.manfi.ru/api/affiliates/deeplinkgen/');
    const params = { original_url, uId: U_ID, pId };
    url.search = new URLSearchParams(params).toString();
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'cache-control': 'no-cache',
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    let result = (await response.json()) || {};

    if (result.err_core == '' || result.err_core == undefined) {
      return result.data;
    }
  } catch (e) {
    console.log(e);
  }
}

export async function curencyRate(base) {
  try {
    let response = await fetch(
      `https://api.exchangeratesapi.io/latest?base=${base}`
    );
    return await response.json();
  } catch (e) {
    console.log(e);
  }
}

export async function userInfo() {
  try {
    let response = await fetch('https://api.manfi.ru/api/users/user/', {
      method: 'GET',
      headers: {
        'cache-control': 'no-cache',
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    let result = (await response.json()) || {};

    if (result.err_core == '' || result.err_core == undefined) {
      return result.data;
    }
  } catch (e) {
    console.log(e);
  }
}

export async function percelsAsync() {
  try {
    let response = await fetch(
      'https://api.manfi.ru/api/pochtarf/percelslist/',
      {
        method: 'GET',
        headers: {
          'cache-control': 'no-cache',
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    let result = (await response.json()) || {};

    if (result.err_core == '' || result.err_core == undefined) {
      return result.data.percels;
    }
  } catch (e) {
    console.log(e);
    return [];
  }
}

export async function removePercel(id) {
  try {
    await fetch(`https://api.manfi.ru/api/pochtarf/perceldelete/`, {
      method: 'POST',
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ id }),
    });
  } catch (e) {
    console.log(e);
  }
}

export async function addPercel(track_id) {
  try {
    await fetch(`https://api.manfi.ru/api/pochtarf/perceladd/`, {
      method: 'POST',
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ track_id }),
    });
  } catch (e) {
    console.log(e);
  }
}

export async function notifications() {
  try {
    let response = await fetch(`https://api.manfi.ru/api/notifications/data/`, {
      method: 'GET',
      headers: {
        'cache-control': 'no-cache',
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    let result = (await response.json()) || {};
    if (
      (result.err_core == '' || result.err_core == undefined) &&
      result.data
    ) {
      return result.data.partners;
    }
  } catch (e) {
    console.log(e);
  }
}

export async function alicomission(url) {
  const formData = new FormData();
  formData.append('original_url', url);

  try {
    let response = await fetch(
      'https://api.manfi.ru/api/affiliates/alicommission/',
      {
        method: 'POST',
        headers: {
          authorization: 'Bearer ' + TOKEN,
          'cache-control': 'no-cache',
        },
        body: formData,
      }
    );

    let result = (await response.json()) || {};
    if (result.err_core == '' || result.err_core == undefined) {
      return result.data;
    }
  } catch (e) {
    console.log(e);
  }
}

export async function testAff(urlStore, pId) {
  let original_url = await deplink(urlStore, pId);

  if (original_url) original_url = original_url.url;
  let res = {
    url: original_url,
    aff: false,
  };
  try {
    const url = new URL('https://api.manfi.ru/api/affiliates/validatelinks/');
    url.search = new URLSearchParams({ original_url }).toString();
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'cache-control': 'no-cache',
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    let result = (await response.json()) || {};

    if (result.err_code == '' || result.err_code == undefined) {
      res.aff = result.data.message != undefined;
    }
  } catch (e) {
    // console.log(e);
  }

  return res;
}

function getDate(date) {
  return (
    pad(date.getDate()) + '.' + pad(date.getMonth()) + '.' + date.getFullYear()
  );
}

function getTime(date) {
  return pad(date.getHours()) + ':' + pad(date.getMinutes());
}

function pad(v) {
  return ('0' + v).slice(-2);
}
