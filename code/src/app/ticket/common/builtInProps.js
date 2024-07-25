import { Modal } from '@uyun/components'
import arrayFlat from './arrayFlat'
function getFieldBasic(field) {
  let { code, type, params, cascade, treeVos } = field
  if (type === 'treeSel') { params = treeVos }
  if (type === 'cascader') { params = cascade }
  return { code, type, params }
}
/**
 * 主要为表单脚本提供信息
 */
class BuiltInProps {
  #fieldsList = []

  constructor (formLayoutVos, onInitCustomScript) {
    const fieldsList = _.map(formLayoutVos, formLayout => {
      if (formLayout.type === 'group') {
        return formLayout.fieldList
      } else if (formLayout.type === 'tabs') {
        return _.map(formLayout.tabs, tab => {
          return tab.fieldList
        })
      } else {
        return []
      }
    })
    this.#fieldsList = arrayFlat(fieldsList).filter(item => item.type !== 'iframe')
    this.mesList = [] // 监听函数list
    this.onInitCustomScript = onInitCustomScript // 初始化脚本函数
    this.modal = null
  }

  // 根据字段名称获取字段的基本信息
  getFieldData (name) {
    const field = _.find(this.#fieldsList, field => field.name === name)
    return getFieldBasic(field)
  }

  // 根据字段名称获取字段的基本信息 （List）
  getFieldsData (nameList) {
    const fields = _.filter(this.#fieldsList, field => _.includes(nameList, field.name))
    return _.map(fields, field => getFieldBasic(field))
  }

  add(fn) {
    if (typeof fn !== 'function') {
      throw new Error('传入的不是一个函数')
    }
    window.addEventListener('message', fn, false)
    this.mesList = [...this.mesList, fn]
  }

  remove(fn) {
    window.removeEventListener('message', fn, false)
    this.mesList = _.filter(this.mesList, item => item !== fn)
  }

  removeAll() {
    if (this.mesList.length === 0) {
      return
    }
    for (const fn of this.mesList) {
      window.removeEventListener('message', fn, false)
    }
  }

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
        this.uuid = null
      }
    })
  }

  destroyConfirm() {
    if (!this.modal) {
      return
    }
    this.modal.destroy()
    this.modal = null
  }
}
export default BuiltInProps
