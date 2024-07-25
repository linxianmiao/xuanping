// 触发事件类型列表
export const incidentList = [
  {
    code: 'created',
    name: '工单创建'
  },
  {
    code: 'submit',
    name: '工单提交'
  },
  {
    code: 'accept',
    name: '工单接单'
  },
  {
    code: 'rollback',
    name: '工单回退'
  },
  {
    code: 'reAssign',
    name: '工单改派'
  },
  {
    code: 'jump',
    name: '工单跳转'
  },
  {
    code: 'complete',
    name: '工单完成'
  },
  {
    code: 'closed',
    name: '工单关闭'
  },
  {
    code: 'delete',
    name: '工单废除'
  },
  {
    code: 'suspend',
    name: '工单挂起'
  },
  {
    code: 'resume',
    name: '工单恢复'
  },
  {
    code: 'retrieve',
    name: '工单取回'
  },
  {
    code: 'reminder',
    name: '工单催办'
  },
  {
    code: 'addMultiPerformer',
    name: i18n('globe.addMultiPerformer', '增加会签人')
  }
]

// 定式策略类型
export const executeTypes = [
  { label: '每天', value: '1' },
  { label: '每周', value: '2' },
  { label: '每月', value: '3' },
  { label: '周期执行', value: '4' },
  { label: '单次执行', value: '5' }
]

export const weekDays = [
  { label: '周日', value: '1' },
  { label: '周一', value: '2' },
  { label: '周二', value: '3' },
  { label: '周三', value: '4' },
  { label: '周四', value: '5' },
  { label: '周五', value: '6' },
  { label: '周六', value: '7' }
]

export const getWeekDayLabel = value => {
  const day = weekDays.find(item => item.value === value)
  return day ? day.label : ''
}

export const months = Array(12)
  .fill(null)
  .map((item, index) => ({ label: `${index + 1}月`, value: `${index + 1}` }))

export const getMonthLabel = value => {
  const month = months.find(item => item.value === value)
  return month ? month.label : ''
}

export const monthDays = Array(31)
  .fill(null)
  .map((item, index) => ({ label: `${index + 1}号`, value: `${index + 1}` }))
  .concat({ label: '月末', value: '32' })

export const getMonthDayLabel = value => {
  const day = monthDays.find(item => item.value === value)
  return day ? day.label : ''
}

export const getMonthAndDayLabel = (executeMonth = '', executeDayOfMonth = '') => {
  let label = ''
  const monthList = executeMonth ? executeMonth.split(',') : []
  const dayList = executeDayOfMonth ? executeDayOfMonth.split(',') : []

  monthList.forEach(m => {
    const mLabel = months.find(item => item.value === m) || {}
    dayList.forEach(d => {
      const dLabel = monthDays.find(item => item.value === d) || {}
      label += `${mLabel.label || ''}${dLabel.label || ''} `
    })
  })

  return label
}

export const intervalUnitList = [
  { label: '分', value: '1' },
  { label: '小时', value: '2' },
  { label: '天', value: '3' },
  { label: '周', value: '4' }
]

export const getIntervalUnitList = value => {
  const unit = intervalUnitList.find(item => item.value === value)
  return unit ? unit.label : ''
}

// 动作信息
export const actionsInfo = [
  {
    name: '邮件',
    type: 'sendEmail',
    fields: [
      {
        key: 'title',
        type: "text",
        text: '邮件主题',
        paramSupport:true,
        required: true
      },
      {
        key: "acceptor",
        type: "userSelect",
        text: '收件人',
        paramSupport:false,
        required: true
      },
      { 
        key: "content",
        type: "textarea",
        text: '邮件内容',
        paramSupport:true,
        required: true
      }
    ]
  },
  {
    name: '短信',
    type: "sendSMS",
    fields: [
      {
        key: "acceptor",
        type: "userSelect",
        text: '收信人',
        paramSupport:false,
        required: true
      },
      {
        key: "content",
        type: "textarea",
        text: '短信内容',
        paramSupport:true,
        required: true
      }
    ]
  },
  {
    name: '站内信',
    type: "sendSys",
    fields: [
      {
        key: "acceptor",
        type: "userSelect",
        text: '收信人',
        paramSupport:false,
        required: true
      },
      {
        key: "content",
        type: "textarea",
        text: '站内信内容',
        paramSupport:true,
        required: true
      }
    ]
  },
  {
    name: 'Chatops',
    type: "sendChatops",
    fields: [
      {
        key: "acceptor",
        type: "userSelect",
        text: '收信人',
        paramSupport:false,
        required: true
      },
      // 没人知道这是啥
      // {
      //   key: "msgType",
      //   type: "select",
      //   paramSupport:false,
      //   required: true
      // },
      { 
        key: "content",
        type: "textarea",
        text: '内容',
        paramSupport:true,
        required: true
      }
    ]
  },
  {
    name: '微信',
    type: "sendWechat",
    fields: [
      {
        key: "acceptor",
        type: "userSelect",
        text: '收信人',
        paramSupport:false,
        "required": true
      },
      {
        key: "ticketDesc",
        type: "textarea",
        text: '内容',
        paramSupport:true,
        required: true
      },
      {
        key: "modelContent",
        type: "html",
        paramSupport:false,
        required: false
      }
    ]
  },
  {
    name: '调用Restful接口',
    type: "restful",
    fields: [
      {
        key: "url",
        type: "text",
        text: 'URL',
        paramSupport:false,
        required: true
      },
      {
        key: "requestType",
        type: "select",
        text: '请求类型',
        paramSupport:false,
        options: [
          {
            value:"get",
            name:"GET"
          },
          {
            value:"post",
            name:"POST"
          },
          {
            value:"delete",
            name:"DELETE"
          },
          {
            value:"put",
            name:"PUT"
          },
          {
            value:"patch",
            name:"PATCH"
          }
        ],
        required: true
      },
      {
        key:"headers",
        text: 'Headers',
        paramSupport:false,
        type:"mapList",
        required:false
      },
      {
        key:"params",
        text: 'Params',
        paramSupport:false,
        type:"tabs",
        required:false
      }
    ]
  },
  {
    name: '设置工单',
    type: "configTicket",
    fields: [
      {
        key: "configTicket",
        type: "keyValue",
        text: '设置',
        paramSupport:false,
        required: true
      }
    ]
  },
  {
    name: '创建工单',
    type: "createTicket",
    fields: [
      {
        key: "ticketInfoList",
        type: "createTicket",
        paramSupport:false,
        required: true
      }
    ]
  },
  {
    name: '短信',
    type: "others",
    fields: [
      {
        key: "acceptor",
        type: "userSelect",
        text: '收信人',
        paramSupport:false,
        required: true
      },
      {
        key: "content",
        text: '内容',
        type: "textarea",
        paramSupport:true,
        required: true
      }
    ]
  },
  {
    name:'发送钉钉给用户',
    type: "sendDingDing",
    fields: [
      {
        key: "acceptor",
        type: "userSelect",
        text: '收信人',
        paramSupport:false,
        "required": true
      },
      {
        key: "ticketDesc",
        tip:'钉钉内容支持Markdown语法',
        text: '钉钉内容',
        type: "textarea",
        paramSupport:true,
        required: true
      }
    ]
  }
]
