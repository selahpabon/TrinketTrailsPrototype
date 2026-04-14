const passportTrigger = document.querySelector("[data-open-passport]");
const passportDialog = document.querySelector("[data-passport-dialog]");
const passportCancel = document.querySelector("[data-passport-cancel]");
const passportForm = document.querySelector("[data-passport-form]");
const heroOrbs = Array.from(document.querySelectorAll(".hero-orb"));
const AUTH_USER_KEY = "trinket-trails-auth-user";
const ART_WALK_STARTED_KEY = "trinket-trails-art-walk-started";
const ART_WALK_STAMPS_KEY = "trinket-trails-art-walk-stamps";

const buildUserKey = (email, password) =>
  `${email.trim().toLowerCase()}::${password.trim()}`;

const getCurrentUserKey = () => window.sessionStorage.getItem(AUTH_USER_KEY) || "";

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

const userHasArtWalkStamp = () => {
  const userKey = getCurrentUserKey();

  if (!userKey) {
    return false;
  }

  return Boolean(getStampStore()[userKey]);
};

if (heroOrbs.length) {
  const randomInRange = (min, max) => min + Math.random() * (max - min);
  const overlapsHeroContent = (left, top) => left > 26 && left < 74 && top > 10 && top < 78;
  const columns = [
    { min: 3, max: 11 },
    { min: 12, max: 20 },
    { min: 21, max: 29 },
    { min: 30, max: 36 },
    { min: 64, max: 70 },
    { min: 71, max: 79 },
    { min: 80, max: 88 },
    { min: 89, max: 96 },
    { min: 4, max: 14 },
  ].sort(() => Math.random() - 0.5);
  const verticalBands = [
    { min: 8, max: 20 },
    { min: 18, max: 32 },
    { min: 30, max: 44 },
    { min: 42, max: 58 },
    { min: 54, max: 70 },
    { min: 12, max: 26 },
    { min: 24, max: 38 },
    { min: 38, max: 54 },
    { min: 58, max: 76 },
  ].sort(() => Math.random() - 0.5);

  heroOrbs.forEach((orb, index) => {
    const column = columns[index % columns.length];
    const band = verticalBands[index % verticalBands.length];
    let left = randomInRange(column.min, column.max);
    let top = randomInRange(band.min, band.max);

    while (overlapsHeroContent(left, top)) {
      left = randomInRange(column.min, column.max);
      top = randomInRange(band.min, band.max);
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
    orb.style.animationDuration = `${randomInRange(5.1, 7.2).toFixed(2)}s`;
    orb.style.animationDelay = `${(-randomInRange(0.2, 3.2)).toFixed(2)}s`;
    orb.style.width = `clamp(68px, ${(size * 8).toFixed(2)}vw, ${maxSize}px)`;
  });
}

const navigationEntry = performance.getEntriesByType("navigation")[0];
if (navigationEntry && navigationEntry.type === "reload") {
  window.sessionStorage.removeItem(AUTH_USER_KEY);
  window.sessionStorage.removeItem(ART_WALK_STARTED_KEY);
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

    window.sessionStorage.setItem(AUTH_USER_KEY, buildUserKey(email, password));
    window.sessionStorage.removeItem(ART_WALK_STARTED_KEY);
    window.location.href = "./Passport.html";
  });
}

const passportGateDialog = document.querySelector("[data-passport-gate-dialog]");
const passportGateForm = document.querySelector("[data-passport-gate-form]");
const passportGateCancel = document.querySelector("[data-passport-gate-cancel]");
const gatedPassportLinks = Array.from(
  document.querySelectorAll('a[href="./Passport.html"]')
).filter((link) => !link.closest("[data-passport-dialog]"));

if (passportGateDialog && passportGateForm && passportGateCancel && gatedPassportLinks.length) {
  let pendingPassportHref = "./Passport.html";

  gatedPassportLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (getCurrentUserKey()) {
        return;
      }

      event.preventDefault();
      pendingPassportHref = link.getAttribute("href") || "./Passport.html";
      passportGateDialog.showModal();
    });
  });

  passportGateCancel.addEventListener("click", () => {
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

    window.sessionStorage.setItem(AUTH_USER_KEY, buildUserKey(email, password));
    passportGateDialog.close();
    passportGateForm.reset();
    window.location.href = pendingPassportHref;
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
const passportEarnedStamp = document.querySelector("[data-passport-earned-stamp]");

const syncPassportStamp = () => {
  if (!passportEarnedStamp) {
    return;
  }

  passportEarnedStamp.hidden = !userHasArtWalkStamp();
};

syncPassportStamp();

if (startTrailTrigger && startTrailDialog && startTrailNo && startTrailYes) {
  startTrailTrigger.addEventListener("click", () => {
    startTrailDialog.showModal();
  });

  startTrailNo.addEventListener("click", () => {
    startTrailDialog.close();
  });

  startTrailYes.addEventListener("click", () => {
    if (trailProgress) {
      trailProgress.classList.add("is-started");
    }

    window.sessionStorage.setItem(ART_WALK_STARTED_KEY, "true");
    startTrailTrigger.hidden = true;
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

    if (
      window.sessionStorage.getItem(ART_WALK_STARTED_KEY) !== "true" ||
      !currentUserKey
    ) {
      finishTrailDialog.close();
      return;
    }

    setUserStampEarned(currentUserKey);
    syncPassportStamp();
    finishTrailDialog.close();
    finishTrailRewardDialog.showModal();
  });

  finishTrailClose.addEventListener("click", () => {
    finishTrailRewardDialog.close();
  });

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
  photoDetailDate &&
  photoDetailDescription &&
  photoDetailClose
) {
  const trailPhotos = [];
  let pendingPhotoId = null;
  let dragState = null;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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
      marker.style.left = `${photo.x * 100}%`;
      marker.style.top = `${photo.y * 100}%`;
      marker.title = photo.description
        ? `${photo.name} • ${photo.date}\n${photo.description}`
        : `${photo.name} • ${photo.date}`;

      const image = document.createElement("img");
      image.src = photo.src;
      image.alt = `${photo.name} trail photo`;
      marker.appendChild(image);

      const meta = document.createElement("span");
      meta.className = "trail-photo-meta";
      meta.textContent = photo.name;
      marker.appendChild(meta);

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

  uploadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(uploadForm);
    const file = formData.get("photo");
    const name = String(formData.get("name") || "").trim();
    const date = String(formData.get("date") || "").trim();
    const description = String(formData.get("description") || "").trim();

    if (!(file instanceof File) || !file.size || !name || !date) {
      return;
    }

    const newPhoto = {
      id: crypto.randomUUID(),
      owner: "yours",
      src: URL.createObjectURL(file),
      name,
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
  });

  filterOthers.addEventListener("change", renderTrailPhotos);
  filterYours.addEventListener("change", renderTrailPhotos);
  renderTrailPhotos();
}
