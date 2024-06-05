import {
  h,
  Component,
  render,
} from "https://unpkg.com/htm/preact/index.mjs?module";
import {
  useEffect,
  useState,
  useReducer,
  useRef,
  useCallback,
  useMemo,
} from "https://unpkg.com/preact@latest/hooks/dist/hooks.module.js?module";
import htm from "https://unpkg.com/htm?module";
const html = htm.bind(h);

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

function useLocalStorage(keyname, reducer, initialState) {
  const [state, dispatch] = useReducer(
    reducer,
    JSON.parse(window.localStorage.getItem(keyname)) || initialState
  );
  const cb = useCallback((tpe, data) => {
    dispatch({ type: tpe, ...data });
  });
  useEffect(() => {
    window.localStorage.setItem(keyname, JSON.stringify(state));
  }, [state]);
  return [state, cb];
}

function usePromise(fn, { resolve = false, resolveCondition = [] }) {
  const [isLoading, setLoading] = useState(resolve);
  const [data, setData] = useState();
  const [error, setError] = useState();
  const [lastUpdated, setLastUpdated] = useState();
  const request = (...args) => {
    let isValid = true;
    setLoading(true);
    fn(...args)
      .then((result) => {
        if (!isValid) return;
        setData(result);
        setLastUpdated(Date.now());
      })
      .catch((err) => {
        if (!isValid) return;
        setError(err);
      })
      .finally(() => {
        if (!isValid) return;
        setLoading(false);
      });

    return () => {
      isValid = false;
    };
  };

  if (resolve) {
    useEffect(request, resolveCondition);
  }

  return { request, data, isLoading, lastUpdated, error };
}

export {
  Component,
  html,
  render,
  useDebounce,
  useEffect,
  useReducer,
  useRef,
  useState,
  usePromise,
  useLocalStorage,
  useCallback,
  useMemo,
};
