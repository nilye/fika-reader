import './style/index.styl'
import {Extractor} from "./core/extractor";
import {Sanitizer} from "./core/sanitizer";
import {VNode} from "./core/types";


window.onload = () => {

    const content: VNode = Extractor.content(document.body),
        sanitizedContent = Sanitizer.content(content)
    const article = {
        kind: 'root',
        tag: 'article',
        title: Extractor.title(),
        favicon: Extractor.favicon(),
        domain: window.location.hostname,
        url: window.location.href,
        timestamp: new Date().getTime(),
        direction: Extractor.direction(content),
        toc: sanitizedContent.toc,
        nodes: sanitizedContent.nodes
    }

    console.log(content)
    console.log(article)
    setTimeout(()=>{
        content.element.style.border = '5px solid red'
        content.element.style.display = 'block'
    }, 2000)


}
