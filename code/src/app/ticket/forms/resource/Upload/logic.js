/**
 * 取资产类型的叶子节点
 */
export function getAssetCategoryLeaves(nodes) {
  const result = []

  function getLeaves(children) {
    children.forEach(child => {
      if (child.dataType === 'class') {
        result.push(child)
      } else if (child.children.length > 0) {
        getLeaves(child.children)
      }
    })
  }

  getLeaves(nodes)
  return result
}
