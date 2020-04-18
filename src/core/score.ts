import {NEGATIVE_ATTR, FAVORED_TAGS, PARAGRAPH_TAGS, SECONDARY_TAGS, POSITIVE_ATTR} from "./config";
import {VNode} from "./types";

export const Score = {

    /**
     * main entry of calculating the score of a node
     */
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
            if (className.indexOf(attr) !== -1 || id.indexOf(attr) !== -1 ){
                score -= 25
            }
        }
        for (let attr of POSITIVE_ATTR){
            if (className.indexOf(attr) !== -1 || id.indexOf(attr) !== -1){
                score += 15
            }
        }

        // score other element node
        if (FAVORED_TAGS.includes(nodeName)){
            score += 10
        } else if (nodeName === 'DIV' && score > 0){
            score += this.div(elem)
        } else if (SECONDARY_TAGS.includes(nodeName)){
            score += 3
        }
        return score
    },

    /**
     * handle text element
     */
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
                score += this.punctuation(nodeValue)
            }
            return score
        }
        return 0
    },

    /**
     * score based on number of punctuations
     * If the text contain numerous common punctuations (such as comma and period), then it is likely to be a proper paragraph or content.
     * @param text
     */
    punctuation(text: string): number{
        return text.match(/,|，|.|。/g).length * 2 || 0
    },

    /**
     * handle div element
     * This method takes visual area to be a considerable dimension.
     * @param elem
     */
    div(elem: HTMLElement): number{
        const { offsetWidth, offsetHeight, offsetLeft } = elem,
            winWidth = window.innerWidth,
            winHeight = window.innerHeight

        // width
        if (offsetWidth < winWidth/6 || offsetWidth < 200){
            return -5
        }
        // height
        if (offsetHeight < 100){
            return -2
        }
        if (offsetWidth + offsetLeft > winWidth/2
            && offsetHeight > winHeight*0.618){
            return 100
        }
        if (offsetWidth > winWidth - 32){
            return -100
        }
        return 5
    },

    /**
     * add child score to parent
     * @param parent
     * @param child
     */
    addToParent(parent:VNode, child:VNode){
        const { depth } = child,
            childLength = parent.nodes.length
        if (child.type === 'text'){
            parent.depth = 2
        }
        if (depth > 0 && depth <= 2){
            const shallDegrade = (childLength === 0 ||
                FAVORED_TAGS.includes(child.tag)) &&
                parent.depth > 0
            const maxChildDepth = Math.max(depth, ...parent.nodes.map(n=>{
                    return n.depth || 0
                }))
            parent.depth = shallDegrade ? 1 : maxChildDepth - 1
        }
        if (child.score > 0 && childLength > 1 && depth > 0 ){
            parent.score += child.score
        }
    }

}
