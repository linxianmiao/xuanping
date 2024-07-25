import { observable, action, toJS } from 'mobx'
import setProps from '~/utils/setProps'
class TableListStore {
  @observable list = [] // 存放表单中的表格字段store

  @observable isTicketSubmitting = false // 工单是否正在发送提交等跳转动作

  // 表格接口数据整合
  @observable tableQueryFields = []

  @action
  saveTableQueryFields = (data) => {
    this.tableQueryFields = [...this.tableQueryFields, ...data]
  }

  @action
  setProps = setProps(this)

  @action
  push = (data) => {
    this.list = [...this.list, data]
  }

  @action
  quit = (data) => {
    this.list = this.list.filter((item) => item !== data)
  }

  // 保存表单中表格字段数据
  saveTableData = (isTicketSubmitting, options) => {
    this.isTicketSubmitting = isTicketSubmitting
    let data = []
    if (window.location.href.indexOf('detail') !== -1) {
      data = _.filter(this.list, (item) => item.params?.ticketId === window.TICKETID) || []
    } else {
      data = this.list
    }
    if (data.length === 0) {
      return Promise.resolve()
    }
    return Promise.all(
      data.map((store) => {
        store.saveData(null, options)
      })
    )
  }

  // codes表示需要校验的表格字段code，如果不传就校验所有的表格字段
  validate = (codes) => {
    let data = []
    if (window.location.href.indexOf('detail') !== -1) {
      data = _.filter(this.list, (item) => item.params?.ticketId === window.TICKETID) || []
    } else {
      data = this.list
    }
    const needValidateList = codes
      ? data.filter((item) => codes.includes(item.params.fieldCode))
      : data
    const passed = needValidateList.map((item) => item.validate()).every((error) => !error)

    return passed
  }

  @action
  destory(ticketId) {
    let data = []
    if (window.location.href.indexOf('detail') !== -1) {
      data =
        _.filter(this.list, (item) => item.params?.ticketId === (ticketId || window.TICKETID)) || []
    } else {
      data = this.list
    }
    // 先进行一个后端的表格数据的缓存移除
    if (!this.isTicketSubmitting && data.length > 0) {
      data[0].deleteServerCacheData()
    }

    if (window.location.href.indexOf('detail') !== -1) {
      this.list = _.filter(
        this.list,
        (item) => item.params?.ticketId !== (ticketId || window.TICKETID)
      )
    } else {
      this.list = []
      this.tableQueryFields = []
    }
    this.isTicketSubmitting = false
  }
}

export default new TableListStore()
