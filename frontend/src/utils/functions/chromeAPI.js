const sendMessage = async (data) => {
  const exId = localStorage.getItem("exId");
  return await new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(exId, data, (response) => {
      resolve(response);
    });
  });
};

export default {
  exCheck: async () => {
    try {
      return await sendMessage({ action: "Check" });
    } catch (error) {
      localStorage.removeItem("exId");
      alert("확장프로그램 설치가 필요합니다.");
      window.open(
        "https://chrome.google.com/webstore/detail/octopus-extention/joifomcdeeolfbniaoelficgjbpkclgj?hl=ko"
      );
      throw error;
    }
  },

  NaverLoginCheck: async () => {
    return await sendMessage({ action: "NaverLogin" });
  },

  AuctionLoginCheck: async () => {
    return await sendMessage({ action: "AuctionLogin" });
  },

  TaobaoItemSearch: async (url, page) => {
    const exId = localStorage.getItem("exId");
    const promiseResult = new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        exId,
        {
          action: "ItemSearch",
          url: url,
          page: page,
        },
        (response) => {
          resolve(response);
        }
      );
    });

    return await promiseResult;
  },

  oseeItemSearch: async (url, page) => {
    const exId = localStorage.getItem("exId");
    const promiseResult = new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        exId,
        {
          action: "1688ItemSearch",
          url: url,
          page: page,
        },
        (response) => {
          resolve(response);
        }
      );
    });
    return await promiseResult;
  },

  VvicItemSearch: async (url, page) => {
    const exId = localStorage.getItem("exId");
    const promiseResult = new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        exId,
        {
          action: "vvicSearch",
          url: url,
          page: page,
        },
        (response) => {
          resolve(response);
        }
      );
    });
    return await promiseResult;
  },

  aliexpressItemSearch: async (url, page) => {
    const exId = localStorage.getItem("exId");
    const promiseResult = new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        exId,
        {
          action: "aliexpressItemSearch",
          url: url,
          page: page,
        },
        (response) => {
          resolve(response);
        }
      );
    });
    return await promiseResult;
  },

  TaobaoLogin: async function () {
    let exId = localStorage.getItem("exId");
    let promiseResult = new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        exId,
        {
          action: "TaobaoLogin",
        },
        (response) => {
          resolve(response);
        }
      );
    });
    return await promiseResult;
  },

  TaobaoCollect: async function (url) {
    const exId = localStorage.getItem("exId");

    const promiseResult = new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        exId,
        {
          action: "TaobaoApi",
          url: url,
        },
        (response) => {
          resolve(response);
        }
      );
    });

    return await promiseResult;
  },
};
