import { useState, useEffect } from "./common.js"

let categoryList = [
    { id: "family", name: "Famille" },
    { id: "other", name: "Autre" },
]

let objectList = [
    { categoryId: "family", name: "Papa" },
    { categoryId: "family", name: "Maman" },
    { categoryId: "family", name: "Papi" },
    { categoryId: "family", name: "Mamie" },
    { categoryId: "family", name: "Papou" },
    { categoryId: "family", name: "Mamou" },
    { categoryId: "other", name: "Voiture" },
    { categoryId: "other", name: "Maison" },
    { categoryId: "other", name: "Ecole" },
]

function useCategoriesLoader(handler) {
    useEffect(() => {
        handler(categoryList)
    }, [false])
}

function useObjectListLoader(categoryId, handler) {
    useEffect(() => {
        handler(objectList.filter(x => x.categoryId == categoryId))
    }, [categoryId])
}

export { useCategoriesLoader, useObjectListLoader }