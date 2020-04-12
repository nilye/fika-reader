import { EXCLUDE_TAGS} from './config'
import { Element } from './element'
import {Score} from "./score";

export type VNodeType = 'txt' | 'inline' | 'block' | false

export interface VNode {
	type: VNodeType,
	score: number,
	text?: string,
	tag?: string,
	element?: HTMLElement
	nodes?: VNode[]
}

export const Serializer = {

	/**
	 * create VNode from a HTML element
	 * @param elem
	 */
	create(elem: HTMLElement): VNode | false{
		const { tagName, nodeName, textContent, nodeValue } = elem
		/*
		* ignore element for these cases:
		* 1. exclude tag name
		* 2. isn't text node, but has not childNodes
		* 3. display is none or not visible
		* 4. nodeValue is null and has not text content
		*/
		if (EXCLUDE_TAGS.includes(tagName || nodeName)) return false

		const isText = Element.isText(elem)
		if (!isText && elem.childNodes.length == 0) return false

		const type = Element.displayType(elem)
		if (!type || !Element.isVisible(elem)||
			(!nodeValue && textContent.length == 0)){
			return false
		}

		const score = Score.get(elem)
		if (isText && nodeValue){
			if (score === 0) return false
			return {
				type, score,
				text: textContent,
			}
		} else if (Element.isElement(elem)){
			return {
				type, score,
				tag: tagName.toLowerCase(),
				element: elem,
				nodes: []
			}
		}
	},


	/**
	 * parse a HTML element and its children into a VNode tree
	 * @param root
	 */
	parse(root: HTMLElement): VNode{
		let topScore = 0, topNode = null
		function recurse(elem){
			const node = Serializer.create(elem) as VNode
			if (node.type == 'txt' || !node){
				return node
			}
			const children = elem.childNodes || elem.children
			for (let i = 0; i < children.length; i++){
				const childVNode = recurse(children[i])
				if (childVNode){
					node.nodes.push(childVNode)
					node.score += childVNode.score * 0.5
				}
			}
			if (node.score > topScore){
				topScore = node.score
				topNode = node
			}
			return node
		}
		recurse(root)
		return topNode
	}
}
