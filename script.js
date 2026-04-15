const passportTrigger = document.querySelector("[data-open-passport]");
const passportDialog = document.querySelector("[data-passport-dialog]");
const passportCancel = document.querySelector("[data-passport-cancel]");
const passportForm = document.querySelector("[data-passport-form]");
const heroOrbs = Array.from(document.querySelectorAll(".hero-orb"));
const AUTH_USER_KEY = "trinket-trails-auth-user";
const ART_WALK_STARTED_KEY = "trinket-trails-art-walk-started";
const ART_WALK_FINISHED_KEY = "trinket-trails-art-walk-finished";
const ART_WALK_REWARD_PENDING_KEY = "trinket-trails-art-walk-reward-pending";
const ART_WALK_STAMP_PENDING_KEY = "trinket-trails-art-walk-stamp-pending";
const ART_WALK_STAMPS_KEY = "trinket-trails-art-walk-stamps";
const ART_WALK_PHOTOS_KEY = "trinket-trails-art-walk-photos";

const buildUserKey = (email, password) =>
  `${email.trim().toLowerCase()}::${password.trim()}`;

const getCurrentUserKey = () => window.sessionStorage.getItem(AUTH_USER_KEY) || "";
const getUsernameFromUserKey = (userKey) => {
  const email = String(userKey || "").split("::")[0] || "";
  return email.split("@")[0] || "";
};

const getStampStore = () => {
  try {
    return JSON.parse(window.localStorage.getItem(ART_WALK_STAMPS_KEY) || "{}");
  } catch {
    return {};
  }
};

const setUserStampEarned = (userKey) => {
  if (!userKey) {
    return;
  }

  const stampStore = getStampStore();
  stampStore[userKey] = true;
  window.localStorage.setItem(ART_WALK_STAMPS_KEY, JSON.stringify(stampStore));
};

const getPhotoStore = () => {
  try {
    return JSON.parse(window.localStorage.getItem(ART_WALK_PHOTOS_KEY) || "{}");
  } catch {
    return {};
  }
};

const getUserSavedPhotos = (userKey) => {
  if (!userKey) {
    return [];
  }

  return Array.isArray(getPhotoStore()[userKey]) ? getPhotoStore()[userKey] : [];
};

const setUserSavedPhotos = (userKey, photos) => {
  if (!userKey) {
    return;
  }

  const photoStore = getPhotoStore();
  photoStore[userKey] = photos;
  window.localStorage.setItem(ART_WALK_PHOTOS_KEY, JSON.stringify(photoStore));
};

const markStampPending = () => {
  window.sessionStorage.setItem(ART_WALK_STAMP_PENDING_KEY, "true");
};

const clearPendingStamp = () => {
  window.sessionStorage.removeItem(ART_WALK_STAMP_PENDING_KEY);
};

const savePendingStampForUser = (userKey) => {
  if (!userKey || window.sessionStorage.getItem(ART_WALK_STAMP_PENDING_KEY) !== "true") {
    return false;
  }

  setUserStampEarned(userKey);
  clearPendingStamp();
  return true;
};

const userHasArtWalkStamp = () => {
  const userKey = getCurrentUserKey();

  if (!userKey) {
    return false;
  }

  return Boolean(getStampStore()[userKey]);
};

