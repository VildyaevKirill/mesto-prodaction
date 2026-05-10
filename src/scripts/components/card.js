import { deleteCardRequest, toggleLike } from "./api.js";

// Плейсхолдеры (всегда рабочие, без CORS)
const LOADING_PLACEHOLDER = 'https://media1.tenor.com/m/0iK9a1WkT40AAAAd/loading-white.gif';
const ERROR_PLACEHOLDER = 'https://img.championat.com/s/1200x630/news/big/z/n/rkn-vydelil-57-7-mln-rublej-na-razrabotku-sistemy-po-poisku-zapreschyonnogo-kontenta_1660742608421064936.jpg';

/**
 * Обработчик лайка карточки
 * @param {HTMLElement} likeButton - кнопка лайка
 * @param {string} cardId - ID карточки
 * @param {HTMLElement} likeCountElement - элемент с количеством лайков
 */
export const likeCard = (likeButton, cardId, likeCountElement) => {
  // Блокируем лайк, если карточка ещё грузится
  const card = likeButton.closest('.card');
  if (card?.dataset.loading === 'true') return;
  
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  
  // Оптимистичное обновление интерфейса
  likeButton.classList.toggle("card__like-button_is-active");
  
  // Обновляем счётчик
  if (likeCountElement) {
    let count = parseInt(likeCountElement.textContent) || 0;
    likeCountElement.textContent = isLiked ? count - 1 : count + 1;
  }
  
  // Запрос к API
  toggleLike(cardId, !isLiked)
    .catch((err) => {
      // Откат изменений при ошибке
      likeButton.classList.toggle("card__like-button_is-active");
      if (likeCountElement) {
        let count = parseInt(likeCountElement.textContent) || 0;
        likeCountElement.textContent = isLiked ? count + 1 : count - 1;
      }
      console.error('Ошибка при лайке:', err);
    });
};

/**
 * Удаление карточки
 * @param {HTMLElement} cardElement - элемент карточки
 * @param {string} cardId - ID карточки
 */
export const deleteCard = (cardElement, cardId) => {
  // Блокируем удаление, если карточка ещё грузится
  if (cardElement.dataset.loading === 'true') return;
  
  deleteCardRequest(cardId)
    .then(() => {
      cardElement.remove();
    })
    .catch((err) => {
      console.error('Ошибка при удалении карточки:', err);
    });
};

/**
 * Получение шаблона карточки
 * @returns {HTMLElement} - клон шаблона
 */
const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

/**
 * Создание элемента карточки
 * @param {Object} data - данные карточки с сервера
 * @param {Object} handlers - обработчики событий
 * @param {string} currentUserId - ID текущего пользователя
 * @returns {HTMLElement} - готовый элемент карточки
 */
export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard },
  currentUserId
) => {
  const cardElement = getTemplate();
  
  // === ОБЪЯВЛЯЕМ ВСЕ ЭЛЕМЕНТЫ ОДИН РАЗ В НАЧАЛЕ ===
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  
  // === ЗАГРУЗКА ИЗОБРАЖЕНИЯ С ЗАГЛУШКАМИ ===
  let imageSrc = LOADING_PLACEHOLDER;
  cardElement.dataset.loading = 'true';
  cardImage.style.cursor = 'wait';
  
  cardImage.src = imageSrc;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  // === ОТОБРАЖЕНИЕ КОЛИЧЕСТВА ЛАЙКОВ ===
  if (likeCountElement) {
    likeCountElement.textContent = data.likes ? data.likes.length : 0;
  }

  // === ПРОВЕРКА: ЛАЙКНУЛ ЛИ ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ ===
  if (data.likes && data.likes.some(like => like._id === currentUserId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  // === ЗАГРУЗКА РЕАЛЬНОГО ИЗОБРАЖЕНИЯ ===
  const tempImg = new Image();
  
  tempImg.onload = () => {
    imageSrc = data.link;
    cardImage.src = imageSrc;
    cardImage.style.cursor = 'pointer';
    cardElement.dataset.loading = 'false';
  };
  
  tempImg.onerror = () => {
    imageSrc = ERROR_PLACEHOLDER;
    cardImage.src = imageSrc;
    cardImage.alt = 'Изображение недоступно';
    cardImage.style.cursor = 'pointer';
    cardElement.dataset.loading = 'false';
  };
  
  tempImg.src = data.link; // Запускаем загрузку

  // === КНОПКА УДАЛЕНИЯ: ПРОВЕРКА АВТОРА ===
  // Показываем корзину только если пользователь — автор карточки
  if (data.owner._id !== currentUserId) {
    deleteButton.remove();
  } else if (onDeleteCard) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data._id));
  }

  // === КНОПКА ЛАЙКА ===
  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(likeButton, data._id, likeCountElement));
  }

  // === КЛИК ПО ИЗОБРАЖЕНИЮ (ПРЕВЬЮ) ===
  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => {
      if (cardElement.dataset.loading === 'true') return;
      onPreviewPicture({ name: data.name, link: imageSrc });
    });
  }

  return cardElement;
};