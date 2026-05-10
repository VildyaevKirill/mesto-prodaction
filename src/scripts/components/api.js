const config = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-203",
  headers: {
    authorization: "c3840b5e-741e-4b69-a5f3-9b0be0bf3221", 
    "Content-Type": "application/json",
  },
};

const getResponseData = (res) => {
  return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);
};

export const getUserInfo = () => {
  return fetch(`${config.baseUrl}/users/me`, {
    headers: config.headers,
  }).then(getResponseData);
};

export const getCardList = () => {
  return fetch(`${config.baseUrl}/cards`, {
    headers: config.headers,
  }).then(getResponseData);
};

export const setUserInfo = ({ name, about }) => {
  return fetch(`${config.baseUrl}/users/me`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({ name, about }),
  })
  .then((res) => {
    if (res.status === 204) {
      return Promise.resolve({ name, about });
    }
    return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);
  });
};

export const setUserAvatar = ({ avatar }) => {
  return fetch(`${config.baseUrl}/users/me/avatar`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({ avatar }),
  }).then(getResponseData);
};

export const addNewCard = ({ name, link }) => {
  return fetch(`${config.baseUrl}/cards`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({ name, link }),
  }).then(getResponseData);
};

// === Удаление карточки по ID (ОДИН РАЗ!) ===
export const deleteCardRequest = (cardId) => {
  return fetch(`${config.baseUrl}/cards/${cardId}`, {
    method: "DELETE",
    headers: config.headers,
  }).then(getResponseData);
};

// === Лайк / дизлайк ===
export const toggleLike = (cardId, isLiked) => {
  const method = isLiked ? "PUT" : "DELETE";
  return fetch(`${config.baseUrl}/cards/${cardId}/likes`, {
    method,
    headers: config.headers,
  }).then(getResponseData);
};