if (heroOrbs.length) {
  const randomInRange = (min, max) => min + Math.random() * (max - min);
  const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
  const availableHeroTrinkets = [
    { key: "coin", src: "./assets/hero-trinkets/coin.png" },
    { key: "globe", src: "./assets/hero-trinkets/globe.png" },
    { key: "owl", src: "./assets/hero-trinkets/owl.png" },
    { key: "palette", src: "./assets/hero-trinkets/palette.png" },
    { key: "star", src: "./assets/hero-trinkets/star.png" },
    { key: "heart-box", src: "./assets/hero-trinkets/heart-box.png" },
  ];
  const leftSlots = shuffle([
    { left: { min: 4, max: 14 }, top: { min: 12, max: 28 } },
    { left: { min: 8, max: 20 }, top: { min: 40, max: 62 } },
  ]);
  const rightSlots = shuffle([
    { left: { min: 80, max: 91 }, top: { min: 10, max: 28 } },
    { left: { min: 76, max: 90 }, top: { min: 42, max: 64 } },
  ]);
  const slots = [...leftSlots, ...rightSlots];
  const selectedTrinkets = shuffle(availableHeroTrinkets).slice(0, heroOrbs.length);

  heroOrbs.forEach((orb, index) => {
    const trinket = selectedTrinkets[index];
    const slot = slots[index % slots.length];
    const left = randomInRange(slot.left.min, slot.left.max);
    const top = randomInRange(slot.top.min, slot.top.max);

    if (trinket) {
      orb.dataset.trinket = trinket.key;
      orb.src = trinket.src;
    }

    const smallTrinkets = new Set(["globe", "star", "coin", "tamagotchi"]);
    const mediumTrinkets = new Set(["artist-palette", "palette", "owl"]);
    const isSmall = smallTrinkets.has(orb.dataset.trinket || "");
    const isMedium = mediumTrinkets.has(orb.dataset.trinket || "");
    const size = isSmall
      ? randomInRange(0.66, 0.82)
      : isMedium
        ? randomInRange(0.78, 0.96)
        : randomInRange(0.9, 1.08);
    const maxSize = isSmall ? 92 : isMedium ? 106 : 118;

    orb.style.left = `${left}%`;
    orb.style.top = `${top}%`;
    orb.style.animationDuration = `${randomInRange(7.8, 10.6).toFixed(2)}s`;
    orb.style.animationDelay = `${(-randomInRange(0.2, 2.4)).toFixed(2)}s`;
    orb.style.width = `clamp(68px, ${(size * 8).toFixed(2)}vw, ${maxSize}px)`;
  });
}

const navigationEntry = performance.getEntriesByType("navigation")[0];
if (navigationEntry && navigationEntry.type === "reload") {
  window.sessionStorage.removeItem(AUTH_USER_KEY);
  window.sessionStorage.removeItem(ART_WALK_STARTED_KEY);
  window.sessionStorage.removeItem(ART_WALK_FINISHED_KEY);
  window.sessionStorage.removeItem(ART_WALK_REWARD_PENDING_KEY);
  window.sessionStorage.removeItem(ART_WALK_STAMP_PENDING_KEY);
}

if (passportTrigger && passportDialog && passportCancel && passportForm) {
  passportTrigger.addEventListener("click", () => {
    passportDialog.showModal();
  });

  passportCancel.addEventListener("click", () => {
    passportDialog.close();
  });

  passportDialog.addEventListener("click", (event) => {
    const bounds = passportDialog.getBoundingClientRect();
    const clickedBackdrop =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickedBackdrop) {
      passportDialog.close();
    }
  });

  passportForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(passportForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!email || !password) {
      return;
    }

    const userKey = buildUserKey(email, password);
    window.sessionStorage.setItem(AUTH_USER_KEY, userKey);
    if (savePendingStampForUser(userKey)) {
      syncPassportStamp();
    }
    window.location.href = "./Passport.html";
  });
}

const passportGateDialog = document.querySelector("[data-passport-gate-dialog]");
const passportGateForm = document.querySelector("[data-passport-gate-form]");
const passportGateCancel = document.querySelector("[data-passport-gate-cancel]");
const passportGateTitle = passportGateForm?.querySelector("h2");
const passportGateCopy = passportGateForm?.querySelector("p");
const gatedPassportLinks = Array.from(
  document.querySelectorAll('a[href="./Passport.html"]')
).filter((link) => !link.closest("[data-passport-dialog]"));

let pendingPassportHref = "./Passport.html";
let saveStampAfterLogin = false;
let savePhotosAfterLogin = false;

const setPassportGateMode = (mode = "passport") => {
  if (!passportGateTitle || !passportGateCopy) {
    return;
  }

  if (mode === "photos") {
    passportGateTitle.textContent = "Log in to save your photo map";
    passportGateCopy.textContent =
      "Use the same email and password you want tied to your trail photo placements.";
    return;
  }

  passportGateTitle.textContent = "Log in to view your passport";
  passportGateCopy.textContent =
    "Use the same email and password you want tied to your trail progress.";
};

