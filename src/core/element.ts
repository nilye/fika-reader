import {VNodeType} from "./serializer";

export const Element = {
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

		return !!(maxWidth > 100 && maxHeight > 12)
	},

	isText({ nodeType }: HTMLElement): boolean{
		return nodeType === 3
	},

	isElement({ nodeType }: HTMLElement): boolean{
		return nodeType === 1
	}
}
