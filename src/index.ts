import { Serializer } from './core/serializer'
import './style/index.styl'

let root = Serializer.parse(document.body)
console.log(root)
root.element.style.border = '5px solid red'
root.element.style.display = 'block'
