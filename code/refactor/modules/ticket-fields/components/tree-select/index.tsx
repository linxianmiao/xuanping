import React, { FC } from 'react'
import { TreeSelect } from '@uyun/components'

interface Props {
  info: []
  config: {}
}

const TreeSel: FC<Props> = props => {
  const { config, children } = props
  return (
    <TreeSelect
      {...config}
      allowClear
      multiple
      showSearch
      treeCheckable
      notFoundContent={'无法找到'}
      placeholder={'请选择'}
    >
      {children}
    </TreeSelect>
  )
}

export default TreeSel
