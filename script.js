const heroOrbs = Array.from(document.querySelectorAll(".hero-orb"));
const loginTrigger = document.querySelector("[data-login-trigger]");
const ACTIVE_USER_KEY = "trinket-trails-active-user";
const USER_DATABASE_KEY = "trinket-trails-users-db";
const ART_WALK_STARTED_KEY = "trinket-trails-art-walk-started";
const ART_WALK_FINISHED_KEY = "trinket-trails-art-walk-finished";
const ART_WALK_REWARD_PENDING_KEY = "trinket-trails-art-walk-reward-pending";
const ART_WALK_STAMP_PENDING_KEY = "trinket-trails-art-walk-stamp-pending";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const getUsernameFromEmail = (email) => normalizeEmail(email).split("@")[0] || "";

const getUserDatabase = () => {
  try {
    return JSON.parse(window.localStorage.getItem(USER_DATABASE_KEY) || "{}");
  } catch {
    return {};
  }
};

const setUserDatabase = (database) => {
  window.localStorage.setItem(USER_DATABASE_KEY, JSON.stringify(database));
};

const getActiveUserEmail = () =>
  normalizeEmail(window.sessionStorage.getItem(ACTIVE_USER_KEY) || "");

const getActiveUserRecord = () => {
  const email = getActiveUserEmail();
  if (!email) {
    return null;
  }

  return getUserDatabase()[email] || null;
};

const isUserSessionActive = () => Boolean(getActiveUserEmail() && getActiveUserRecord());

const ensureUserAccount = (email, password) => {
  const normalizedEmail = normalizeEmail(email);
  const cleanPassword = String(password || "").trim();

  if (!normalizedEmail || !cleanPassword) {
    return {
      ok: false,
      error: "Please enter both an email and password.",
    };
  }

  const database = getUserDatabase();
  const existingUser = database[normalizedEmail];

  if (existingUser && existingUser.password !== cleanPassword) {
    return {
      ok: false,
      error: "That email already has a different password.",
    };
  }

  database[normalizedEmail] = {
    email: normalizedEmail,
    password: cleanPassword,
    stamps: {
      artWalk: Boolean(existingUser?.stamps?.artWalk),
    },
    photos: {
      artWalk: Array.isArray(existingUser?.photos?.artWalk)
        ? existingUser.photos.artWalk
        : [],
    },
  };

  setUserDatabase(database);
  window.sessionStorage.setItem(ACTIVE_USER_KEY, normalizedEmail);

  return {
    ok: true,
    email: normalizedEmail,
    user: database[normalizedEmail],
  };
};

const getUserHasArtWalkStamp = (email = getActiveUserEmail()) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return false;
  }

  return Boolean(getUserDatabase()[normalizedEmail]?.stamps?.artWalk);
};

const setUserArtWalkStamp = (email = getActiveUserEmail()) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return;
  }

  const database = getUserDatabase();
  const existingUser = database[normalizedEmail];
  if (!existingUser) {
    return;
  }

  existingUser.stamps = {
    ...(existingUser.stamps || {}),
    artWalk: true,
  };
  database[normalizedEmail] = existingUser;
  setUserDatabase(database);
};

const getUserSavedPhotos = (email = getActiveUserEmail()) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return [];
  }

  return Array.isArray(getUserDatabase()[normalizedEmail]?.photos?.artWalk)
    ? getUserDatabase()[normalizedEmail].photos.artWalk
    : [];
};

const setUserSavedPhotos = (photos, email = getActiveUserEmail()) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return;
  }

  const database = getUserDatabase();
  const existingUser = database[normalizedEmail];
  if (!existingUser) {
    return;
  }

  existingUser.photos = {
    ...(existingUser.photos || {}),
    artWalk: photos,
  };
  database[normalizedEmail] = existingUser;
  setUserDatabase(database);
};

const syncLoginButton = () => {
  if (!loginTrigger) {
    return;
  }

  const active = isUserSessionActive();
  loginTrigger.textContent = active ? "Log out" : "Login";
  loginTrigger.dataset.activeSession = active ? "true" : "false";
};

