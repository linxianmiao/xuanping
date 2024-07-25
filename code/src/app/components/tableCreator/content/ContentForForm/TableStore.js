import { observable, action, runInAction, toJS } from 'mobx'
import setProps from '~/utils/setProps'
import { validator } from '../logic'
import moment from 'moment'
import { message } from '@uyun/components'

export default class TableFieldStore {
  constructor(params, options) {
    this.params = params
    this.options = options
    this.isRequired = false
    this.columns = []
    this.ticketTemplateId = null

    // 不分页时pageSize设为5000
    this.pagination.pageSize = !options.pageFlag ? 5000 : 20
  }

  @observable data = []
  @observable scriptValidateRows = []

  @observable pagination = {
    pageNo: 1,
    pageSize: 20,
    total: 0
  }

  @observable loading = false

  @observable error = false

  fields = [] // 用于校验字段

  @action
  setProps = setProps(this)

  @action removeTicketDefaultData = async () => {
    const { pageNo, pageSize } = this.pagination
    const params = {
      ...this.params,
      pageNo,
      pageSize,
      ticketId: this.params.ticketId
    }
    const res = (await axios.get(API.queryTableDataWithPage, { params })) || {}
    if (Array.isArray(res.list) && res.list.length > 0) {
      const newList = res.list.map((d) => ({
        ...d,
        rowStatus: -1
      }))
      this.data = this.data.concat(newList)
    }
  }

  @action
  queryData = async (extraParams = {}) => {
    const { pageNo, pageSize } = this.pagination
    const params = {
      ...this.params,
      pageNo,
      pageSize,
      templateId: this.ticketTemplateId ? this.ticketTemplateId : undefined,
      // 是复制工单的话，就传要复制的工单id
      ticketId: this.ticketTemplateId
        ? undefined
        : this.options.copyTicketId || this.params.ticketId,
      ...extraParams
    }

    this.loading = true

    const res = (await axios.get(API.queryTableDataWithPages, { params })) || {}
    // const { list, total } = res
    runInAction(() => {
      //   this.data = list || []
      //   this.pagination = {
      //     ...this.pagination,
      //     total: total,
      //     pageNo: res.pageNum,
      //     pageSize: res.pageSize
      //   }
      this.loading = false
    })
    return res
  }

  @action
  saveData = async (data, options = {}) => {
    const { ticketId, caseId, fieldCode, isNestedTable, contianeNestedTable } = this.params
    if (isNestedTable) {
      return
    }
    const ticketTemplateId = options.ticketTemplateId
    let nextData = (data || this.data).map((item) => ({
      ...item,
      // ticketId,
      caseId,
      fieldCode: item.fieldCode ? item.fieldCode : fieldCode,
      // 存为草稿时，表格数据状态存为2，防止进入草稿工单再退出时表格数据删除
      rowStatus: item.rowStatus === -1 ? item.rowStatus : options.isDraft ? 2 : item.rowStatus,
      // 有模板id时，工单id传空
      ticketId: ticketTemplateId ? null : ticketId,
      ticketTemplateId
    }))

    // 时间字段转化为YYYY-MM-dd HH:mm:ss
    _.forEach(nextData, (d) => {
      if (d.rowData) {
        _.forIn(d.rowData, (value, key) => {
          if (!_.isEmpty(value)) {
            if (moment.isMoment(value) || _.indexOf(value, 'T') === 10) {
              const time = moment(value).format('YYYY-MM-DD HH:mm:ss')
              d.rowData[key] =
                time === 'Invalid date' ? value : moment(value).format('YYYY-MM-DD HH:mm:ss')
            }
          }
        })
      }
    })
    if (contianeNestedTable && contianeNestedTable.length > 0) {
      _.forEach(nextData, (d) => {
        _.forEach(Object.keys(d.rowData), (c) => {
          if (contianeNestedTable.includes(c)) {
            d.rowData[c] = d.rowData[c]?.map((e) => e.rowData)
          }
        })
      })
    }
    const res = await axios.post(API.saveTableData, {
      tableRowDataList: nextData
    })

    return res
  }

  saveAndQueryData = async (data, queryParams) => {
    // 表格中若有默认系统时间的日期时间字段，就会保存’1‘，需要将’1‘转为时间
    const filtCodes = []
    _.forEach(this.fields, (d) => {
      if (d.type === 'dateTime' && d.defaultValue === '1') {
        _.forEach(this.columns, (d2) => {
          if (d2.source === d.code) {
            filtCodes.push(d2.value)
          }
        })
      }
    })
    _.forEach(data, (d) => {
      _.forEach(filtCodes, (d2) => {
        d.rowData[d2] = moment()
      })
    })
    const res = await this.saveData(data)
    let DATA
    if (res === '200') {
      DATA = this.queryData(queryParams)
    }
    return DATA
  }

  @action
  deleteServerCacheData = async () => {
    if (!this.params.ticketId) {
      return
    }

    const params = {
      ticketId: this.params.ticketId
    }
    const res = await axios.post(API.deleteTableData, {}, { params })

    return res
  }

  export = () => {
    const { ticketId, caseId, modelId, fieldCode } = this.params
    // const params = {
    //   ticketId, caseId, modelId, fieldCode
    // }
    const url = `${API.exportTableData}?ticketId=${ticketId}&caseId=${caseId}&modelId=${modelId}&fieldCode=${fieldCode}`

    // axios.get(API.exportTableData, { params })
    window.open(url)
  }

  saveAndExport = async () => {
    const error = this.validate()

    if (error) return

    const res = await this.saveData()

    if (res === '200') {
      this.export()
    }
  }

  validate = () => {
    let error = false
    let value = this.data.filter((item) => item.rowStatus !== -1).map((item) => item.rowData)
    if (Array.isArray(toJS(this.scriptValidateRows)) && this.scriptValidateRows.length > 0) {
      const rowIds = _.map(this.scriptValidateRows, (d) => d.rowId)
      value = this.data
        .filter((item) => item.rowStatus !== -1 && !rowIds.includes(item.rowId))
        .map((item) => item.rowData)
    }
    if (this.isRequired === 1) {
      if (value.length === 0) {
        error = '此表格字段不能为空'
      } else {
        this.columns.some((item) => {
          const field = this.fields.find((f) => f.code === item.source)
          if (value.some((v) => validator(v[item.value], item, field))) {
            error = '表格校验失败'
          } else {
            error = ''
          }
          return error
        })

        if (!error) {
          // 表格字段为必填时，但表格属性不是必填时，至少需要一个属性要有值
          const isEmpty = this.columns.some((item) => {
            if (value.some((v) => v[item.value])) {
              return true
            }
          })
          if (!isEmpty) {
            error = '此表格字段不能为空'
          } else {
            error = ''
          }
        }
      }
    } else if (value.length > 0) {
      this.columns.some((item) => {
        const field = this.fields.find((f) => f.code === item.source)
        if (value.some((v) => validator(v[item.value], item, field))) {
          error = '表格校验失败'
        } else {
          error = ''
        }
        return error
      })
    }
    runInAction(() => {
      this.error = error
    })
    return error
  }
}
