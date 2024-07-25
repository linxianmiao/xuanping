import { observable, action, runInAction } from 'mobx'
import { qs } from '@uyun/utils'

export default class CreateSubStore {
  @observable createTicket = {}

  @observable processList = []

  @observable draftsModelId = ''

  @observable ticketTemplateId = ''

  @observable draftsData = {}

  @observable parentTicketData = {}

  @observable ticketId = ''

  @action distory() {
    this.createTicket = {} // 工单信息
    this.processList = []
    this.draftsModelId = '' // 模型id
    this.ticketTemplateId = ''
    this.draftsData = {}
    this.parentTicketData = {}
  }

  @action setTicketTemplateId(id) {
    this.ticketTemplateId = id
  }

  @action async intoCreateTicket(modelId, draftsData, type, ticketId, copyTicketId) {
    const res = (await axios.get(API.intoCreateTicket(modelId), { params: { ticketId } })) || {}

    // 去掉接口的fields，循环formLayoutVos获取全部数据
    let fields = []
    _.forEach(res.formLayoutVos, (d) => {
      if (d.type === 'group') {
        fields = [...d.fieldList, ...fields]
      } else {
        _.forEach(d.tabs, (tab) => {
          fields = [...fields, ...tab.fieldList]
        })
      }
    })
    res.fields = fields
    const obj = {
      modelId: res.modelId,
      isCreate: 1,
      ticketId: res.ticketId,
      tacheNo: +res.tacheNo || 0
    }
    // 保存被复制工单id, 获取表格字段时，需要用此id来获取表格数据
    res.copyTicketId = copyTicketId
    const data = await axios({
      url: API.GET_FLOW_CHART,
      method: 'get',
      params: obj,
      paramsSerializer: (params) => qs.stringify(params, { indices: false })
    })

    runInAction(() => {
      /**
       * drafts 为草稿箱中的工单，数据为array，需要手动替换工单id
       * other 为创建工单初始话页面，数据为 object
       */
      if (!_.isEmpty(draftsData)) {
        const data = new Map()
        // 获取新的流水号
        const record = res.fields.find((item) => item.code === 'flowNoBuiltIn')
        if (type === 'other') {
          // 流水号需重新赋值
          if (record) {
            draftsData.flowNoBuiltIn = record.defaultValue
          }
          const allJobField = []
          _.forEach(res.formLayoutVos, (d) => {
            if (d.type === 'group') {
              _.forEach(d.fieldList, (d2) => {
                if (d2.type === 'job') {
                  allJobField.push(d2.code)
                }
              })
            } else {
              _.forEach(d.tabs, (d3) => {
                _.forEach(d3.fieldList, (d4) => {
                  if (d4.type === 'job') {
                    allJobField.push(d4.code)
                  }
                })
              })
            }
          })
          if (allJobField.length > 0) {
            _.forEach(allJobField, (jobCode) => {
              delete draftsData[jobCode]
            })
          }
          for (const key in draftsData) {
            data.set(key, draftsData[key])
          }
        } else if (type === 'drafts') {
          _.forEach(draftsData.fieldCraftVos, (item) => {
            // 流水号需重新赋值
            if (item.code === 'flowNoBuiltIn') {
              data.set(item.code, record ? record.defaultValue : item.value)
            } else {
              data.set(item.code, item.value)
            }
          })
          res.ticketId = draftsData.id
        }
        // 排除的字段，表单复制过来的不能关联 附件，配置项，资源图 改字段与表单绑定所以不能保存， 密码字段都不能保存
        const isDraft = (field) => {
          let excludeType = []
          excludeType =
            type === 'drafts'
              ? ['securityCode']
              : ['resource', 'securityCode', 'topology', 'attachfile']
          return data.has(field.code) && !_.includes(excludeType, field.type)
        }

        _.forEach(res.formLayoutVos, (item) => {
          if (item.type === 'group') {
            _.forEach(item.fieldList, (field) => {
              if (isDraft(field)) {
                if (field.type === 'customizeTable') {
                  // 动态表格的列信息还是以接口获取的为准，datasource以复制过来的为准
                  field.defaultValue = JSON.stringify({
                    ...eval(`(${field.defaultValue})`),
                    dataSource: JSON.parse(data.get(field.code)).dataSource
                  })
                } else {
                  field.defaultValue = data.get(field.code)
                }
              }
            })
          } else {
            _.forEach(item.tabs, (tab) => {
              _.forEach(tab.fieldList, (field) => {
                if (isDraft(field)) {
                  field.defaultValue = data.get(field.code)
                }
              })
            })
          }
        })
      }
      this.ticketId = res.ticketId
      this.processList = data
      this.createTicket = res
      this.draftsData = draftsData || {}
    })
    // 创建工单时，关联了作业未提交未保存刷新时记住工单id，以便删除关联作业用
    window.localStorage.setItem('ticketId', res.ticketId)
    return res
  }

  @action.bound
  async onCreateTicket(id, data) {
    const res = await axios.post(API.CREATETICKET(id), data)
    return res
  }

  @action.bound
  async createAndJumpTicket(data) {
    const res = await axios.post(API.CREATE_MOVE_TICKET, data)
    return res
  }

  // 获取草稿箱，返回工单数据
  @action
  async getTicketCache(ticketId) {
    const data = await axios.get(API.GETTICKETCACHE(ticketId))
    // 如果是子流程的草稿，需获取父流程的数据
    if (data.cacheType === '1' || data.cacheType === '2') {
      const parentTicketData = (await axios.get(API.GETSUBTICKETCACHE(data.id))) || {}
      this.parentTicketData = parentTicketData
    }
    const modelId = data.modelId
    const formData = await this.intoCreateTicket(modelId, data, 'drafts', ticketId)

    return formData
  }

  // 获取所有环节
  @action async get_tache(id) {
    try {
      const res = axios.get(API.TACHE(id))
      return res
    } catch (e) {
      throw e
    }
  }

  // 获取第一环节信息
  @action async get_first_activity(id) {
    // eslint-disable-next-line no-useless-catch
    try {
      const res = axios.get(API.GET_FIRST_ACTIVITY(id))
      return res
    } catch (e) {
      throw e
    }
  }

  // 发起子流程 手动建单
  @action createSubProcess(data, options = {}) {
    return new Promise((resolve) => {
      const autoCreateTicket = data.autoCreateTicket
      delete data.autoCreateTicket
      axios({
        method: 'post', // 方法
        url: API.createSubProcess, // 地址
        data: data,
        params: {
          needSuspend: data.needSuspend,
          autoCreateTicket: autoCreateTicket,
          chartId: options.chartId
        }
      }).then((res) => {
        if (res === '200') {
          resolve({})
        }
      })
    })
  }

  @action async serviceTicketCreate(data) {
    const res = await axios.post(API.SERVICETICKETCREATE, data)
    return res
  }
}
