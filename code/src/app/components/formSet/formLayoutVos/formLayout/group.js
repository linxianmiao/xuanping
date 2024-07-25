import React, { Component } from 'react'
import { Collapse, Modal, message } from '@uyun/components'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import Fields from './fields'
const Panel = Collapse.Panel

@observer
class Group extends Component {
  static defaultProps = {
    handleDelLayout: () => {},
    handleSideShow: () => {}
  }

  state = {
    activeKey: '1'
  }

  getExtra = () => {
    const { linkageStrategyVos } = this.props.formLayout

    return this.props.disabled ? null : (
      <>
        <i
          className={classnames('icon-guanlian iconfont', {
            active: !_.isEmpty(linkageStrategyVos)
          })}
          onClick={(e) => {
            e.stopPropagation()
            if (this.props.allFields.length > 0) {
              this.handleSideShow(e, 'modal', 'group')
            } else {
              message.warning('稍等，加载中')
            }
          }}
        />
        <i onClick={this.handleDel} className="iconfont icon-shanchu" />
      </>
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

  handleClick = () => {
    this.setState({
      activeKey: this.state.activeKey === '1' ? '0' : '1'
    })
  }

  handleSideShow = (e, type, source) => {
    e.stopPropagation()

    const { layoutIndex, tabsIndex, fieldIndex, parentType } = this.props
    this.props.handleSideShow(
      {
        layoutIndex: layoutIndex,
        tabsIndex,
        fieldIndex,
        parentType
      },
      type,
      source
    )
  }

  render() {
    const { layoutIndex, sideValue, modalValue, disabled, formLayoutType } = this.props
    const { name, fieldList, type } = this.props.formLayout
    const { activeKey } = this.state
    return (
      <Collapse onChange={this.handleClick} activeKey={activeKey} className="header-group">
        <Collapse.Card
          header={<span onClick={this.handleSideShow}>{name}</span>}
          extra={this.getExtra()}
          key="1"
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
        </Collapse.Card>
      </Collapse>
    )
  }
}
export default Group
