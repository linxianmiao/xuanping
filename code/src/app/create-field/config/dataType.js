const BUILTIN_FIELD_TYPE = [
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
  'table',
  'customizeTable',
  'richText',
  'securityCode',
  'resource',
  'attachfile',
  'tags',
  'links',
  'nodeExecution',
  'permission',
  'jsontext',
  'userGroup',
  'script',
  'relateTicketNum',
  'ticketList',
  'btn',
  'nestedTable'
]

class DataType {
  fieldType = BUILTIN_FIELD_TYPE.slice(0)

  singleRowText = {
    name: i18n('filed.single_line', '单行文本'),
    type: 'singleRowText',
    icon: 'field-type-commons iconfont icon-danxingwenben',
    fieldData: {}
  }

  multiRowText = {
    name: i18n('filed.multi_line', '多行文本'),
    type: 'multiRowText',
    icon: 'field-type-commons iconfont icon-duoxingwenben',
    fieldData: {}
  }

  listSel = {
    name: i18n('filed.list_select', '下拉菜单'),
    type: 'listSel',
    icon: 'field-type-commons iconfont icon-xiala',
    fieldData: {
      tabStatus: '0',
      params: [{ label: '', value: '', select: 0 }],
      outsideUrl: '',
      requestType: 'get',
      headers: [{ paramName: '', paramValue: '' }],
      formData: {
        isSelect: 1,
        data: [{ paramName: '', paramValue: '', paramDesc: '', isRequired: 0 }]
      },
      raw: {
        isSelect: 0,
        data: ''
      },
      thirdPartData: [],
      keySel: '',
      valueSel: ''
    }
  }

  singleSel = {
    name: i18n('filed.radio', '单选'),
    type: 'singleSel',
    icon: 'field-type-commons iconfont icon-danxuan',
    fieldData: {}
  }

  multiSel = {
    name: i18n('filed.multi_select', '多选'),
    type: 'multiSel',
    icon: 'field-type-commons iconfont icon-duoxuan',
    fieldData: {}
  }

  int = {
    name: i18n('filed.int', '整数'),
    type: 'int',
    icon: 'field-type-commons iconfont icon-zhengshu',
    fieldData: {}
  }

  double = {
    name: i18n('filed.float', '小数'),
    type: 'double',
    icon: 'field-type-commons iconfont icon-xiaoshu',
    fieldData: {}
  }

  dateTime = {
    name: i18n('filed.detetime', '日期时间'),
    type: 'dateTime',
    icon: 'field-type-commons iconfont icon-shizhong',
    fieldData: {}
  }

  timeInterval = {
    name: i18n('filed.timeInterval', '时间段'),
    type: 'timeInterval',
    icon: 'field-type-commons iconfont icon-shizhong',
    fieldData: {}
  }

  user = {
    name: i18n('filed.personnel', '人员'),
    type: 'user',
    icon: 'field-type-commons iconfont icon-renyuan',
    fieldData: {}
  }

  department = {
    name: i18n('filed.department', '部门'),
    type: 'department',
    icon: 'field-type-commons iconfont icon-bumen',
    fieldData: {}
  }

  cascader = {
    name: i18n('filed.cascade', '级联'),
    type: 'cascader',
    icon: 'field-type-commons iconfont icon-jilian',
    fieldData: {
      tabStatus: '0',
      params: [{ label: '', value: '', select: 0 }],
      outsideUrl: '',
      requestType: 'get',
      headers: [{ paramName: '', paramValue: '' }],
      formData: {
        isSelect: 1,
        data: [{ paramName: '', paramValue: '', paramDesc: '', isRequired: 0 }]
      },
      raw: {
        isSelect: 0,
        data: ''
      },
      thirdPartData: [],
      keySel: '',
      valueSel: ''
    }
  }

  table = {
    name: i18n('filed.table', '表格'),
    type: 'table',
    icon: 'field-type-commons iconfont icon-biaoge',
    fieldData: {}
  }

  richText = {
    name: i18n('filed.richText', '富文本'),
    type: 'richText',
    icon: 'field-type-commons iconfont icon-fuwenben1',
    fieldData: {}
  }

