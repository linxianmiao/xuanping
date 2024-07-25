/**
 * 深度遍历，找到对应id的节点
 */
export function findNodeById(data = [], id) {
  if (!data || data.length === 0) {
    return null
  }

  const length = data.length

  for (let i = 0; i < length; i++) {
    const node = data[i]

    if (node.id === id) {
      return node
    } else {
      const result = findNodeById(node.children, id)

      if (result) {
        return result
      }
    }
  }
}
