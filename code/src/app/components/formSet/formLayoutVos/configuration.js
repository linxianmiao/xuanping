import dataType from '~/create-field/config/dataType'
import uuid from '~/utils/uuid'

//流程信息相关字段
export const TicketFieldList = [
  {
    code: 'flowNo',
    name: '单号',
    id: uuid(),
    iconName: 'iconfont icon-liebiaomoshi1',
    type: 'ticketField'
  },
  {
    code: 'modelName',
    id: uuid(),
    name: '工单模型',
    iconName: 'iconfont icon-deploymentunit',
    type: 'ticketField'
  },
  {
    code: 'currentStage',
    id: uuid(),
    name: '当前阶段',
    iconName: 'iconfont icon-deploymentunit',
    type: 'ticketField'
  },
  {
    code: 'status',
    name: '当前状态',
    id: uuid(),
    iconName: 'iconfont icon-dashboard',
    type: 'ticketField'
  },
  {
    code: 'currentTache',
    name: '当前节点',
    id: uuid(),
    iconName: 'iconfont icon-duorenxietong',
    type: 'ticketField'
  },
  {
    code: 'creator',
    name: '创建人',
    id: uuid(),
    iconName: 'iconfont icon-user2',
    type: 'ticketField'
  },
  {
    code: 'createTime',
    name: '创建时间',
    id: uuid(),
    iconName: 'iconfont icon-shijian',
    type: 'ticketField'
  },
  {
    code: 'excutorAndGroup',
    name: '处理组/人',
    id: uuid(),
    iconName: 'iconfont icon-tuandui',
    type: 'ticketField'
  },
  {
    code: 'slaStatus',
    name: 'SLA状态',
    id: uuid(),
    iconName: 'iconfont icon-shizhong',
    type: 'ticketField'
  },
  {
    code: 'olaStatus',
    name: 'OLA状态',
    id: uuid(),
    iconName: 'iconfont icon-shizhong',
    type: 'ticketField'
  }
]
// 联动策略支持值改变/动态值的type
export const CHANFE_FIELD_TYPE = [
  'singleRowText',
  'multiRowText',
  'listSel',
  'singleSel',
  'multiSel',
  'int',
  'double',
  'dateTime',
  'timeInterval',
  'user',
  'department',
  'cascader'
]
// 联动策略可以作为条件的type
export const CONDITION_FIELD_TYPE = [
  'singleRowText',
  'multiRowText',
  'listSel',
  'singleSel',
  'multiSel',
  'int',
  'double',
  'dateTime',
  'timeInterval',
  'user',
  'department',
  'cascader',
  'treeVos'
]

