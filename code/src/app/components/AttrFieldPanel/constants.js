// 默认需要禁用的类型
export const disabledType = [
  'table',
  'customizeTable',
  'richText',
  'securityCode',
  'resource',
  'attachfile',
  'links',
  'nodeExecution',
  'ticketList',
  'timeInterval',
  'script',
  'permission',
  'jsontext'
]

//关联子流程自定义列需要展示的类型
export const enabledType = [
  'singleRowText',
  'multiRowText',
  'listSel',
  'singleSel',
  'int',
  'double',
  'dateTime',
  'user',
  'department',
  'userGroup',
  'cascader',
  'treeSel'
]

// 关联子流程通用字段
export const relateSubprocessFields = [
  { name: '序号', code: 'taskOrder', type: 'common' },
  { name: '单号', code: 'taskTicketNum', type: 'common' },
  { name: '名称', code: 'taskName', type: 'common' },
  { name: '流程模型', code: 'taskType', type: 'common' },
  { name: '所处阶段', code: 'taskStage', type: 'common' },
  { name: '当前节点', code: 'taskTache', type: 'common' }
]

// 通用属性的默认选项
export const initAttrList = [
  {
    code: 'ticketName',
    name: '工单标题'
  },
  {
    code: 'ticketNum',
    name: '流水号'
  },
  {
    code: 'processName',
    name: '模型'
  },
  {
    code: 'tacheName',
    name: '当前阶段'
  },
  {
    code: 'priority',
    name: '优先级'
  },
  {
    code: 'status',
    name: '工单状态'
  },
  {
    code: 'creatorName',
    name: '创建人'
  },
  {
    code: 'executorAndGroup',
    name: '处理人/组'
  },
  {
    code: 'creatorTime',
    name: '创建时间'
  },
  {
    code: 'updateTime',
    name: '更新时间'
  }
]

// 默认显示两个面板
export const tabPane = ['attr', 'field']

// 提取服务端返回的数据，暂时只需要这些字段
export const pickField = [
  'id',
  'code',
  'name',
  'modelId',
  'type',
  'tabStatus',
  'params',
  'cascade',
  'formData',
  'headers',
  'outsideUrl',
  'raw',
  'requestType',
  'keySel',
  'valueSel',
  'keyword',
  'filterMode',
  'dictionarySource',
  'treeVos'
]