  securityCode = {
    name: i18n('filed.password', '密码'),
    type: 'securityCode',
    icon: 'field-type-commons iconfont icon-mima1',
    fieldData: {}
  }

  resource = {
    name: i18n('filed.resource', '配置项'),
    type: 'resource',
    icon: 'field-type-commons iconfont icon-peizhixiang1',
    fieldData: {}
  }

  topology = {
    name: i18n('filed.topology', '资源图'),
    type: 'topology',
    icon: 'field-type-commons iconfont icon-tupian1',
    fieldData: {}
  }

  customizeTable = {
    name: i18n('filed.customizeTable', '动态表格'),
    type: 'customizeTable',
    icon: 'field-type-commons iconfont icon-ziyuanbeifen',
    fieldData: {}
  }

  attachfile = {
    name: i18n('filed.attachfile', '附件'),
    type: 'attachfile',
    icon: 'field-type-commons iconfont icon-fujian1',
    fieldData: {}
  }

  tags = {
    name: i18n('array', '数组'),
    type: 'tags',
    icon: 'field-type-commons iconfont icon-shuzu',
    fieldData: {}
  }

  links = {
    name: i18n('filed.links', '链接'),
    type: 'links',
    icon: 'field-type-commons iconfont icon-chaolianjie',
    fieldData: {
      linkProtocol: 'http://'
    }
  }

  nodeExecution = {
    name: i18n('filed.nodeExecution', '执行目标'),
    type: 'nodeExecution',
    icon: 'field-type-commons iconfont icon-interation',
    fieldData: {}
  }

  permission = {
    name: i18n('permission-field-name', '权限自服务'),
    type: 'permission',
    icon: 'field-type-commons iconfont icon-quanxianfuwu',
    fieldData: {}
  }

  jsontext = {
    name: i18n('jsontext', 'JSON'),
    type: 'jsontext',
    icon: 'field-type-commons iconfont icon-json01',
    fieldData: {}
  }

  userGroup = {
    name: i18n('user_group', '用户组'),
    type: 'userGroup',
    icon: 'field-type-commons iconfont icon-group',
    fieldData: {}
  }

  script = {
    name: i18n('script', '脚本'),
    type: 'script',
    icon: 'field-type-commons iconfont icon-code',
    fieldData: {}
  }

  relateTicketNum = {
    name: i18n('ticket.add.ordinary.relationship', '关联工单'),
    type: 'relateTicketNum',
    icon: 'field-type-commons iconfont icon-guanlian',
    fieldData: {}
  }

  ticketList = {
    name: i18n('ticket.list', '工单列表'),
    type: 'ticketList',
    icon: 'field-type-commons iconfont icon-biaoge',
    fieldData: {}
  }

  btn = {
    name: i18n('button', '按钮'),
    type: 'btn',
    icon: 'field-type-commons iconfont icon-button',
    fieldData: {}
  }

  nestedTable = {
    name: i18n('nestedTable', '嵌套表格'),
    type: 'nestedTable',
    icon: 'field-type-commons iconfont icon-biaoge',
    fieldData: {}
  }

  add(list) {
    this.fieldType = [...new Set([...this.fieldType, ..._.map(list, (item) => item.type)])]
    _.forEach(list, (item) => {
      if (!this[item.type]) {
        this[item.type] = {
          name: window.language === 'en_US' ? item.fieldTypeName_en : item.fieldTypeName_zh,
          type: item.type,
          icon: `field-type-commons ${item.icon}` || 'field-type-commons iconfont icon-Excelgeshi',
          fieldData: {}
        }
      }
    })
  }
}
const dataType = new DataType()

// NH定制的功能，标准产品不需要
if (process.env.PLATFORM === 'ABC') {
  const list = [
    {
      name: 'Excel',
      type: 'excelImport',
      icon: 'field-type-commons iconfont icon-peizhi',
      fieldData: {}
    }
  ]
  dataType.add(list)
}
export { BUILTIN_FIELD_TYPE }
export default dataType
