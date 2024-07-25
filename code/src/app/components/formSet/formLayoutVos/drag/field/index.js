import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import List from './list'
import FieldLoadAndAdd from './FieldLoadAndAdd'
import { orLowcode } from '~/utils/common'
import './index.less'
@inject('globalStore', 'formSetGridStore')
@observer
class Field extends Component {
  assignFields = (fields, obj) => {
    return _.map(fields, (field) => {
      if (_.includes(['iframe', 'placeholder'], field.type)) {
        return field
      }
      return _.assign({}, field, obj)
    })
  }

  handleChangeAllFieldLabel = (key) => {
    const { currentGrid } = this.props.formSetGridStore
    const { formLayoutVos } = currentGrid
    const forms = toJS(formLayoutVos)
    _.forEach(forms, (item) => {
      if (item.type === 'group' || item.type === 'panel') {
        item.fieldList = this.assignFields(item.fieldList, { fieldLabelLayout: key })
      } else if (item.type === 'tab') {
        _.forEach(item.tabs, (tab) => {
          tab.fieldList = this.assignFields(tab.fieldList, { fieldLabelLayout: key })
        })
      }
    })
    this.props.formSetGridStore.setData(
      _.assign({}, currentGrid, { formLayoutVos: forms }),
      'currentGrid'
    )
  }

  render() {
    const { fieldInsert } = this.props.globalStore.configAuthor
    const { type } = this.props.formSetGridStore
    return (
      <React.Fragment>
        <div className="itsm-form-set-formLayoutVos-drag-field-header">
          {
            // 有新增字段权限且不是全局表单的时候
            type !== 'template' && orLowcode(fieldInsert) && <FieldLoadAndAdd />
          }
        </div>
        <List />
      </React.Fragment>
    )
  }
}
export default Field
