import CommonConfig from '../../config/commonConfig'
import uuidv4 from 'uuid/v4'
const Cascade = [
  {
    name: i18n('cascade', '级联'),
    required: 1,
    code: 'cascade',
    type: 'cascader',
    defaultValue: [{
      label: '',
      value: uuidv4(),
      children: [{
        label: '',
        value: uuidv4(),
        children: [{
          label: '',
          value: uuidv4(),
          children: []
        }]
      }]
    }]
  }
]
const TreeSel = [
  {
    name: i18n('cascade', '级联'),
    required: 1,
    code: 'treeVos',
    type: 'treeSel',
    defaultValue: [{
      label: '',
      value: uuidv4(),
      children: [{
        label: '',
        value: uuidv4(),
        children: [{
          label: '',
          value: uuidv4(),
          children: []
        }]
      }]
    }]
  }
]

export const cascade = [...CommonConfig, ...Cascade]
export const treeSel = [...CommonConfig, ...TreeSel]
