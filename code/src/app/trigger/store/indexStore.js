import { observable, action } from 'mobx'
// 动作信息
const actionsInfo = [
  {
    name: '邮件',
    type: 'sendEmail',
    fields: [
      {
        key: 'title',
        type: 'text',
        text: '邮件主题',
        paramSupport: true,
        required: true
      },
      {
        key: 'acceptor',
        type: 'userSelect',
        text: '收件人',
        paramSupport: false,
        required: true
      },
      {
        key: 'content',
        type: 'textarea',
        text: '邮件内容',
        paramSupport: true,
        required: true
      }
    ]
  },
  {
    name: '短信',
    type: 'sendSMS',
    fields: [
      {
        key: 'acceptor',
        type: 'userSelect',
        text: '收信人',
        paramSupport: false,
        required: true
      },
      {
        key: 'content',
        type: 'textarea',
        text: '短信内容',
        paramSupport: true,
        required: true
      }
    ]
  },
  {
    name: '站内信',
    type: 'sendSys',
    fields: [
      {
        key: 'acceptor',
        type: 'userSelect',
        text: '收信人',
        paramSupport: false,
        required: true
      },
      {
        key: 'content',
        type: 'textarea',
        text: '站内信内容',
        paramSupport: true,
        required: true
      }
    ]
  },
  {
    name: 'Chatops',
    type: 'sendChatops',
    fields: [
      {
        key: 'acceptor',
        type: 'userSelect',
        paramSupport: false,
        required: true
      },
      {
        key: 'msgType',
        type: 'select',
        paramSupport: false,
        required: true
      },
      {
        key: 'content',
        type: 'textarea',
        paramSupport: true,
        required: true
      }
    ]
  },
  {
    name: '微信',
    type: 'sendWechat',
    fields: [
      {
        key: 'acceptor',
        type: 'userSelect',
        paramSupport: false,
        required: true
      },
      {
        key: 'ticketDesc',
        type: 'textarea',
        paramSupport: true,
        required: true
      },
      {
        key: 'modelContent',
        type: 'html',
        paramSupport: false,
        required: false
      }
    ]
  },
  {
    name: '调用Restful接口',
    type: 'restful',
    fields: [
      {
        key: 'url',
        type: 'text',
        text: 'URL',
        paramSupport: false,
        required: true
      },
      {
        key: 'requestType',
        type: 'select',
        text: '请求类型',
        paramSupport: false,
        options: [
          {
            value: 'get',
            name: 'GET'
          },
          {
            value: 'post',
            name: 'POST'
          },
          {
            value: 'delete',
            name: 'DELETE'
          },
          {
            value: 'put',
            name: 'PUT'
          },
          {
            value: 'patch',
            name: 'PATCH'
          }
        ],
        required: true
      },
      {
        key: 'headers',
        text: 'Headers',
        paramSupport: false,
        type: 'mapList',
        required: false
      },
      {
        key: 'params',
        text: 'Params',
        paramSupport: false,
        type: 'tabs',
        required: false
      }
    ]
  },
  {
    name: '设置工单',
    type: 'configTicket',
    fields: [
      {
        key: 'configTicket',
        type: 'keyValue',
        text: '设置',
        paramSupport: false,
        required: true
      }
    ]
  },
  {
    name: '创建工单',
    type: 'createTicket',
    fields: [
      {
        key: 'ticketInfoList',
        type: 'createTicket',
        paramSupport: false,
        required: true
      }
    ]
  },
  {
    name: '短信',
    type: 'others',
    fields: [
      {
        key: 'acceptor',
        type: 'userSelect',
        paramSupport: false,
        required: true
      },
      {
        key: 'content',
        text: '内容',
        type: 'textarea',
        paramSupport: true,
        required: true
      }
    ]
  },
  {
    name: '发送钉钉给用户',
    type: 'sendDingDing',
    fields: [
      {
        key: 'acceptor',
        type: 'userSelect',
        text: '收信人',
        paramSupport: false,
        required: true
      },
      {
        key: 'ticketDesc',
        tip: '钉钉内容支持Markdown语法',
        text: '钉钉内容',
        type: 'textarea',
        paramSupport: true,
        required: true
      }
    ]
  }
]
class IndexStore {
  @observable triggerData = [{ key: '1', name: 'lalal', params: [] }]

  @observable titleParams = []

  // 系统属性
  @observable fullParams = []

  // restFul中的系统属性
  @observable builtinParams = []

  // 内置字段
  @observable defineParams = []

  // 自定义字段
  @observable ticketParams = []

  // 所有的工单类型的字段
  @observable actionTypes = []

  // 获取规则动作
  @observable fieldUsers = []

  // 用户类型字段
  @observable departList = []

  // 部门列表
  @observable variableUsers = [] // 变量类型

  @action getAssignUsers(id) {
    axios.get(API.get_assign_users, { params: { modelId: id } }).then((res) => {
      this.fieldUsers = res.fieldUsers
      this.variableUsers = res.variableUsers
    })
  }

  @action getFieldParams() {
    axios.get(API.get_field_params).then((res) => {
      this.titleParams = res.titleParams // 系统属性
      this.fullParams = res.fullParams // restFul中的系统属性
      this.builtinParams = res.builtinParams // 内置字段
      this.defineParams = res.defineParams // 自定义字段
      this.ticketParams = res.ticketParams // 所有的工单类型的字段
    })
  }

  @action setTriggerData(panelIndex, value) {
    this.triggerData[panelIndex].params = value
  }

  @action async getUserList(ids) {
    const res = await axios({
      url: API.USER_LIST_NO_ORG,
      method: 'post',
      data: ids ? { ids: ids.join() } : {}
    })
    return res
  }

  @action getDepartList() {
    // axios.get(API.get_depart_list_tree).then(data => {
    //   this.departList = data
    // })
  }

  @action getActionTypes(params = {}, source) {
    axios.get(API.get_noti_rule_actions, { params }).then((res) => {
      let data = res || []
      _.map(data, (item) => {
        _.map(item.executeParamPos || [], (ite) => {
          delete ite.useVar
          delete ite.remark
        })
      })
      // 新建sla需要restful
      if (source === 'policy') {
        const restfulData = _.find(actionsInfo, (item) => item.type === 'restful')
        data.map((item) => {
          if (item.type === 'restful') {
            item.executeParamPos = restfulData.fields
          }
          return item
        })
      } else {
        data = _.filter(data, (item) => item.type !== 'restful')
      }
      this.actionTypes = data
    })
  }

  @action distory() {
    this.titleParams = [] // 系统属性
    this.fullParams = [] // restFul中的系统属性
    this.builtinParams = [] // 内置字段
    this.defineParams = [] // 自定义字段
    this.ticketParams = [] // 所有的工单类型的字段
  }
}

export default IndexStore
