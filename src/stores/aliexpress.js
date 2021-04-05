import * as Api from '@/api';
import * as Utils from '@/utils';

export async function getInfo(data, tabUrl) {
  console.log('data:', data);

  let storeId = data.storeModule.storeNum;
  let image = data.imageModule.imagePathList[0];
  let checkUrl = tabUrl;

  if (storeId != null) {
    checkUrl =
      'https://feedback.aliexpress.com/display/evaluationDetail.htm?storeId=' +
      storeId;
  }

  let rait;
  let ownerMemberId = data.storeModule.sellerAdminSeq;
  let description = data.pageModule.title;

  const alicomission = await Api.alicomission(tabUrl);

  let sum;
  let percent;
  let url;

  if (
    alicomission &&
    alicomission.message &&
    alicomission.message.commission_rates &&
    alicomission.message.commission_rates.length > 0
  ) {
    url = alicomission.message.commission_rates[0].url;
    percent = alicomission.message.commission_rates[0].commission_rate;
    // sum = "$" + percent;
  }

  if (percent > 0) {
    try {
      let amount =
        data.priceModule.maxActivityAmount || data.priceModule.maxAmount;

      let priceInfo = {
        sum: amount.value,
        currency: amount.currency,
      };

      console.log('price', priceInfo);
      if (!isNaN(priceInfo.sum)) {
        if (priceInfo.currency != 'USD') {
          let val = await Utils.convertCurrency(
            priceInfo.currency,
            priceInfo.sum
          );

          console.log('v', val);

          sum = isNaN(val) ? undefined : val;
        } else {
          sum = priceInfo.sum;
        }

        console.log('price-origin', sum, percent);

        if (sum) sum = '$' + (sum * percent * 0.01).toFixed(2);
      }
    } catch {
      //
    }
  }

  if (ownerMemberId != null && storeId != null) {
    var feedbackUrl =
      'https://feedback.aliexpress.com/display/evaluationDetail.htm?ownerMemberId=' +
      ownerMemberId +
      '&storeId=' +
      storeId;
    let response = await fetch(feedbackUrl);
    let data = await response.text();
    var feedbackRegExp = /<span.*?>Seller\s*Feedback<\/span>.*?aliexpress.com\/store\/(\d+).*?<input type="hidden" name="ownerMemberId" value="(\d+)"\/>/gims;
    var feedbackMatches = feedbackRegExp.exec(data);

    if (feedbackMatches != null) {
      if (
        feedbackMatches[1] == storeId &&
        feedbackMatches[2] == ownerMemberId
      ) {
        rait = await postStorePage(feedbackUrl, data);
      }
    } else {
      rait = await getStoreInfo(checkUrl);
    }
  }

  console.log('price', sum, percent);

  return {
    description,
    percent,
    url,
    rait,
    image,
    img: 'images/third-page/aliexpress2.png',
    sum,
  };
}

