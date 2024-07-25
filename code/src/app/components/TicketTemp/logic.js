import { Modal, message } from '@uyun/components'

// 可以保存模板数据的字段类型
// const fieldSet = new Set([
//   'singleRowText',
//   'multiRowText',
//   'listSel',
//   'singleSel',
//   'multiSel',
//   'int',
//   'double',
//   'dateTime',
//   'timeInterval',
//   'user',
//   'department',
//   'cascader',
//   'table',
//   'customizeTable',
//   'richText',
//   'tags',
//   'links',
//   'jsontext'
// ])

/**
 * 返回需要获取value值得表单Code
 * @param {Array} fieldList  表单中字段的list
 */
// export const filterDockField = fieldList => _.chain(fieldList).filter(item => fieldSet.has(item.type)).map(item => item.code).value()
export const filterDockField = fieldList => _.chain(fieldList).map(item => item.code).value()

/**
 * 返回不是只读字段的code
 * @param {Array} fieldList 表单中字段的list
 */
export const getNoDisabledCodes = fieldList => _.chain(fieldList).filter(item => item.required !== 2).map(item => item.code).value()

/**
 * 将Object中value为undefined 的替换成空字符串
 * @param {Object} obj 表单信息
 */
export const undefinedToNull = (obj) => _.chain(obj).map((val, key) => [key, val || '']).fromPairs().value()

/**
 * 删除模板
 * @param {object} template 模板数据
 * @param {object} store ticketTemplateStore
 * @param {funciton} callback 成功后的回调
 */
export function deleteTemp(template, store, callback) {
  Modal.confirm({
    title: i18n('conf.model.del.card', '确定要删除吗？'),
    onOk: async () => {
      const { id } = template
      const res = await store.delModelFormTemplate({ id })

      if (res) {
        message.success(i18n('del.sucess', '删除成功'))
        // 更新下拉的模板列表和选中的模板
        const { currentTemp } = store
        store.setProps({
          temp: {},
          currentTemp: id === _.get(currentTemp, 'templateId') ? null : currentTemp
        })

        callback && callback(template)
      }
    }
  })
}
