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

function useCategories() {
    const [categories, setCategories] = useState(null)

    useEffect(() => {
        setCategories(categoryList)
    })

    return categories
}

function useObjectListLoader(categoryId, loader) {
    //const [list, setList] = useState(null)

    useEffect(() => {
        //setList(categoryId == null ? null : objectList.filter(x => x.categoryId == categoryId))
        loader(objectList.filter(x => x.categoryId == categoryId))
    }, [categoryId])
}

export { useCategories, useObjectListLoader }