import { h, Component, render } from 'https://unpkg.com/htm/preact/index.mjs?module'
import { useEffect, useState, useReducer, useRef } from 'https://unpkg.com/preact@latest/hooks/dist/hooks.module.js?module'
import htm from 'https://unpkg.com/htm?module'
const html = htm.bind(h)


function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value)
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay || 500)
        return () => {
            clearTimeout(timer)
        }
    }, [value, delay])

    return debouncedValue
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
}