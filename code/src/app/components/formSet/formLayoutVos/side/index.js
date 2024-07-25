import React, { Component } from 'react'
import classnames from 'classnames'
import { observer, inject } from 'mobx-react'
import FieldSide from './field'
import GroupSide from './group'
import TabsSide from './tabs'
import IframeSide from './iframe'
import SlaSide from './sla'
import SubFormSide from './subForm'
import RelateSubProcessSide from './relateSubProcessSide'
import RelateAutoJob from './relateAutoJob'
import ProcessRecordSide from './processRecordSide'
import MergeTicketSide from './mergeTicketSide'
import RelateTicketSide from './relateTicketSide'
import PanelSilder from './panel'
import './index.less'

@inject('formSetGridStore')
@observer
class FormLayout extends Component {
  isInLayout = false
  get sideData() {
    const { sideValue } = this.props
    const { layoutIndex, tabsIndex, fieldIndex, parentType } = sideValue || {}
    const { currentGrid } = this.props.formSetGridStore
    const { formLayoutVos } = currentGrid
    let sideData = {}
    if (parentType === 'layout') {
      this.isInLayout = false
      sideData = formLayoutVos[layoutIndex]
    } else if (parentType === 'group') {
      this.isInLayout = true
      sideData = formLayoutVos[layoutIndex].fieldList[fieldIndex]
    } else if (parentType === 'panel') {
      this.isInLayout = true
      sideData = formLayoutVos[layoutIndex].fieldList[fieldIndex]
    } else if (parentType === 'tab') {
      this.isInLayout = true
      sideData = formLayoutVos[layoutIndex].tabs[tabsIndex].fieldList[fieldIndex]
    }
    return sideData
  }

  handleChange = (values, expansion) => {
    const { layoutIndex, tabsIndex, fieldIndex, parentType } = this.props.sideValue || {}
    this.props.formSetGridStore.changeField(
      layoutIndex,
      tabsIndex,
      fieldIndex,
      parentType,
      _.assign({}, this.sideData, values)
    )
    if (!_.isEmpty(expansion)) {
      const { currentGrid } = this.props.formSetGridStore
      const { fieldList } = currentGrid
      const { codes } = expansion
      const fields = _.filter(fieldList, (field) => _.includes(codes, field.code))
      this.props.formSetGridStore.setData(
        _.assign({}, currentGrid, { fieldList: fields }),
        'currentGrid'
      )
    }
  }

  renderSideNameAndSideComponent = (type) => {
    switch (type) {
      case 'tab':
        return {
          name: i18n('model.field.edit.right.group.tabs.attribute', '标签属性'),
          Component: TabsSide
        }
      case 'group':
        return {
          name: i18n('model.field.edit.right.group.type', '分组属性'),
          Component: GroupSide
        }
      case 'iframe':
        return {
          name: i18n('model.field.edit.right.iframe.attribute', '控件属性'),
          Component: IframeSide
        }
      case 'sla':
      case 'ola':
      case 'remoteTicket':
      case 'ticketComment':
        return {
          name: i18n('model.field.edit.right.iframe.attribute', '控件属性'),
          Component: SlaSide
        }
      case 'relateTicket':
        return {
          name: i18n('model.field.edit.right.iframe.attribute', '控件属性'),
          Component: RelateTicketSide
        }
      case 'subForm':
        return {
          name: i18n('model.field.edit.right.subform.type', '子表单属性'),
          Component: SubFormSide
        }
      case 'relateSubProcess':
        return {
          name: i18n('model.field.edit.right.iframe.attribute', '控件属性'),
          Component: RelateSubProcessSide
        }
      case 'relate_job':
        return {
          name: i18n('model.field.edit.right.iframe.attribute', '控件属性'),
          Component: RelateAutoJob
        }
      case 'operateRecord':
        return {
          name: i18n('model.field.edit.right.iframe.attribute', '控件属性'),
          Component: ProcessRecordSide
        }
      case 'mergeTicket':
        return {
          name: i18n('model.field.edit.right.iframe.attribute', '控件属性'),
          Component: MergeTicketSide
        }
      case 'panel':
        return {
          name: '布局属性',
          Component: PanelSilder
        }
      default:
        return {
          name: i18n('conf.model.field.properties', '字段属性'),
          Component: FieldSide
        }
    }
  }

  render() {
    const { sideValue, modelId } = this.props
    const { type } = this.sideData || {}
    const { name, Component } = this.renderSideNameAndSideComponent(type)
    const dliver = {
      handleChange: this.handleChange,
      sideData: this.sideData,
      modelId,
      isInLayout: this.isInLayout
    }
    return (
      <div
        className={classnames('form-set-formLayoutVos-side', {
          active: !_.isEmpty(sideValue)
        })}
      >
        {!_.isEmpty(sideValue) && (
          <React.Fragment>
            <header>
              <h3>{name}</h3>
              <i
                className="iconfont icon-panding"
                onClick={() => {
                  this.props.handleSideShow(null)
                }}
              />
            </header>
            <section>
              <Component {...dliver} />
            </section>
          </React.Fragment>
        )}
      </div>
    )
  }
}

export default FormLayout