if (passportGateDialog && passportGateForm && passportGateCancel) {
  gatedPassportLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (getCurrentUserKey()) {
        return;
      }

      event.preventDefault();
      pendingPassportHref = link.getAttribute("href") || "./Passport.html";
      saveStampAfterLogin = false;
      savePhotosAfterLogin = false;
      setPassportGateMode("passport");
      passportGateDialog.showModal();
    });
  });

  passportGateCancel.addEventListener("click", () => {
    savePhotosAfterLogin = false;
    saveStampAfterLogin = false;
    setPassportGateMode("passport");
    passportGateDialog.close();
  });

  passportGateDialog.addEventListener("click", (event) => {
    const bounds = passportGateDialog.getBoundingClientRect();
    const clickedBackdrop =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickedBackdrop) {
      savePhotosAfterLogin = false;
      saveStampAfterLogin = false;
      setPassportGateMode("passport");
      passportGateDialog.close();
    }
  });

  passportGateForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(passportGateForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!email || !password) {
      return;
    }

    const userKey = buildUserKey(email, password);
    window.sessionStorage.setItem(AUTH_USER_KEY, userKey);

    if (saveStampAfterLogin) {
      window.sessionStorage.setItem(ART_WALK_FINISHED_KEY, "true");
      markStampPending();
    }

    if (savePendingStampForUser(userKey)) {
      syncPassportStamp();
    }

    if (savePhotosAfterLogin && typeof window.saveArtWalkPhotosForUser === "function") {
      window.saveArtWalkPhotosForUser(userKey);
      savePhotosAfterLogin = false;
    }

    saveStampAfterLogin = false;
    passportGateDialog.close();
    passportGateForm.reset();
    setPassportGateMode("passport");

    if (pendingPassportHref && pendingPassportHref !== "#stay") {
      window.location.href = pendingPassportHref;
    }
  });
}

const trailProgress = document.querySelector("[data-trail-progress]");
const photoLayer = document.querySelector("[data-photo-layer]");
const filterOthers = document.querySelector("[data-filter-others]");
const filterYours = document.querySelector("[data-filter-yours]");
const uploadTrigger = document.querySelector("[data-photo-upload]");
const uploadDialog = document.querySelector("[data-upload-dialog]");
const uploadCancel = document.querySelector("[data-upload-cancel]");
const uploadForm = document.querySelector("[data-upload-form]");
const confirmPlacement = document.querySelector("[data-photo-confirm]");
const photoDetailDialog = document.querySelector("[data-photo-detail-dialog]");
const photoDetailImage = document.querySelector("[data-photo-detail-image]");
const photoDetailName = document.querySelector("[data-photo-detail-name]");
const photoDetailUploader = document.querySelector("[data-photo-detail-uploader]");
const photoDetailDate = document.querySelector("[data-photo-detail-date]");
const photoDetailDescription = document.querySelector("[data-photo-detail-description]");
const photoDetailClose = document.querySelector("[data-photo-detail-close]");
const startTrailTrigger = document.querySelector("[data-start-trail]");
const startTrailDialog = document.querySelector("[data-start-trail-dialog]");
const startTrailNo = document.querySelector("[data-start-trail-no]");
const startTrailYes = document.querySelector("[data-start-trail-yes]");
const finishTrailTrigger = document.querySelector("[data-finish-trail]");
const finishTrailDialog = document.querySelector("[data-finish-trail-dialog]");
const finishTrailRewardDialog = document.querySelector("[data-finish-trail-reward-dialog]");
const finishTrailStamp = document.querySelector("[data-finish-trail-stamp]");
const finishTrailActions = document.querySelector("[data-finish-trail-actions]");
const finishTrailNo = document.querySelector("[data-finish-trail-no]");
const finishTrailYes = document.querySelector("[data-finish-trail-yes]");
const finishTrailClose = document.querySelector("[data-finish-trail-close]");
const finishTrailSaveNote = document.querySelector("[data-finish-trail-save-note]");
const finishTrailSaveLogin = document.querySelector("[data-finish-trail-save-login]");
const finishTrailPassportLink = document.querySelector("[data-finish-trail-passport-link]");
const passportEarnedStamp = document.querySelector("[data-passport-earned-stamp]");
const trailQrLink = document.querySelector("[data-trail-qr-link]");

const syncPassportStamp = () => {
  if (!passportEarnedStamp) {
    return;
  }

  passportEarnedStamp.hidden = !userHasArtWalkStamp();
};

const syncArtWalkTrackerState = () => {
  if (!trailProgress) {
    return;
  }

  const started = window.sessionStorage.getItem(ART_WALK_STARTED_KEY) === "true";
  const finished = window.sessionStorage.getItem(ART_WALK_FINISHED_KEY) === "true";

  trailProgress.classList.toggle("is-started", started);

  if (startTrailTrigger) {
    startTrailTrigger.hidden = started;
  }

  if (finishTrailTrigger) {
    finishTrailTrigger.hidden = !started || finished;
  }

  if (trailQrLink) {
    trailQrLink.href = started && !finished ? "./finish-trail.html" : "./start-trail.html";
  }
};

