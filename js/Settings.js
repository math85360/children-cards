import { html, useState } from './common.js'
import { useCategoriesLoader, useObjectListLoader } from './data.js'

function Category(props) {
    const [objectList, setObjectList] = useState(null)
    const active = props.activeSnap[0]?.id == props.category.id
    useObjectListLoader(active ? props.category.id : null, list => setObjectList(list))
    const children = (objectList || []).map(o => html`<div>${o.name}</div>`)
    console.log("Category", props, objectList)
    function toggle() {
        props.activeSnap[1](active ? null : props.category)
    }
    return [html`<h2 onclick="${toggle}">${props.category.name}</h2>`, ...children]
}


export default function (props) {
    const [categories, setCategories] = useState([])
    const activeSnap = useState(null)
    const [activeCategory, setActiveCategory] = activeSnap

    useCategoriesLoader(categories => setCategories(categories))

    function addCategory() {

    }

    let newCategory = html`<button onclick=${addCategory}> Ajouter une catégorie</button>`

    return [...categories.map(cat => html`<${Category} category=${cat} activeSnap=${activeSnap} />`), newCategory]
}