async function postStorePage(url, content) {
  const data = { url, content };

  let formBody = [];
  for (const property in data) {
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(data[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }
  formBody = formBody.join('&');

  let response = await fetch('https://api.track24.ru/store-info.json.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody,
  });

  let json = await response.json();

  if (json) {
    if (json['status'] == 'ok') {
      // $('#storeResult').empty();
      //       $('#storeResult').append('<p>'+aliexpressRating(json.data.feedback_score)+' <a href="https://track24.ru/?g=checkStore&p='+json.data.store_url+'" target="_blank"><span class="storeName">'+json.data.store_name+'</span></a></p>');
      //     $('#storeResult').append('<p><hr></p>');
      return storeRaiting(json);
    }
    // else {
    //     $('#storeResult').empty().append('<p class=""><b>'+json.message+'</b></p>');
    //   }
  }
}

async function getStoreInfo(checkUrl) {
  let url = 'https://api.track24.ru/store-info.json.php';
  const tab = await Utils.currTab();
  if (tab == undefined) return;
  const tabLink = tab.url;

  try {
    const response = await fetch(url, { url: checkUrl });
    let json = await response.json();
    // if (json.status == "ok") {
    // $("#storeResult").append(
    //   "<p>" +
    //     aliexpressRating(json.data.feedback_score) +
    //     ' <a href="https://track24.ru/?g=checkStore&p=' +
    //     json.data.store_url +
    //     '" target="_blank"><span class="storeName">' +
    //     json.data.store_name +
    //     "</span></a></p>"
    // );
    // $("#storeResult").append("<p><hr></p>");
    const r = storeRaiting(json, tabLink);
    return { raiting: r };
  } catch (e) {
    console.log(e);
  }
  //   } else if (json.status == "error") {
  //     $("#storeResult")
  //       .empty()
  //       .append('<p class=""><b>' + json.message + "</b></p>");
  //   } else {
  //     $("#storeResult")
  //       .empty()
  //       .append(
  //         '<p class=""><b>Ой... При проверке товара произошла ошибка...</b></p>'
  //       );
  //   }
  // })
  //   .done(function() {})
  //   .fail(function(jqXHR, textStatus, errorThrown) {
  //     $("#storeResult")
  //       .empty()
  //       .append(
  //         '<p class=""><b>Ой... При проверке товара произошла ошибка...</b></p>'
  //       );
  //   })
  //   .always(function() {});
}

function storeRaiting(json) {
  let r = 3;
  if (
    json.data.days_diff_from_signup_date >= 1 &&
    json.data.days_diff_from_signup_date < 182
  ) {
    // $("#storeResult").append(
    //   '<p class="text-danger"><i class="fa fa-minus-square-o fa-lg"></i> <b>Продавец недавно зарегистрирован на AliExpress</b>.</p>'
    // );
  }
  if (
    json.data.days_diff_from_signup_date >= 182 &&
    json.data.days_diff_from_signup_date < 365
  ) {
    // $("#storeResult").append(
    //   '<p><i class="fa fa-check-square-o fa-lg text-success"></i> Продавец зарегистрирован на AliExpress более 6 месяцев назад.</p>'
    // );
  }
  if (json.data.days_diff_from_signup_date >= 365) {
    // $("#storeResult").append(
    //   '<p><i class="fa fa-check-square-o fa-lg text-success"></i> Продавец зарегистрирован на AliExpress более года назад.</p>'
    // );
    r = r + 1;
  }

  if (parseFloat(json.data.communication_average) >= 4.5) {
    // $("#storeResult").append(
    //   '<p><i class="fa fa-check-square-o fa-lg text-success"></i> Продавец оперативно отвечает на вопросы покупателей.</p>'
    // );
    r = r + 1;
  } else {
    // $("#storeResult").append(
    //   '<p class="text-danger"><i class="fa fa-minus-square-o fa-lg"></i> <b>Продавец неохотно общается с покупателями</b>.</p>'
    // );
  }
  if (parseFloat(json.data.item_described_average) >= 4.5) {
    // $("#storeResult").append(
    //   '<p><i class="fa fa-check-square-o fa-lg text-success"></i> Описания товаров и фотографии соответствуют действительности.</p>'
    // );
    r = r + 1;
  } else {
    // $("#storeResult").append(
    //   '<p class="text-danger"><i class="fa fa-minus-square-o fa-lg"></i> <b>Описания товаров и фотографии не соответствуют действительности</b>.</p>'
    // );
  }
  if (parseFloat(json.data.shipping_speed_average) >= 4.5) {
    // $("#storeResult").append(
    //   '<p><i class="fa fa-check-square-o fa-lg text-success"></i> Продавец оперативно отправляет заказы.</p>'
    // );
    r = r + 1;
  } else {
    // $("#storeResult").append(
    //   '<p class="text-danger"><i class="fa fa-minus-square-o fa-lg"></i> <b>Медленная отправка заказов</b>.</p>'
    // );
  }

  if (parseFloat(json.data.feedback_score) >= 1000) {
    // $("#storeResult").append(
    //   '<p><i class="fa fa-check-square-o fa-lg text-success"></i> Высокий рейтинг на AliExpress.</p>'
    // );
    r = r + 1;
  } else {
    // $("#storeResult").append(
    //   '<p class="text-danger"><i class="fa fa-minus-square-o fa-lg"></i> <b>Низкий рейтинг на AliExpress</b>.</p>'
    // );
  }

  if (parseFloat(json.data.positive_feedback_percent) >= 95) {
    // $("#storeResult").append(
    //   '<p><i class="fa fa-check-square-o fa-lg text-success"></i> Много положительных отзывов за последние 6 месяцев.</p>'
    // );
    r = r + 1;
  } else {
    // $("#storeResult").append(
    //   '<p class="text-danger"><i class="fa fa-minus-square-o fa-lg"></i> <b>Мало положительных отзывов 6 месяцев</b>.</p>'
    // );
  }

  if (parseFloat(json.data.fh_3_positive) >= 100) {
    // $("#storeResult").append(
    //   '<p><i class="fa fa-check-square-o fa-lg text-success"></i> Много заказов за последние 3 месяца.</p>'
    // );
    r = r + 1;
  } else {
    // $("#storeResult").append(
    //   '<p class="text-danger"><i class="fa fa-minus-square-o fa-lg"></i> <b>Мало заказов за последние 3 месяца</b>.</p>'
    // );
  }
  // if (r == 10) {
  //   $("#storeResult").append("<hr>");
  //   $("#storeResult").append(
  //     '<img src="/img/shield-36-green.png" style="float:left; padding:8px;" width="36px">'
  //   );
  //   $("#storeResult").append(
  //     '<p class="success"><b>Отличный продавец, можно смело делать заказ!</b></p>'
  //   );
  //   $("#storeResult").append(
  //     '<p class="success"><b>Рейтинг продавца : ' + r + " из 10</b></p>"
  //   );
  // } else if (r == 9) {
  //   $("#storeResult").append("<hr>");
  //   $("#storeResult").append(
  //     '<img src="/img/shield-36-green.png" style="float:left; padding:8px;" width="36px">'
  //   );
  //   $("#storeResult").append(
  //     '<p class="success"><b>Хороший продавец, можно делать заказ!</b></p>'
  //   );
  //   $("#storeResult").append(
  //     '<p class="success"><b>Рейтинг продавца : ' + r + " из 10</b></p>"
  //   );
  // } else if (r == 8) {
  //   $("#storeResult").append("<hr>");
  //   $("#storeResult").append(
  //     '<img src="/img/shield-36-blue.png" style="float:left; padding:8px;" width="36px">'
  //   );
  //   $("#storeResult").append(
  //     '<p class=""><b>Нормальный продавец, обратите внимание на отзывы!</b></p>'
  //   );
  //   $("#storeResult").append(
  //     '<p class=""><b>Рейтинг продавца : ' + r + " из 10</b></p>"
  //   );
  // } else if (r <= 7) {
  //   $("#storeResult").append("<hr>");
  //   $("#storeResult").append(
  //     '<img src="/img/no.png" style="float:right; padding:1px;" width="54px">'
  //   );
  //   $("#storeResult").append(
  //     '<p class="danger"><b>Лучше воздержаться от покупки у этого продавца!</b></p>'
  //   );
  //   $("#storeResult").append(
  //     '<p class="danger"><b>Рейтинг продавца : ' + r + " из 10</b></p>"
  //   );
  // }

  // if (r >= 9) {
  //   $("#footer").append("<hr>");
  //   $("#footer").append(
  //     '<center><a id="buy-now" class="buy-now-btn" href="https://track24.ru/?g=checkStore&p=' +
  //       tablink +
  //       '" target="_blank"><i class="fa fa-shopping-cart"></i> Купить у ' +
  //       json.data.store_name +
  //       " сейчас</a></center>"
  //   );
  // }
  return r;
}
