"use client";
export const setLocalStorage = (key, value) => {
  localStorage.setItem(
    key,
    typeof value === "string" ? value : JSON.stringify(value)
  );
};

export const clearLocalStorage = (key) => {
  localStorage.removeItem(key);
};

export const clearAllLocalStorage = () => {
  localStorage.clear();
};

export const getSetLocalStorage = (key, setterFun) => {
  const retrievedData = getLocalStorageJSONParse(key);
  if (retrievedData) setterFun(retrievedData);
};

export const getLocalStorageJSONParse = (key) => {
  const storage = localStorage.getItem(key);
  if (storage !== null && storage !== undefined) {
    return JSON.parse(storage);
  } else {
    return null;
  }
};