const consumePendingStampForActiveUser = () => {
  if (
    window.sessionStorage.getItem(ART_WALK_STAMP_PENDING_KEY) !== "true" ||
    !isUserSessionActive()
  ) {
    return false;
  }

  setUserArtWalkStamp();
  window.sessionStorage.removeItem(ART_WALK_STAMP_PENDING_KEY);
  return true;
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

const loginDialog = document.createElement("dialog");
loginDialog.className = "passport-dialog";
loginDialog.dataset.loginDialog = "";
loginDialog.innerHTML = `
  <form class="passport-form" method="dialog" data-login-form>
    <h2 data-login-title>Log in to continue</h2>
    <p data-login-copy>Use your email and password to save or continue your Trinket Trails progress.</p>
    <p class="login-error" data-login-error hidden></p>
    <label class="passport-field">
      <span>Email</span>
      <input type="email" name="email" required />
    </label>
    <label class="passport-field">
      <span>Password</span>
      <input type="password" name="password" required />
    </label>
    <div class="passport-actions">
      <button class="passport-button ghost-button" type="button" data-login-cancel>
        Cancel
      </button>
      <button class="passport-button" type="submit">Log In</button>
    </div>
  </form>
`;
document.body.appendChild(loginDialog);

const logoutDialog = document.createElement("dialog");
logoutDialog.className = "passport-dialog";
logoutDialog.dataset.logoutDialog = "";
logoutDialog.innerHTML = `
  <div class="passport-form">
    <h2>Log out?</h2>
    <p>Would you like to log out of your account?</p>
    <div class="passport-actions">
      <button class="passport-button ghost-button" type="button" data-logout-cancel>
        Cancel
      </button>
      <button class="passport-button" type="button" data-logout-confirm>
        Log out
      </button>
    </div>
  </div>
`;
document.body.appendChild(logoutDialog);

const loginForm = loginDialog.querySelector("[data-login-form]");
const loginTitle = loginDialog.querySelector("[data-login-title]");
const loginCopy = loginDialog.querySelector("[data-login-copy]");
const loginError = loginDialog.querySelector("[data-login-error]");
const loginCancel = loginDialog.querySelector("[data-login-cancel]");
const logoutCancel = logoutDialog.querySelector("[data-logout-cancel]");
const logoutConfirm = logoutDialog.querySelector("[data-logout-confirm]");
const gatedTrailLinks = Array.from(document.querySelectorAll("[data-requires-login]"));
const gatedPassportLinks = Array.from(
  document.querySelectorAll('a[href="./Passport.html"]')
);

let pendingNavigationHref = "";
let saveStampAfterLogin = false;
let savePhotosAfterLogin = false;

const openLoginDialog = ({
  title = "Log in to continue",
  copy = "Use your email and password to save or continue your Trinket Trails progress.",
  href = "",
  saveStamp = false,
  savePhotos = false,
} = {}) => {
  pendingNavigationHref = href;
  saveStampAfterLogin = saveStamp;
  savePhotosAfterLogin = savePhotos;
  loginTitle.textContent = title;
  loginCopy.textContent = copy;
  loginError.hidden = true;
  loginError.textContent = "";
  loginForm.reset();
  loginDialog.showModal();
};

const closeLogoutDialog = () => {
  logoutDialog.close();
};

const handleUserLogout = () => {
  window.sessionStorage.removeItem(ACTIVE_USER_KEY);
  window.sessionStorage.removeItem(ART_WALK_STAMP_PENDING_KEY);
  syncLoginButton();
  syncPassportStamp();

  if (typeof window.clearArtWalkUserPhotos === "function") {
    window.clearArtWalkUserPhotos();
  }

  closeLogoutDialog();
};

loginCancel.addEventListener("click", () => {
  saveStampAfterLogin = false;
  savePhotosAfterLogin = false;
  pendingNavigationHref = "";
  loginDialog.close();
});

loginDialog.addEventListener("click", (event) => {
  const bounds = loginDialog.getBoundingClientRect();
  const clickedBackdrop =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;

  if (clickedBackdrop) {
    saveStampAfterLogin = false;
    savePhotosAfterLogin = false;
    pendingNavigationHref = "";
    loginDialog.close();
  }
});

logoutCancel.addEventListener("click", () => {
  closeLogoutDialog();
});

logoutConfirm.addEventListener("click", () => {
  handleUserLogout();
});

logoutDialog.addEventListener("click", (event) => {
  const bounds = logoutDialog.getBoundingClientRect();
  const clickedBackdrop =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;

  if (clickedBackdrop) {
    closeLogoutDialog();
  }
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const result = ensureUserAccount(email, password);

  if (!result.ok) {
    loginError.textContent = result.error;
    loginError.hidden = false;
    return;
  }

  if (saveStampAfterLogin) {
    window.sessionStorage.setItem(ART_WALK_STAMP_PENDING_KEY, "true");
  }

  consumePendingStampForActiveUser();
  syncPassportStamp();
  syncLoginButton();

  if (savePhotosAfterLogin && typeof window.saveArtWalkPhotosForUser === "function") {
    window.saveArtWalkPhotosForUser(result.email);
  } else if (typeof window.loadArtWalkPhotosForCurrentUser === "function") {
    window.loadArtWalkPhotosForCurrentUser();
  }

  const nextHref = pendingNavigationHref;
  saveStampAfterLogin = false;
  savePhotosAfterLogin = false;
  pendingNavigationHref = "";
  loginDialog.close();

  if (nextHref && nextHref !== "#stay") {
    window.location.href = nextHref;
  }
});

if (loginTrigger) {
  loginTrigger.addEventListener("click", () => {
    if (isUserSessionActive()) {
      logoutDialog.showModal();
      return;
    }

    openLoginDialog({
      title: "Log in to your account",
      copy: "Use your email and password to save or continue your Trinket Trails progress.",
    });
  });
}

gatedTrailLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (isUserSessionActive()) {
      return;
    }

    event.preventDefault();
    openLoginDialog({
      title: "Log in to start this trail",
      copy: "Log in first so your photos and stamps can be saved to your account.",
      href: link.getAttribute("href") || "",
    });
  });
});

gatedPassportLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (isUserSessionActive()) {
      return;
    }

    event.preventDefault();
    openLoginDialog({
      title: "Log in to view your passport",
      copy: "Log in to open your passport and see the stamps saved to your account.",
      href: link.getAttribute("href") || "",
      saveStamp: window.sessionStorage.getItem(ART_WALK_STAMP_PENDING_KEY) === "true",
    });
  });
});

syncLoginButton();

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
const finishTrailPassportLink = document.querySelector("[data-finish-trail-passport-link]");
const passportEarnedStamp = document.querySelector("[data-passport-earned-stamp]");
const trailQrLink = document.querySelector("[data-trail-qr-link]");
const cameFromTrailFlow = /\/(start-trail|finish-trail)\.html$/i.test(
  document.referrer || ""
);

if (trailProgress && !cameFromTrailFlow) {
  window.sessionStorage.removeItem(ART_WALK_STARTED_KEY);
  window.sessionStorage.removeItem(ART_WALK_FINISHED_KEY);
  window.sessionStorage.removeItem(ART_WALK_REWARD_PENDING_KEY);
  window.sessionStorage.removeItem(ART_WALK_STAMP_PENDING_KEY);
}

const syncPassportStamp = () => {
  if (!passportEarnedStamp) {
    return;
  }

  consumePendingStampForActiveUser();
  passportEarnedStamp.hidden = !getUserHasArtWalkStamp();
};

const syncArtWalkTrackerState = () => {
  if (!trailProgress) {
    return;
  }

  const started = window.sessionStorage.getItem(ART_WALK_STARTED_KEY) === "true";
  const finished = window.sessionStorage.getItem(ART_WALK_FINISHED_KEY) === "true";

  trailProgress.classList.toggle("is-started", started);
  trailProgress.classList.toggle("is-finished", finished);

  if (startTrailTrigger) {
    startTrailTrigger.setAttribute("aria-disabled", started ? "true" : "false");
  }

  if (finishTrailTrigger) {
    finishTrailTrigger.setAttribute(
      "aria-disabled",
      !started || finished ? "true" : "false"
    );
  }

  if (trailQrLink) {
    trailQrLink.href = started && !finished ? "./finish-trail.html" : "./start-trail.html";
  }
};

const openFinishRewardDialog = () => {
  if (!finishTrailRewardDialog) {
    return;
  }

  finishTrailRewardDialog.showModal();
};

syncPassportStamp();
syncArtWalkTrackerState();

