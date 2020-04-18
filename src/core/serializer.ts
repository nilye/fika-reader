import { EXCLUDE_TAGS } from './config'
import { Score } from "./score";
import {VNode, VNodeType} from "./types";

export const Serializer = {

	displayType(elem: HTMLElement): VNodeType {
		if (this.isText(elem)){
			return 'inline'
		}
		const display = window.getComputedStyle(elem).display
		switch(display){
			case 'inline':
				return 'inline'
			case 'none':
				return false
			default:
				return 'block'
		}
	},

	isVisible(elem: HTMLElement): boolean{
		if (this.isText(elem)){
			elem = elem.parentElement
		}
		const rectList = elem.getClientRects()
		if (rectList.length === 0) return false

		// map width and height
		let maxWidth = 0, maxHeight = 0
		for (let i = 0; i < rectList.length; i++){
			const rect = rectList[i]
			if (rect.width > maxWidth) maxWidth = rect.width
			if (rect.height > maxHeight) maxHeight = rect.height
		}

		return !!(maxWidth > 1 && maxHeight > 1)
	},

	isText({ nodeType }: HTMLElement): boolean{
		return nodeType === 3
	},

	isElement({ nodeType }: HTMLElement): boolean{
		return nodeType === 1
	},

	hasChild(node: VNode): boolean{
		return node.nodes && node.nodes.length > 0
	},

	/**
	 * create VNode from a HTML element
	 * @param elem
	 */
	parse(elem: HTMLElement): VNode | false{
		const { tagName, nodeName, textContent, nodeValue } = elem
		/*
		* ignore element for these cases:
		* 1. exclude tag name
		* 2. isn't text node, but has not childNodes
		* 3. display is none or not visible
		* 4. nodeValue is null and has not text content
		*/
		if (EXCLUDE_TAGS.includes(tagName || nodeName)) return false

		const isText = this.isText(elem)
		if (!isText && elem.childNodes.length == 0) return false

		const displayType = this.displayType(elem)
		if (!displayType || !this.isVisible(elem) ||
			(!nodeValue && textContent.length == 0)){
			return false
		}

		const score = Score.get(elem)
		if (score == 0 && isText) return false

		if (isText && nodeValue){
			return {
				type: 'text',
				score,
				text: textContent,
			}
		} else if (this.isElement(elem)){
			return {
				type: displayType,
				score,
				tag: tagName.toLowerCase(),
				element: elem,
				nodes: []
			}
		}
	}
}
