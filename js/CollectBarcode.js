import { html, useEffect, useState, useReducer, useRef, usePromise, useLocalStorage } from './common.js'
import { useCategoriesLoader, useObjectListLoader } from './data.js'

const fetchStream = () => navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: {
            ideal: "environment"
        }
    },
    audio: false
})

function ScanBarcode(props) {
    const { paused, onResult } = props
    const ref = useRef(null)
    const { isLoading, data, error } = usePromise(fetchStream, { resolve: true })
    const barcodeDetect = useRef(null)
    const [supportedBarcodeFormat, setSupportedBarcodeFormat] = useState([])
    const getListOfBarcodes = async () => {
        const barcodeFormats = await BarcodeDetector.getSupportedFormats()
        setSupportedBarcodeFormat(barcodeFormats)
    }
    useEffect(() => getListOfBarcodes(), [])
    useEffect(() => {
        if (!!data && !!ref.current) {
            ref.current.srcObject = data
            ref.current.play()
            return () => {
                ref.current.pause()
                data.getTracks().forEach(track => track.stop())
            }
        }
    }, [data])
    useEffect(() => {
        if (!!data && supportedBarcodeFormat.length > 0 && !!ref.current) {
            const barcodeDetector = new BarcodeDetector({ formats: supportedBarcodeFormat })
            let handle = window.setInterval(async () => {
                if (!paused) {
                    const barcodes = await barcodeDetector.detect(ref.current)
                    if (barcodes.length <= 0) { }
                    else {
                        onResult(barcodes.map(x => x.rawValue))
                        console.log("found !", barcodes)
                    }
                }
            }, 1000)
            return () => {
                window.clearInterval(handle)
            }
        }
    }, [supportedBarcodeFormat, data, paused])
    useEffect(() => {
        if (paused) {
            ref.current.pause()
        } else {
            ref.current.play()
        }
    }, [paused])
    return html`
        <div class="CollectBarcodeStreamContainer">
            <video ref=${ref} class="CollectBarcodeStream"  />
        </div>
    `
}

function reducer(state, action) {
    switch (action.type) {
        case "found":
            const idx = state.found.indexOf(action.barcode)
            if (idx == -1) {
                return { ...state, found: [...state.found, action.barcode] }
            } else {
                return state
            }
        case "reset":
            return { ...state, found: [] }
        case "reset-admin":
            return { ...state, expected: [], found: [] }
        case "record":
            const nextExpected = action.barcodes.reduce((acc, c) => {
                const idx = acc.indexOf(c)
                if (idx == -1) {
                    return [...acc, c]
                } else {
                    acc.splice(idx, 1)
                    return acc
                }
            }, state.expected)
            return { ...state, expected: nextExpected }
    }
}

function showFound(state) {
    const { found } = state
    if (found) {
        return html`<div class="CollectBarcodeOK">Bravo ! Tu as trouvé !</div>`
    } else {
        return html`<div class="CollectBarcodeNotOK">Perdu, trouve autre chose !</div>`
    }
}

export default function () {
    const [paused, setPaused] = useState(false)
    const [recordMode, setRecordMode] = useState(false)
    const [state, dispatch] = useLocalStorage("collect-barcode", reducer, { expected: [], found: [] })
    const [currentBarcodes, setCurrentBarcodes] = useState([])
    const [found, setFound] = useState(null)
    const togglePause = () => {
        setPaused(!paused)
    }
    const toggleRecord = () => {
        setRecordMode(!recordMode)
    }
    const barcodeFound = (barcodes) => {
        setPaused(true)
        setCurrentBarcodes(barcodes)
    }
    const test = () => {
        let result = window.prompt("Code barre ?")
        if (!!result) {
            barcodeFound([result])
        }
    }
    const reset = () => {
        dispatch(recordMode ? "reset-admin" : "reset")
    }
    useEffect(() => {
        if (currentBarcodes.length > 0) {
            if (recordMode) {
                dispatch("record", { barcodes: currentBarcodes })
            } else {
                setFound(
                    currentBarcodes.reduce((acc, barcode) => {
                        if (state.expected.indexOf(barcode) == -1) {
                            return acc
                        } else {
                            dispatch("found", { barcode: barcode })
                            return true
                        }
                    }, false))
            }
            let handle = window.setTimeout(() => {
                setFound(null)
                setPaused(false)
            }, 5000)
            return () => window.clearTimeout(handle)
        }
    }, [currentBarcodes])
    return html`
    <div class="CollectBarcode ${paused ? "CollectBarcodePaused" : ""} ${recordMode ? "CollectBarcodeRecord" : ""}">
        <${ScanBarcode} paused=${paused} onResult=${barcodeFound} />
        <div class="CollectBarcodeResults">
            <div>
                <button onclick=${toggleRecord}>Record</button>
                <button onclick=${togglePause}>pause</button>
                <button onclick=${test}>test</button>
                <button onclick=${reset}>Reset</button>
            </div>
        <h3>${state.found.length} / ${state.expected.length}</h3>
        ${found == null ? html`` : html`<${showFound} found=${found} />`}
        ${recordMode ? state.expected.map(barcode => html`<div>${barcode}</div>`) : ""}
        </div>
    </div>`
}