if (startTrailTrigger && startTrailDialog && startTrailNo && startTrailYes) {
  startTrailTrigger.addEventListener("click", () => {
    if (window.sessionStorage.getItem(ART_WALK_STARTED_KEY) === "true") {
      return;
    }

    startTrailDialog.showModal();
  });

  startTrailNo.addEventListener("click", () => {
    startTrailDialog.close();
  });

  startTrailYes.addEventListener("click", () => {
    window.sessionStorage.setItem(ART_WALK_STARTED_KEY, "true");
    window.sessionStorage.removeItem(ART_WALK_FINISHED_KEY);
    window.sessionStorage.removeItem(ART_WALK_REWARD_PENDING_KEY);
    window.sessionStorage.removeItem(ART_WALK_STAMP_PENDING_KEY);
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
    const started = window.sessionStorage.getItem(ART_WALK_STARTED_KEY) === "true";
    const finished = window.sessionStorage.getItem(ART_WALK_FINISHED_KEY) === "true";

    if (!started || finished) {
      return;
    }

    finishTrailDialog.showModal();
  });

  finishTrailNo.addEventListener("click", () => {
    finishTrailDialog.close();
  });

  finishTrailYes.addEventListener("click", () => {
    if (window.sessionStorage.getItem(ART_WALK_STARTED_KEY) !== "true") {
      finishTrailDialog.close();
      return;
    }

    if (isUserSessionActive()) {
      setUserArtWalkStamp();
    } else {
      window.sessionStorage.setItem(ART_WALK_STAMP_PENDING_KEY, "true");
    }

    window.sessionStorage.setItem(ART_WALK_FINISHED_KEY, "true");
    window.sessionStorage.setItem(ART_WALK_REWARD_PENDING_KEY, "true");
    syncPassportStamp();
    syncArtWalkTrackerState();
    finishTrailDialog.close();
    openFinishRewardDialog();
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
  const makeHandleFromName = (value) => {
    const handle = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 18);

    return handle ? `@${handle}` : "@trailfriend";
  };
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

  const serializeUserPhotos = (email = getActiveUserEmail()) =>
    trailPhotos
      .filter((photo) => photo.owner === "yours" && !photo.pending)
      .map(({ id, owner, src, name, date, description, x, y, size }) => ({
        id,
        owner,
        src,
        name,
        uploader: getUsernameFromEmail(email)
          ? `@${getUsernameFromEmail(email)}`
          : "@trailfriend",
        date,
        description,
        x,
        y,
        size,
      }));

  const loadSavedUserPhotos = (email = getActiveUserEmail()) => {
    const sharedPhotos = trailPhotos.filter((photo) => photo.owner === "others");
    const savedPhotos = getUserSavedPhotos(email).map((photo) => ({
      ...photo,
      pending: false,
    }));

    trailPhotos.length = 0;
    trailPhotos.push(...sharedPhotos, ...savedPhotos);
    pendingPhotoId = null;
    confirmPlacement.hidden = true;
    renderTrailPhotos();
  };

  const saveArtWalkPhotosForUser = (email = getActiveUserEmail()) => {
    if (!normalizeEmail(email)) {
      return;
    }

    setUserSavedPhotos(serializeUserPhotos(email), email);
    loadSavedUserPhotos(email);
  };

  window.saveArtWalkPhotosForUser = saveArtWalkPhotosForUser;
  window.loadArtWalkPhotosForCurrentUser = () => {
    if (isUserSessionActive()) {
      loadSavedUserPhotos();
    }
  };
  window.clearArtWalkUserPhotos = () => {
    const sharedPhotos = trailPhotos.filter((photo) => photo.owner === "others");
    trailPhotos.length = 0;
    trailPhotos.push(...sharedPhotos);
    pendingPhotoId = null;
    confirmPlacement.hidden = true;
    renderTrailPhotos();
  };

  trailPhotos.forEach((photo) => {
    if (photo.owner === "others" && !photo.date) {
      photo.date = randomSharedDate();
    }
  });

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
      uploader: isUserSessionActive()
        ? `@${getUsernameFromEmail(getActiveUserEmail())}`
        : makeHandleFromName(name),
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

    if (isUserSessionActive()) {
      saveArtWalkPhotosForUser();
      return;
    }

    if (
      window.confirm("Log in to save this photo to your trail map?")
    ) {
      openLoginDialog({
        title: "Log in to save your photo map",
        copy: "Use your email and password to save or continue your Trinket Trails progress.",
        href: "#stay",
        savePhotos: true,
      });
    }
  });

  filterOthers.addEventListener("change", renderTrailPhotos);
  filterYours.addEventListener("change", renderTrailPhotos);
  if (isUserSessionActive()) {
    loadSavedUserPhotos();
  } else {
    renderTrailPhotos();
  }
}
