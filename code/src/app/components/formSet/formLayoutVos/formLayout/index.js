import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import classnames from 'classnames'
import { Radio, Button, Checkbox } from '@uyun/components'
import Layout from './layout'
import Empty from './empty'
import { LAYOUT_CANDROP } from '../configuration'
import './index.less'

@inject('formSetGridStore')
@observer
class FormLayout extends Component {
  state = {
    oldVersion: false
  }
  componentDidMount() {
    this.props.formSetGridStore.getlistSimpleTemplates()
    const { currentGrid } = this.props.formSetGridStore
    let flag = currentGrid.formMode === 'new' ? false : true
    let oldVersion = currentGrid.id && currentGrid.formMode ? flag : currentGrid.id ? true : false
    this.setState({ oldVersion })
    this.props.formSetGridStore.setData(
      _.assign({}, currentGrid, { formMode: oldVersion ? 'old' : 'new' }),
      'currentGrid'
    )
  }

  assignFields = (fields, obj) => {
    return _.map(fields, (field) => {
      if (_.includes(['iframe', 'placeholder'], field.type)) {
        return field
      }
      return _.assign({}, field, obj)
    })
  }

  handleDelLayout = (layoutIndex, tabsIndex, fieldIndex, parentType, codes) => {
    this.props.formSetGridStore.deleteField(layoutIndex, tabsIndex, fieldIndex, parentType, codes)
  }

  changeRadio = (e) => {
    const key = e.target.value
    const { currentGrid } = this.props.formSetGridStore
    const { formLayoutVos } = currentGrid
    const forms = toJS(formLayoutVos)
    _.forEach(forms, (item) => {
      if (item.type === 'group') {
        item.fieldList = this.assignFields(item.fieldList, { fieldLabelLayout: key })
      } else if (item.type === 'panel') {
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

  changeVersion = (e) => {
    const { currentGrid } = this.props.formSetGridStore
    this.setState({ oldVersion: e.target.checked })
    this.props.formSetGridStore.setData(
      _.assign({}, currentGrid, { formMode: e.target.checked ? 'old' : 'new' }),
      'currentGrid'
    )
  }
  render() {
    const { sideValue, modalValue } = this.props
    const { oldVersion } = this.state
    const { currentGrid, allFields } = this.props.formSetGridStore
    const { formLayoutVos, formLayoutType } = currentGrid
    const formLayoutVosLength = formLayoutVos.length
    const emptyData = {
      parentType: 'layout',
      length: formLayoutVosLength,
      dropList: LAYOUT_CANDROP
    }
    return (
      <div className="form-set-formLayoutVos-formLayout" id="form-set-formLayoutVos-formLayout">
        <div className="form-header">
          {currentGrid.name}
          <div className="right-form-btn">
            <Radio.Group onChange={this.changeRadio}>
              <Radio.Button value="horizontal">
                {i18n('fromSet-field-label-layout-horizontal', 'label左右结构')}
              </Radio.Button>
              <Radio.Button value="vertical">
                {i18n('fromSet-field-label-layout-vertical', 'label上下结构')}
              </Radio.Button>
            </Radio.Group>
            <Checkbox checked={oldVersion} onChange={this.changeVersion}>
              老模式
            </Checkbox>
            {/* <Button onClick={this.changeVersion}>{oldVersion ? '切换新模式' : '切换老模式'}</Button> */}
          </div>
        </div>
        <div
          className={classnames('form-layout-wrap', {
            active: !_.isEmpty(sideValue)
          })}
        >
          <Empty {...emptyData} index={-1} />
          {_.map(formLayoutVos, (formLayout, index) => {
            return (
              <div key={formLayout.id}>
                <Layout
                  handleSideShow={this.props.handleSideShow}
                  handleDelLayout={this.handleDelLayout}
                  layoutIndex={index}
                  formLayout={formLayout}
                  formLayoutType={formLayoutType}
                  parentType="layout"
                  sideValue={sideValue}
                  modalValue={modalValue}
                  allFields={allFields}
                />
                <Empty {...emptyData} index={index} />
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

export default FormLayout
