import {NEGATIVE_ATTR, FAVORED_TAGS, PARAGRAPH_TAGS, SECONDARY_TAGS, POSITIVE_ATTR} from "./config";
import {VNode} from "./serializer";

interface Score {
    score: number,
    lvl: number // level set to parent
}

export const Score = {
    get(elem: HTMLElement): number{
        let { nodeName, innerText, className, id } = elem,
            score = 0

        if (nodeName === '#text'){
            return Score.text(elem)
        }
        if (nodeName === 'ARTICLE' && innerText.length > 400){
            score = innerText.length
        }

        // some SVG element will not return proper className or id as String
        if (typeof className !== 'string' || typeof id !== 'string'){
            return 0
        }

        // check exclude attr
        className = className.toLowerCase()
        id = id.toLowerCase()
        for (let attr of NEGATIVE_ATTR){
            if (className.indexOf(attr) !== -1 || id.indexOf(attr) !== -1){
                score -= 15
            }
        }
        for (let attr of POSITIVE_ATTR){
            if (className.indexOf(attr) !== -1 || id.indexOf(attr) !== -1){
                score += 25
            }
        }

        // score other element node
        if (FAVORED_TAGS.includes(nodeName)){
            score += 10
        } else if (nodeName === 'DIV'){
            score += this.div(elem)
        } else if (SECONDARY_TAGS.includes(nodeName)){
            score += 3
        }
        return score
    },

    text(elem): number {
        let {nodeValue, parentElement} = elem,
            parentTag = parentElement.nodeName,
            score = 1
        nodeValue = nodeValue.replace(/\n|\s|\r/g, '')
        if (nodeValue){
            if (FAVORED_TAGS.includes(parentTag)) {
                score = 5
            } else if (parentTag === 'DIV') {
                score = 2
            }

            if (nodeValue.length > 50) {
                score = 10
            }
            if (PARAGRAPH_TAGS.includes(parentTag)) {
                score += nodeValue.length
                score += this.commas(nodeValue)
            }
            return score
        }
        return 0
    },

    commas(text: string): number{
        return text.match(/,|，|.|。/g).length * 2 || 0
    },

    div(elem: HTMLElement): number{
        const { offsetWidth, offsetHeight, offsetLeft } = elem,
            winWidth = window.innerWidth,
            winHeight = window.innerHeight
        if (offsetWidth > elem.parentElement.offsetWidth/2){
            return 1
        }

        // width
        if (offsetWidth < winWidth/6){
            return -10
        } else if (offsetWidth < 200){
            return -5
        }

        // height
        if (offsetHeight < 100){
            return -5
        }

        if (offsetWidth + offsetLeft > winWidth/2
            && offsetHeight > winHeight*0.6){
            return 20
        }
        return 5
    },

    level(node:VNode, childNode:VNode){

    }


}
