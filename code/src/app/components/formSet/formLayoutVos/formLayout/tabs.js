import React, { Component } from 'react'
import { Modal, Tabs } from '@uyun/components'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import Fields from './fields'

const { TabPane } = Tabs

@observer
class TabsLayout extends Component {
  static defaultProps = {
    handleDelLayout: () => {},
    handleSideShow: () => {}
  }

  constructor(props) {
    super(props)
    const { tabs } = props.formLayout
    this.state = {
      activeKey: tabs[0].id
    }
  }

  handleClick = (activeKey) => {
    this.setState({ activeKey })
  }

  handleSideShow = () => {
    const { layoutIndex, tabsIndex, fieldIndex, parentType } = this.props
    this.props.handleSideShow(
      {
        layoutIndex: layoutIndex,
        tabsIndex,
        fieldIndex,
        parentType
      },
      'side'
    )
  }

  handleDel = (e) => {
    e.stopPropagation()
    const { layoutIndex, parentType } = this.props
    const { tabs } = this.props.formLayout
    const codes = _.chain(toJS(tabs))
      .map((tab) => tab.fieldList)
      .flatten()
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
    const { tabs, type } = this.props.formLayout
    const { activeKey } = this.state

    return (
      <div className="layout-tabs">
        <Tabs
          activeKey={activeKey}
          onChange={this.handleClick}
          onTabClick={this.handleSideShow}
          tabBarExtraContent={
            !disabled ? <i onClick={this.handleDel} className="iconfont icon-shanchu" /> : null
          }
        >
          {tabs.map((tab) => {
            return <TabPane key={tab.id} tab={tab.name} />
          })}
        </Tabs>
        <section className="tabs-section">
          {_.map(tabs, (tab, index) => {
            return (
              <div
                key={tab.id}
                className={classnames({
                  'tabs-section-hidden': activeKey !== tab.id
                })}
              >
                <Fields
                  disabled={disabled}
                  parentType={type}
                  tabsIndex={index}
                  sideValue={sideValue}
                  layoutIndex={layoutIndex}
                  fieldList={tab.fieldList}
                  modalValue={modalValue}
                  formLayoutType={formLayoutType}
                  handleSideShow={this.props.handleSideShow}
                />
              </div>
            )
          })}
        </section>
      </div>
    )
  }
}

export default TabsLayout
