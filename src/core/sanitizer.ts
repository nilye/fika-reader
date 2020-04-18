import {genKey} from "./key";
import {RTNode, TocItem, VNode} from "./types";
import {Serializer} from "./serializer";

const BLOCK_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'blockquote', 'img', 'figure', 'table', 'ul', 'ol', 'dl', 'hr', 'div']
const TOC_HEADINGS = ['h1','h2','h3']


export const Sanitizer = {
    /**
     * Pre-process the found target node, to search down its children and looking for more precise target by doing:
     * 1. Get rid of negative value.
     * 2. If a node has only one child, take its child instead.
     * @param node
     */
    preprocess(node: VNode): VNode {
        if (!node.nodes || !node) return null
        if (node.nodes.length < 3) {
            for (let i = 0; i < node.nodes.length; i++) {
                const item = node.nodes[i]
                if (item.score < 0) {
                    node.nodes.splice(i, 1)
                    i--
                }
            }
        }
        if (node.nodes.length === 0) return null
        if (node.nodes.length === 1) {
            return this.preprocess(node.nodes[0])
        }
        return node
    },

    /**
     * convert to Fika rich text data format
     * @param root
     */
    content(root: VNode){
        let toc: TocItem[] = []
        let contentNodes = (function recurse(node): RTNode {
            const {type, tag, element, nodes, text} = node
            let rt: RTNode = {
                    key: genKey(),
                    tag: tag,
                    attr: {}
                }

            // recurse child nodes
            if (Serializer.hasChild(node)){
                rt['nodes'] = []
                for (let i = 0; i < nodes.length; i++){
                    let child = recurse(nodes[i])
                    if (child){
                        rt.nodes.push(child)
                    }
                }
            }

            if (type == 'text') {
                delete rt['tag']
                if (!text || !text.replace(/\r\n|\n|\r|\s+/gm, '')) return
                rt.text = text
            }

            else if (TOC_HEADINGS.includes(tag)){
                toc.push({
                    ...rt,
                    level: parseInt(tag.slice(-1)) as number,
                    text: element.innerText
                } as TocItem)
            }

            else if (tag === 'pre'){
                Sanitizer.escape(rt)
            }

            else if (tag === 'img'){
                const dataSrc = element.getAttribute('data-src')
                rt.attr.src = dataSrc || (element as HTMLImageElement).src
                rt.attr.height = element.offsetHeight
                rt.attr.width = element.offsetWidth
                if (type == 'inline'){
                    rt = {
                        key: genKey(),
                        tag: 'span',
                        nodes: [rt]
                    }
                }
            }

            else if (tag === 'a'){
                rt.attr.href = (element as HTMLLinkElement).href
            }

            //
            if (Object.keys(rt.attr).length == 0){
                delete rt['attr']
            }
            return rt
        })(root)
        return {toc, nodes: contentNodes}
    },

    escape(node){
        const { nodes } = node
        if (Serializer.hasChild(node)){
            for (let i = 0; i < nodes.length; i++){
                const item = nodes[i]
                if (item.type === 'text'){
                    node.nodes[i].text = item.text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                } else if (item.tag == 'br'){
                    node.nodes[i] = {
                        type: 'text',
                        text: '\n',
                    }
                } else {
                    node.nodes[i] = this.escape(item)
                }
            }
        }
    }
}