export const COMPARISON_LIST = [
  {
    value: 'EQUALS',
    name: i18n('globe.EQUALS', '等于')
  },
  {
    value: 'NOTEQUALS',
    name: i18n('globe.NOTEQUALS', '不等于')
  },
  {
    value: 'EMPTY',
    name: i18n('globe.EMPTY', '空')
  },
  {
    value: 'NOTEMPTY',
    name: i18n('globe.NOTEMPTY', '非空')
  },
  {
    value: 'CONTAINS',
    name: i18n('globe.CONTAINS', '包含'),
    types: [
      'title',
      'singleRowText',
      'multiRowText',
      'multiSel',
      'user',
      'ticketDesc',
      'singleSel',
      'layer',
      'business',
      'flowNo',
      'department',
      'listSel',
      'cascader',
      'treeSel'
    ]
  },
  {
    value: 'NOTCONTAINS',
    name: i18n('globe.NOTCONTAINS', '不包含'),
    types: [
      'title',
      'singleRowText',
      'multiRowText',
      'multiSel',
      'user',
      'ticketDesc',
      'singleSel',
      'layer',
      'business',
      'flowNo',
      'department',
      'listSel',
      'cascader',
      'treeSel'
    ]
  },
  {
    value: 'LT',
    name: i18n('globe.LT', '小于'),
    types: ['int', 'double', 'dateTime']
  },
  {
    value: 'GT',
    name: i18n('globe.GT', '大于'),
    types: ['int', 'double', 'dateTime']
  },
  {
    value: 'EARLIERTHANNOW',
    name: i18n('globe.EARLIERTHANNOW', '早于当前时间'),
    types: ['dateTime']
  },
  {
    value: 'LATERTHANNOW',
    name: i18n('globe.LATERTHANNOW', '晚于当前时间'),
    types: ['dateTime']
  }
]
// 布局列表初始信息
export const LAYOUT_LIST = [
  {
    name: i18n('model.field.vertical.group', '纵向分组'),
    icon: 'icon-liebiaomoshi1',
    type: 'group',
    description: undefined,
    fieldList: [],
    fold: 0 // O -展开  1 -收起
  },
  {
    name: i18n('model.field.tab', '标签页'),
    icon: 'icon-biaoqian',
    type: 'tab',
    description: '',
    tabs: [
      {
        name: i18n('model.field.tab', '标签页'),
        fieldList: []
      }
    ]
  },
  {
    name: i18n('model.field.vertical.panel', '面板'),
    icon: 'icon-wocanyude',
    type: 'panel',
    description: undefined,
    fieldList: []
  },
  {
    name: i18n('model.field.placeholder', '占位符'),
    icon: 'icon-zhanweifu',
    type: 'placeholder',
    fieldLayout: { col: 12 }
  }
]
// iframe 控件初始信息
export const controlList = [
  {
    name: '处理记录',
    icon: 'icon-detail', //icon-detail
    type: 'operateRecord',
    height: '500',
    isRequired: 0,
    fieldLayout: { col: 24 },
    styleAttribute: 1,
    fold: 0, // O -展开  1 -收起
    unique: true
  },
  {
    name: '关联工单',
    icon: 'icon-table',
    type: 'relateTicket',
    height: '500',
    isRequired: 0,
    fieldLayout: { col: 24 },
    styleAttribute: 1,
    fold: 0, // O -展开  1 -收起
    unique: true
  },
  {
    name: '合并工单',
    icon: 'icon-app', //icon-detail
    type: 'mergeTicket',
    height: '500',
    isRequired: 0,
    fieldLayout: { col: 24 },
    styleAttribute: 1,
    fold: 0, // O -展开  1 -收起
    unique: true
  },
  {
    name: 'SLA',
    icon: 'icon-shizhong',
    type: 'sla',
    height: '500',
    fieldLayout: { col: 24 },
    styleAttribute: 1,
    fold: 0, // O -展开  1 -收起
    unique: true // 只能拖入一个
  },
  {
    name: 'OLA',
    icon: 'icon-shizhong', //icon-detail
    type: 'ola',
    height: '500',
    isRequired: 0,
    fieldLayout: { col: 24 },
    styleAttribute: 1,
    fold: 0, // O -展开  1 -收起
    unique: true
  },
  {
    name: i18n('addonBefore-subForm', '{name}子表单', { name: ' ' }),
    icon: 'icon-biaodanguanli',
    type: 'subForm',
    mode: 0,
    hidden: false,
    fieldLayout: { col: 24 }
  },
  {
    name: '关联自动化任务',
    icon: 'icon-app',
    type: 'relate_job',
    height: '500',
    isRequired: 0,
    fieldLayout: { col: 24 },
    styleAttribute: 1,
    fold: 0, // O -展开  1 -收起
    unique: true
  },
  {
    name: '关联任务流程',
    icon: 'icon-ziliucheng2',
    type: 'relateSubProcess',
    height: '500',
    isRequired: 0,
    fieldLayout: { col: 24 },
    styleAttribute: 1,
    fold: 0, // O -展开  1 -收起
    unique: true
  },
  {
    name: '远程工单',
    icon: 'icon-yuanchengguanli',
    type: 'remoteTicket',
    height: '500',
    isRequired: 0,
    fieldLayout: { col: 24 },
    styleAttribute: 1,
    fold: 0, // O -展开  1 -收起
    unique: true
  },
  {
    name: '备注',
    icon: 'icon-yijianfankui',
    type: 'ticketComment',
    height: '500',
    isRequired: 0,
    fieldLayout: { col: 24 },
    styleAttribute: 1,
    fold: 0, // O -展开  1 -收起
    unique: true
  },
  {
    name: i18n('model.field.iframe', 'Iframe'),
    icon: 'icon-weituo',
    type: 'iframe',
    linkUrl: '',
    viewEditVo: {
      viewUrl: '',
      editUrl: ''
    },
    mode: 0,
    height: '500',
    verificationWay: 0,
    fieldLayout: { col: 24 },
    styleAttribute: 1, // iframe的样式属性 分组样式 - 1、无样式 - 0
    fold: 0, // O -展开  1 -收起
    ifPrivacy: 0
  }
]
// 新加的字段类型
export const FIELD_TYPE_LIST = _.map(dataType.fieldType, (type) => {
  return {
    // value: type === 'cascader' ? 'cascader,treeSel' : type,
    value: type,
    label: dataType[type].name
  }
})

export function getFieldList() {
  return _.map(dataType.fieldType, (type) => {
    return {
      value: type === 'cascader' ? 'cascader,treeSel' : type,
      label: dataType[type].name
    }
  })
}

// 最外层可接收类型
export const LAYOUT_CANDROP = [
  'tab',
  'sla',
  'group',
  'iframe',
  'subForm',
  'relateTicket',
  'relateSubProcess',
  'relate_job',
  'operateRecord',
  'mergeTicket',
  'ola',
  'remoteTicket',
  'ticketComment',
  'panel'
]
// 布局内可接受类型
export const FIELD_CANDROP = [
  ...dataType.fieldType,
  'job',
  'sla',
  'layer',
  'iframe',
  'treeSel',
  'business',
  'flowNo',
  'placeholder',
  'relateTicket',
  'relateSubProcess',
  'relate_job',
  'operateRecord',
  'ticketField',
  'mergeTicket',
  'ola',
  'remoteTicket',
  'ticketComment'
]
export function getFieldCandrop() {
  return [
    ...dataType.fieldType,
    'iframe',
    'layer',
    'business',
    'flowNo',
    'treeSel',
    'job',
    'placeholder',
    'sla',
    'relateTicket',
    'relateSubProcess',
    'relate_job',
    'operateRecord',
    'ticketField',
    'mergeTicket',
    'ola',
    'remoteTicket',
    'ticketComment'
  ]
}

export const FILTER = {
  id: 'filter_id',
  code: 'filter_id',
  type: 'filter_id',
  fieldLayout: { col: 24 }
}
// 不能删除的code
export const NOT_DELETE_FIELD = ['title']
// 独占一行的类型
export const EXCLUSIVE_FIELD = [
  'richText',
  'table',
  'excelImport',
  'customizeTable',
  'job',
  'permission',
  'jsontext',
  'ticketList'
]
// 必填code
export const REQUIRE_FIELD_CODE = ['title', 'urgentLevel']
// 只读code
export const AEAD_ONLY_FIELD_CODE = ['flowNoBuiltIn']
