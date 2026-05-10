import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import { getUserInfo, getCardList, setUserInfo, setUserAvatar, addNewCard } from "./components/api.js";

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalTitle = usersStatsModalWindow.querySelector(".popup__title");
const usersStatsModalInfo = usersStatsModalWindow.querySelector(".popup__info");
const usersStatsModalText = usersStatsModalWindow.querySelector(".popup__text");
const usersStatsModalList = usersStatsModalWindow.querySelector(".popup__list");
const infoDefinitionTemplate = document.getElementById("popup-info-definition-template");
const userPreviewTemplate = document.getElementById("popup-info-user-preview-template");
const logoElement = document.querySelector(".logo");

const removeCardModal = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModal.querySelector(".popup__form");

let currentUserId;
let cardToDelete = null;

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (label, value) => {
  const infoItem = infoDefinitionTemplate.content.cloneNode(true);
  const term = infoItem.querySelector(".popup__info-term");
  const description = infoItem.querySelector(".popup__info-description");
  
  term.textContent = label;
  description.textContent = value;
  
  return infoItem;
};

const createCardBadge = (cardName) => {
  const templateContent = userPreviewTemplate.content;
  const badgeElement = templateContent.querySelector(".popup__list-item_type_badge").cloneNode(true);
  badgeElement.textContent = cardName;
  return badgeElement;
};

const updateStatsModal = (cards) => {
  usersStatsModalInfo.innerHTML = '';
  usersStatsModalList.innerHTML = '';
  
  const uniqueUsers = new Set(cards.map(card => card.owner._id));
  const totalUsers = uniqueUsers.size;
  const totalLikes = cards.reduce((sum, card) => sum + card.likes.length, 0);
  const maxLikes = cards.reduce((max, card) => card.likes.length > max ? card.likes.length : max, 0);
  
  let championName = "Нет данных";
  if (cards.length > 0) {
    const mostLikedCard = cards.reduce((best, card) => card.likes.length > best.likes.length ? card : best);
    championName = mostLikedCard.owner.name;
  }
  
  const popularCards = [...cards].sort((a, b) => b.likes.length - a.likes.length).slice(0, 3);
  
  usersStatsModalTitle.textContent = "Статистика карточек";
  
  const statsData = [
    { term: "Всего пользователей:", description: totalUsers },
    { term: "Всего лайков:", description: totalLikes },
    { term: "Максимально лайков от одного:", description: maxLikes },
    { term: "Чемпион лайков:", description: championName }
  ];
  
  statsData.forEach(({ term, description }) => {
    usersStatsModalInfo.append(createInfoString(term, description));
  });
  
  usersStatsModalText.textContent = "Популярные карточки:";
  popularCards.forEach((card) => {
    usersStatsModalList.append(createCardBadge(card.name));
  });
};

const initStatsModal = () => {
  usersStatsModalTitle.textContent = "Статистика карточек";
  usersStatsModalText.textContent = "Популярные карточки:";
  
  usersStatsModalInfo.innerHTML = '';
  usersStatsModalInfo.append(createInfoString("Всего пользователей:", "Загрузка..."));
  usersStatsModalInfo.append(createInfoString("Всего лайков:", "Загрузка..."));
  usersStatsModalInfo.append(createInfoString("Максимально лайков от одного:", "Загрузка..."));
  usersStatsModalInfo.append(createInfoString("Чемпион лайков:", "Загрузка..."));
  usersStatsModalList.innerHTML = '';
};

const handleLogoClick = () => {
  initStatsModal();
  openModalWindow(usersStatsModalWindow);
  
  getCardList()
    .then((cards) => {
      updateStatsModal(cards);
    })
    .catch((err) => {
      console.log(err);
      usersStatsModalInfo.innerHTML = '';
      usersStatsModalInfo.append(createInfoString("Ошибка:", "Не удалось загрузить данные"));
      usersStatsModalList.innerHTML = '';
    });
};

logoElement.addEventListener("click", handleLogoClick);

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  setUserAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.error('Ошибка при обновлении аватара:', err);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
  .then((cardData) => {
    placesWrap.prepend(
      createCardElement(
        cardData,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: likeCard,
          onDeleteCard: (cardElement, cardId) => {
            cardToDelete = { element: cardElement, id: cardId };
            openModalWindow(removeCardModal);
          },
        },
        currentUserId // <-- Передаём ID текущего пользователя
      )
    );
    closeModalWindow(cardFormModalWindow);
    cardForm.reset();
  })
  .catch((err) => {
    console.error('Ошибка при добавлении карточки:', err);
  });
};

removeCardForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  if (cardToDelete) {
    deleteCard(cardToDelete.element, cardToDelete.id);
    closeModalWindow(removeCardModal);
    cardToDelete = null;
  }
});

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    currentUserId = userData._id; // <-- Сохраняем ID в общую область видимости

    cards.forEach((cardData) => {
      placesWrap.append(createCardElement(cardData, {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: likeCard,
        onDeleteCard: (cardElement, cardId) => {
          cardToDelete = { element: cardElement, id: cardId };
          openModalWindow(removeCardModal);
        },
      }, currentUserId)); // <-- Передаём ID при начальной отрисовке
    });
  })
  .catch((err) => {
    console.log(err);
  });