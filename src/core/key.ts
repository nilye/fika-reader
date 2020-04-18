const keyPool = {}
export function genKey(): string {
    const gen = () => Math.random().toString(32).substr(2, 8)
    let key = gen()
    while (keyPool.hasOwnProperty(key)) {
        key = gen()
    }
    keyPool[key] = true
    return key
}
