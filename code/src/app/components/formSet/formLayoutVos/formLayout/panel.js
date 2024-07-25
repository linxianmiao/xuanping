import React, { Component } from 'react'
import { Modal } from '@uyun/components'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import Fields from './fields'

@observer
class Panel extends Component {
  static defaultProps = {
    handleDelLayout: () => {},
    handleSideShow: () => {}
  }

  getExtra = () => {
    return this.props.disabled ? null : (
      <i onClick={this.handleDel} className="iconfont icon-shanchu" />
    )
  }

  handleDel = (e) => {
    e.stopPropagation()
    const { layoutIndex, parentType } = this.props
    const { fieldList } = this.props.formLayout
    const codes = _.chain(toJS(fieldList))
      .map((field) => field.code)
      .compact()
      .value()
    Modal.confirm({
      title: i18n('model.field.edit.right.del.group.tip', '确定要删除该分组？'),
      onOk: () => {
        this.props.handleSideShow(null, 'side')
        this.props.handleDelLayout(layoutIndex, undefined, undefined, parentType, codes)
      }
    })
  }

  handleSideShow = (e) => {
    e.stopPropagation()

    const { layoutIndex, tabsIndex, fieldIndex, parentType } = this.props
    this.props.handleSideShow({
      layoutIndex: layoutIndex,
      tabsIndex,
      fieldIndex,
      parentType
    })
  }
  deletePanel = (e) => {
    e.stopPropagation()
    const { layoutIndex, parentType } = this.props
    const { fieldList } = this.props.formLayout
    const codes = _.chain(toJS(fieldList))
      .map((field) => field.code)
      .compact()
      .value()
    Modal.confirm({
      title: i18n('model.field.edit.right.del.group.tip', '确定要删除该分组？'),
      onOk: () => {
        this.props.handleSideShow(null, 'side')
        this.props.handleDelLayout(layoutIndex, undefined, undefined, parentType, codes)
      }
    })
  }

  render() {
    const { layoutIndex, sideValue, modalValue, disabled, formLayoutType } = this.props
    const { fieldList, type, height, styleAttribute } = this.props.formLayout
    let style = height !== 0 ? { maxHeight: height } : null
    return (
      <div className="layout-panel-wrap" onClick={this.handleSideShow}>
        <i className="iconfont icon-shanchu" onClick={this.deletePanel} />
        <div
          className={styleAttribute === 0 ? 'layout-panel no-border' : 'layout-panel'}
          style={style}
        >
          <Fields
            disabled={disabled}
            parentType={type}
            sideValue={sideValue}
            modalValue={modalValue}
            fieldList={fieldList}
            layoutIndex={layoutIndex}
            formLayoutType={formLayoutType}
            handleSideShow={this.props.handleSideShow}
          />
        </div>
      </div>
    )
  }
}
export default Panel
