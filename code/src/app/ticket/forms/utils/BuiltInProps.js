import { Modal } from '@uyun/components'
import { toJS } from 'mobx'
import tableListStore from '~/stores/tableListStore'
/**
 * 对级联字段和树字段字段进行处理，将 treeVos ， cascade 替换为 统一输入 params
 * @param  {Object} field //字段的field属性
 */
function getFieldBasic(field) {
  if (_.isEmpty(field)) {
    return {}
  }
  let { code, type, params, cascade, treeVos, ...rest } = field
  if (type === 'treeSel') {
    params = treeVos
  }
  if (type === 'cascader') {
    params = cascade
  }
  return { code, type, params, ...rest }
}

function getIframe(formLayout, id) {
  const iframeList = _.reduce(
    formLayout,
    (sum, item) => {
      if (item.type === 'iframe') {
        return [...sum, item]
      }
      if (item.type === 'group') {
        return [...sum, ..._.filter(item.fieldList, (i) => i.type === 'iframe')]
      }
      if (item.type === 'tab') {
        return [
          ...sum,
          ..._.reduce(
            item.tabs,
            (tabsIframeList, tab) => {
              return [...tabsIframeList, ..._.filter(tab.fieldList, (i) => i.type === 'iframe')]
            },
            []
          )
        ]
      }
    },
    []
  )
  const iframe = _.find(iframeList, (item) => item.id === id)
  const { linkUrl, viewEditVo } = iframe
  const { editUrl, viewUrl } = viewEditVo || {}
  return {
    original: { linkUrl, editUrl, viewUrl },
    currentUrl: document.getElementById(id).src
  }
}
class BuiltInProps {
  /**
   * 初始化
   * @param {Array} fields  字段列表，主要让用户查询字段的信息
   * @param {Function} getProps  // 获取表单中的属性
   * @param {Function} onInitCustomScript  初始化函数，做重载的时候用(对接auto)
   */
  constructor(fieldsList, getProps, onInitCustomScript) {
    this.mesList = []
    this.modal = null
    this.getProps = getProps
    this.fieldsList = fieldsList
    this.onInitCustomScript = onInitCustomScript
  }

  getIframe(id) {
    return getIframe(this.getProps('iframe'), id)
  }

  // 获取forms的信息
  getForms(key) {
    return this.getProps('forms', key)
  }

  // 获取当前的提交行为
  getSubmitAction() {
    return this.getProps('action')
  }

  // 根据字段编码获取字段的基本信息
  getField(code) {
    const field = _.find(this.fieldsList, (field) => field.code === code)
    return getFieldBasic(field)
  }

  /**
   * 根据字段名称获取字段的基本信息
   * 已废弃，不在维护，KB已经更新，函数留下做一个兼容
   * JHSYY要求字段名称可以重复导致该函数无用
   */

  getFieldData(name) {
    const field = _.find(this.fieldsList, (field) => field.name === name)
    return getFieldBasic(field)
  }

  /**
   * 根据字段名称列表获取字段的基本信息
   * 已废弃，不在维护，KB已经更新，函数留下做一个兼容
   * JHSYY要求字段名称可以重复导致该函数无用
   */
  getFieldsData(nameList) {
    const fields = _.filter(this.fieldsList, (field) => _.includes(nameList, field.name))
    return _.map(fields, (field) => getFieldBasic(field))
  }

  // 添加监听函数，主要用于和iframe页面进行交互
  add(fn) {
    if (typeof fn !== 'function') {
      throw new Error('传入的不是一个函数')
    }
    window.addEventListener('message', fn, false)
    this.mesList = [...this.mesList, fn]
  }

  // 移除已经添加的监听函数
  remove(fn) {
    window.removeEventListener('message', fn, false)
    this.mesList = _.filter(this.mesList, (item) => item !== fn)
  }

  // 移除所有的监听函数
  removeAll() {
    if (this.mesList.length === 0) {
      return
    }
    for (const fn of this.mesList) {
      window.removeEventListener('message', fn, false)
    }
    this.mesList = []
  }

  // 创建一个confirm弹框，提示用户脚本执行，主要对接auto业务
  createConfirm() {
    if (this.modal) {
      throw new Error('confirm方法调用前必须卸载之前的')
    }
    this.modal = Modal.confirm({
      title: i18n('script.carriing-confirm-tip', '脚本正在执行，请耐心等待'),
      okText: i18n('Overload', '重载'),
      cancelText: i18n('termination', '终止'),
      onOk: () => {
        this.modal = null
        this.onInitCustomScript()
      },
      onCancel: () => {
        this.modal = null
      }
    })
  }

  // 移除confirm弹框，主要对接auto业务
  destroyConfirm() {
    if (this.modal) {
      this.modal.destroy()
      this.modal = null
    }
  }

  /**
   * 从服务端获取表单中某个表格字段的数据
   * 由于表格字段增加导入导出功能，数据来源不再放在表单中，而是走独立的分页接口
   * 所以用脚本赋值时，需要调用openAPI
   * 最后调用此方法来更新表单中的表格字段
   * @param {String} code 表格字段code
   * @param {Object} params 分页查询的参数
   */
  queryTableData(code, params = { pageNo: 1 }) {
    const tableStore = tableListStore.list.find((item) => item.params.fieldCode === code)

    if (tableStore) {
      tableStore.queryData(params)
    }
  }

  /**
   * 获取当前表单中某个表格字段的数据
   * @param {String} code 表格字段code
   */
  getTableData(code) {
    const tableStore = tableListStore.list.find((item) => item.params.fieldCode === code)
    if (tableStore) {
      // rowStatus:-1表示被删除的行数据
      return toJS(tableStore.data).filter((item) => item.rowStatus !== -1)
    }
  }

  /**
   * 修改当前表单中某个表格字段的数据
   * @param {String} code 表格字段code
   * @param {Array} data 表格数据
   */
  setTableData(code, data = [], type) {
    const tableStore = tableListStore.list.find((item) => item.params.fieldCode === code)
    if (tableStore) {
      const storeDataDeleted = toJS(tableStore.data).filter((item) => item.rowStatus === -1) // tableStore中标记删除的数据
      // 表单脚本添加、修改、删除表格数据时，需修改rowStatus
      tableStore.setProps({ data: [...data, ...storeDataDeleted] })
    }
  }
  //表格脚本注释
  validateTable(code, data) {
    const tableStore = tableListStore.list.find((item) => item.params.fieldCode === code)
    if (tableStore) {
      const scriptValidateRows = JSON.parse(JSON.stringify(tableStore.scriptValidateRows))
      if (Array.isArray(data)) {
        //导入校验，传的是数组
        tableStore.setProps({ scriptValidateRows: data, data: toJS(tableStore.data) })
      } else {
        //每行的点击事件传的是对象
        const rowIds = _.map(scriptValidateRows, (d) => d.rowId)
        if (rowIds && rowIds.includes(data.rowId)) {
          let Index = scriptValidateRows.findIndex((d) => d.rowId === data.rowId)
          scriptValidateRows.splice(Index, 1, data)
        } else {
          scriptValidateRows.push(data)
        }
        //因为要触发重新渲染所以需要重新赋值
        tableStore.setProps({ scriptValidateRows, data: toJS(tableStore.data) })
      }
    }
  }

  /**
   * 脚本中获取传入配置项的查询条件
   * @param {Object} data  配置项需传入参数的集合
   */
  queryResourceData(data = [], ticketId) {
    window.sessionStorage.setItem(`resourceCondition-${ticketId}`, JSON.stringify(data))
  }
}
export default BuiltInProps
