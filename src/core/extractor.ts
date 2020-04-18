import {Serializer} from "./serializer";
import {Score} from "./score";
import {Sanitizer} from "./sanitizer";
import {VNode} from "./types";

export const Extractor = {
    /**
     * parse a HTML element and its children into a VNode tree
     * @param root
     */
    content(root: HTMLElement): VNode{
        let topScore = 0, topNode
        let body = (function recurse(elem){
            const node = Serializer.parse(elem) as VNode
            if (node.type == 'text' || !node){
                return node
            }
            const children = elem.childNodes || elem.children
            for (let i = 0; i < children.length; i++){
                const childVNode = recurse(children[i] as HTMLElement)
                if (childVNode){
                    node.nodes.push(childVNode)
                    Score.addToParent(node, childVNode)
                }
            }
            if (node.score > topScore){
                topScore = node.score
                topNode = node
            }
            return node
        })(root)
        console.log(body)
        return Sanitizer.preprocess(topNode)
    },

    title(): string{
        const headings = document.querySelectorAll('h1')
        if (headings.length === 1){
            return headings[0].textContent
        } else if (headings.length > 0){
            // if there are more than one `h1` element, use `compareDocumentPosition` to find out the one with the highest level in DOM tree .
            let topH1 = headings[0]
            for (let i = 1; i < headings.length; i++){
                const curH1 = headings[i]
                let r = topH1.compareDocumentPosition(curH1)
                if (r == 2 || r == 8){
                        topH1 = curH1
                }
            }
            return topH1.textContent
        }
        // otherwise use document Title
        return document.title
    },

    favicon(): string | null{
        const selector = 'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
            iconLinks = document.querySelectorAll(selector)
        if (iconLinks.length > 0){
            return (iconLinks[0] as HTMLLinkElement).href || iconLinks[0].getAttribute('href') || null
        }
        return null
    },

    /*
    * Get text direction. rtl or ltr
    * Languages such as Arabic is writing from right to left.
    * */
    direction(articleNode: VNode): string{
        return window.getComputedStyle(articleNode.element).direction || document.dir || 'ltr'
    }
}