const configureFinishRewardActions = () => {
  const isLoggedIn = Boolean(getCurrentUserKey());

  if (finishTrailSaveNote) {
    finishTrailSaveNote.hidden = isLoggedIn;
  }

  if (finishTrailSaveLogin) {
    finishTrailSaveLogin.hidden = isLoggedIn;
  }

  if (finishTrailPassportLink) {
    finishTrailPassportLink.hidden = !isLoggedIn;
  }
};

const openFinishRewardDialog = () => {
  if (!finishTrailRewardDialog) {
    return;
  }

  configureFinishRewardActions();
  finishTrailRewardDialog.showModal();
};

syncPassportStamp();
syncArtWalkTrackerState();

if (startTrailTrigger && startTrailDialog && startTrailNo && startTrailYes) {
  startTrailTrigger.addEventListener("click", () => {
    startTrailDialog.showModal();
  });

  startTrailNo.addEventListener("click", () => {
    startTrailDialog.close();
  });

  startTrailYes.addEventListener("click", () => {
    window.sessionStorage.setItem(ART_WALK_STARTED_KEY, "true");
    window.sessionStorage.removeItem(ART_WALK_FINISHED_KEY);
    syncArtWalkTrackerState();
    startTrailDialog.close();
  });

  startTrailDialog.addEventListener("click", (event) => {
    const bounds = startTrailDialog.getBoundingClientRect();
    const clickedBackdrop =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickedBackdrop) {
      startTrailDialog.close();
    }
  });
}

if (
  finishTrailTrigger &&
  finishTrailDialog &&
  finishTrailRewardDialog &&
  finishTrailStamp &&
  finishTrailActions &&
  finishTrailNo &&
  finishTrailYes &&
  finishTrailClose
) {
  finishTrailTrigger.addEventListener("click", () => {
    finishTrailDialog.showModal();
  });

  finishTrailNo.addEventListener("click", () => {
    finishTrailDialog.close();
  });

  finishTrailYes.addEventListener("click", () => {
    const currentUserKey = getCurrentUserKey();

    if (window.sessionStorage.getItem(ART_WALK_STARTED_KEY) !== "true") {
      finishTrailDialog.close();
      return;
    }

    if (currentUserKey) {
      setUserStampEarned(currentUserKey);
      clearPendingStamp();
      syncPassportStamp();
    } else {
      markStampPending();
    }

    window.sessionStorage.setItem(ART_WALK_FINISHED_KEY, "true");
    window.sessionStorage.setItem(ART_WALK_REWARD_PENDING_KEY, "true");
    syncArtWalkTrackerState();
    finishTrailDialog.close();
    openFinishRewardDialog();
  });

  finishTrailClose.addEventListener("click", () => {
    finishTrailRewardDialog.close();
  });

  if (finishTrailSaveLogin) {
    finishTrailSaveLogin.addEventListener("click", () => {
      saveStampAfterLogin = true;
      pendingPassportHref = "./Passport.html";
      finishTrailRewardDialog.close();
      passportGateDialog?.showModal();
    });
  }

  finishTrailDialog.addEventListener("click", (event) => {
    const bounds = finishTrailDialog.getBoundingClientRect();
    const clickedBackdrop =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickedBackdrop) {
      finishTrailDialog.close();
    }
  });

  finishTrailRewardDialog.addEventListener("click", (event) => {
    const bounds = finishTrailRewardDialog.getBoundingClientRect();
    const clickedBackdrop =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickedBackdrop) {
      finishTrailRewardDialog.close();
    }
  });

  if (window.sessionStorage.getItem(ART_WALK_REWARD_PENDING_KEY) === "true") {
    window.sessionStorage.removeItem(ART_WALK_REWARD_PENDING_KEY);
    openFinishRewardDialog();
  }
}

