import React, { Component } from 'react'
import { QuestionCircleOutlined } from '@uyun/icons'
import { Tooltip, Tabs } from '@uyun/components'
import { getFieldsCode, checkFieldsError } from './utils/scriptfunc'
import classnames from 'classnames'
import Fields from './fields'
import styles from './index.module.less'

const { TabPane } = Tabs

export default class FormsTab extends Component {
  constructor(props) {
    super(props)
    this.autoPlanRef = React.createRef()
  }
  onSubmitAutoPlan = () => {
    return this.autoPlanRef?.current?.onSubmitAutoPlan()
  }
  onValidateAutoPlan = () => {
    return this.autoPlanRef?.current?.onValidateAutoPlan()
  }
  state = {
    activeKey: this.props.item.tabs[0].id
  }

  getShowIds = (item) =>
    _.chain(item.tabs)
      .filter((item) => !item.hidden)
      .map((item) => item.id)
      .value()

  componentWillReceiveProps(nextProps) {
    const curr = this.getShowIds(this.props.item)
    const next = this.getShowIds(nextProps.item)
    if (!_.isEqual(curr, next)) {
      this.handleClick(_.head(next))
    }
  }

  handleClick = (activeKey) => {
    this.setState({ activeKey })
  }

  render() {
    const { item, getFieldsError, handOk } = this.props
    const { tabs, description } = item
    const { activeKey } = this.state
    const tabsHidden = _.every(tabs, (tab) => tab.hidden)
    return (
      <div
        className={classnames('froms-group-wrap', {
          [styles.widgetHidden]: tabsHidden
        })}
      >
        <div className={styles.formLayoutTabs}>
          <header className={styles.tabsHeader}>
            {_.map(tabs, (tab) => {
              const codes = getFieldsCode(tab.fieldList, null, 'hidden')
              const isFieldsError = checkFieldsError(getFieldsError(codes))
              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    this.handleClick(tab.id)
                  }}
                  className={classnames({
                    [styles.active]: activeKey === tab.id,
                    [styles.widgetHidden]: tab.hidden,
                    [styles.tabError]: isFieldsError
                  })}
                >
                  {tab.name}
                </div>
              )
            })}
          </header>
          <section className={styles.tabsSection}>
            {_.map(tabs, (tab) => {
              return (
                <div
                  key={tab.id}
                  className={classnames({
                    [styles.active]: activeKey === tab.id,
                    [styles.tabHidden]: activeKey !== tab.id,
                    [styles.widgetHidden]: tab.hidden
                  })}
                >
                  <Fields
                    {...this.props}
                    fieldList={tab.fieldList}
                    ref={this.autoPlanRef}
                    handleOk={handOk}
                  />
                </div>
              )
            })}
          </section>
        </div>
        {description && (
          <Tooltip placement="leftBottom" title={<div className="pre-wrap">{description}</div>}>
            <QuestionCircleOutlined />
          </Tooltip>
        )}
      </div>
    )
  }
}
