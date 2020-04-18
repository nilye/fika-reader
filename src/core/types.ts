export type VNodeType = 'text' | 'inline' | 'block' | false

/*
* Terminology
*	type: element type
*	score: weight score
*	depth: dom tree depth till the text Element
*	text: text content (only if `type` is 'txt' )
*	tag: element tag
*	element: HTML element
*	nodes: children nodes
*/
export interface VNode {
    type: VNodeType,
    score: number,
    depth?: number,
    text?: string,
    tag?: string,
    element?: HTMLElement
    nodes?: VNode[]
}



// Rich Text Node
export interface RTNode {
    key?: string,
    tag: string,
    attr?: {
        [key: string]: string|boolean|number
    }
    text?: string,
    nodes?: RTNode[]
}

export interface TocItem {
    key: string,
    tag: 'h1' | 'h2' | 'h3',
    text: string,
    level: number
    [key: string]: any
}