if (
  trailProgress &&
  photoLayer &&
  filterOthers &&
  filterYours &&
  uploadTrigger &&
  uploadDialog &&
  uploadCancel &&
  uploadForm &&
  confirmPlacement &&
  photoDetailDialog &&
  photoDetailImage &&
  photoDetailName &&
  photoDetailUploader &&
  photoDetailDate &&
  photoDetailDescription &&
  photoDetailClose
) {
  const trailPhotos = [
    {
      id: "others-slam-1",
      owner: "others",
      src: "./assets/trail-photos/slam-1.png",
      name: "Entrance of SLAM",
      uploader: "@ivytrails",
      date: "",
      description: "Loved how the light opened up right at the start.",
      x: 0.086,
      y: 0.205,
      size: 92,
      pending: false,
    },
    {
      id: "others-project-2",
      owner: "others",
      src: "./assets/trail-photos/project-2.png",
      name: "Museum Garden Walk",
      uploader: "@mossymap",
      date: "",
      description: "This stretch felt quiet in the best way.",
      x: 0.392,
      y: 0.262,
      size: 92,
      pending: false,
    },
    {
      id: "others-project-3",
      owner: "others",
      src: "./assets/trail-photos/project-3.png",
      name: "Clearing Before the End",
      uploader: "@petalpath",
      date: "",
      description: "Everything looked extra bright on the walk back through here.",
      x: 0.748,
      y: 0.572,
      size: 92,
      pending: false,
    },
    {
      id: "others-project-4",
      owner: "others",
      src: "./assets/trail-photos/project-4.png",
      name: "Inside the Jewel Box",
      uploader: "@lanternloop",
      date: "",
      description: "Such a pretty ending spot for the trail.",
      x: 0.885,
      y: 0.608,
      size: 92,
      pending: false,
    },
  ];
  let pendingPhotoId = null;
  let dragState = null;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const randomSharedDate = () => {
    const now = new Date();
    const daysBack = Math.floor(Math.random() * 120) + 3;
    const date = new Date(now);
    date.setDate(now.getDate() - daysBack);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Unable to read photo file."));
      reader.readAsDataURL(file);
    });

  trailPhotos.forEach((photo) => {
    if (photo.owner === "others" && !photo.date) {
      photo.date = randomSharedDate();
    }
  });

  const serializeUserPhotos = () =>
    trailPhotos
      .filter((photo) => photo.owner === "yours" && !photo.pending)
      .map(({ id, owner, src, name, uploader, date, description, x, y }) => ({
        id,
        owner,
        src,
        name,
        uploader,
        date,
        description,
        x,
        y,
      }));

  const loadSavedUserPhotos = (userKey) => {
    const savedPhotos = getUserSavedPhotos(userKey);
    const otherPhotos = trailPhotos.filter((photo) => photo.owner !== "yours");
    trailPhotos.length = 0;
    trailPhotos.push(
      ...otherPhotos,
      ...savedPhotos.map((photo) => ({
        ...photo,
        pending: false,
      }))
    );
    pendingPhotoId = null;
    confirmPlacement.hidden = true;
    renderTrailPhotos();
  };

  const saveArtWalkPhotosForUser = (userKey) => {
    setUserSavedPhotos(userKey, serializeUserPhotos());
    loadSavedUserPhotos(userKey);
  };

  window.saveArtWalkPhotosForUser = saveArtWalkPhotosForUser;

  const positionPhoto = (photo, marker, clientX, clientY) => {
    const bounds = trailProgress.getBoundingClientRect();
    photo.x = clamp((clientX - bounds.left) / bounds.width, 0.04, 0.96);
    photo.y = clamp((clientY - bounds.top) / bounds.height, 0.08, 0.92);
    marker.style.left = `${photo.x * 100}%`;
    marker.style.top = `${photo.y * 100}%`;
  };

  const stopDragging = () => {
    if (!dragState) {
      return;
    }

    dragState.marker.classList.remove("is-dragging");
    window.removeEventListener("pointermove", dragState.onMove);
    window.removeEventListener("pointerup", dragState.onUp);
    window.removeEventListener("pointercancel", dragState.onUp);
    dragState = null;
  };

  const renderTrailPhotos = () => {
    photoLayer.innerHTML = "";

    const showOthers = filterOthers.checked;
    const showYours = filterYours.checked;

    trailPhotos.forEach((photo) => {
      const visible =
        (photo.owner === "others" && showOthers) ||
        (photo.owner === "yours" && showYours);

      if (!visible) {
        return;
      }

      const marker = document.createElement("button");
      marker.type = "button";
      marker.className = "trail-photo-marker";
      if (photo.pending) {
        marker.classList.add("is-pending");
      }
      if (photo.size) {
        marker.style.width = `${photo.size}px`;
        marker.style.height = `${photo.size}px`;
      }
      marker.style.left = `${photo.x * 100}%`;
      marker.style.top = `${photo.y * 100}%`;
      marker.title = photo.description
        ? `${photo.name} • ${photo.date}\n${photo.description}`
        : `${photo.name} • ${photo.date}`;

      const image = document.createElement("img");
      image.src = photo.src;
      image.alt = `${photo.name} trail photo`;
      marker.appendChild(image);

      if (photo.pending) {
        marker.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          stopDragging();
          marker.classList.add("is-dragging");
          positionPhoto(photo, marker, event.clientX, event.clientY);

          const onMove = (moveEvent) => {
            positionPhoto(photo, marker, moveEvent.clientX, moveEvent.clientY);
          };

          const onUp = () => {
            stopDragging();
          };

          dragState = { marker, onMove, onUp };
          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp);
          window.addEventListener("pointercancel", onUp);
        });
      } else {
        marker.addEventListener("click", () => {
          photoDetailImage.src = photo.src;
          photoDetailImage.alt = `${photo.name} trail photo`;
          photoDetailName.textContent = photo.name;
          photoDetailUploader.textContent = photo.uploader || "@trailfriend";
          photoDetailDate.textContent = photo.date;
          photoDetailDescription.textContent =
            photo.description || "No description was added for this photo.";
          photoDetailDialog.showModal();
        });
      }

      photoLayer.appendChild(marker);
    });
  };

  const closeUploadDialog = () => {
    uploadDialog.close();
    uploadForm.reset();
  };

  uploadTrigger.addEventListener("click", () => {
    uploadDialog.showModal();
  });

  uploadCancel.addEventListener("click", () => {
    closeUploadDialog();
  });

  uploadDialog.addEventListener("click", (event) => {
    const bounds = uploadDialog.getBoundingClientRect();
    const clickedBackdrop =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickedBackdrop) {
      closeUploadDialog();
    }
  });

  photoDetailClose.addEventListener("click", () => {
    photoDetailDialog.close();
  });

  photoDetailDialog.addEventListener("click", (event) => {
    const bounds = photoDetailDialog.getBoundingClientRect();
    const clickedBackdrop =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickedBackdrop) {
      photoDetailDialog.close();
    }
  });

  uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(uploadForm);
    const file = formData.get("photo");
    const name = String(formData.get("name") || "").trim();
    const date = String(formData.get("date") || "").trim();
    const description = String(formData.get("description") || "").trim();

    if (!(file instanceof File) || !file.size || !name || !date) {
      return;
    }

    const photoSrc = await fileToDataUrl(file);

    const newPhoto = {
      id: crypto.randomUUID(),
      owner: "yours",
      src: photoSrc,
      name,
      uploader: getUsernameFromUserKey(getCurrentUserKey())
        ? `@${getUsernameFromUserKey(getCurrentUserKey())}`
        : "@guest",
      date,
      description,
      x: 0.24,
      y: 0.74,
      pending: true,
    };

    trailPhotos.push(newPhoto);
    pendingPhotoId = newPhoto.id;
    filterYours.checked = true;
    confirmPlacement.hidden = false;
    closeUploadDialog();
    renderTrailPhotos();
  });

  confirmPlacement.addEventListener("click", () => {
    stopDragging();
    const pendingPhoto = trailPhotos.find((photo) => photo.id === pendingPhotoId);

    if (!pendingPhoto) {
      confirmPlacement.hidden = true;
      return;
    }

    pendingPhoto.pending = false;
    pendingPhotoId = null;
    confirmPlacement.hidden = true;
    renderTrailPhotos();

    const currentUserKey = getCurrentUserKey();

    if (currentUserKey) {
      saveArtWalkPhotosForUser(currentUserKey);
      return;
    }

    if (passportGateDialog && passportGateForm) {
      const shouldSavePhotos = window.confirm("Log in to save your photo map?");

      if (shouldSavePhotos) {
        pendingPassportHref = "#stay";
        savePhotosAfterLogin = true;
        saveStampAfterLogin = false;
        setPassportGateMode("photos");
        passportGateDialog.showModal();
      }
    }
  });

  filterOthers.addEventListener("change", renderTrailPhotos);
  filterYours.addEventListener("change", renderTrailPhotos);
  const currentUserKey = getCurrentUserKey();
  if (currentUserKey) {
    loadSavedUserPhotos(currentUserKey);
  }
  renderTrailPhotos();
}
