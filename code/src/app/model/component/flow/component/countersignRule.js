import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, Tag } from '@uyun/components'
import CountersignRuleModal from './countersignRuleModal'
import '../../style/countersign.less'

class CountersignRule extends Component {
  constructor(props) {
    super(props)
    this.countersignRules = React.createRef()
    this.state = {
      visible: false,
      rule: {}
    }
  }

  static contextTypes = {
    modelId: PropTypes.string
  }

  handleChangeVisible = (visible, rule) => {
    this.setState({ visible, rule })
  }

  handleOk = async () => {
    const { rule } = this.state
    let { handlersRulesVos } = this.props
    const res = await this.countersignRules.current.validate()
    if (_.isEmpty(rule)) {
      this.props.handleUserChange([...handlersRulesVos, res], 'handlersRulesVos')
    } else {
      handlersRulesVos = _.map(handlersRulesVos, (item) => {
        if (res.rulesId === item.rulesId) {
          return res
        }
        return item
      })
      this.props.handleUserChange(handlersRulesVos, 'handlersRulesVos')
    }
    this.handleChangeVisible(false, {})
  }

  handleRemove = (e, id) => {
    e.stopPropagation()
    let { handlersRulesVos } = this.props
    handlersRulesVos = _.filter(handlersRulesVos, (item) => item.rulesId !== id)
    this.props.handleUserChange(handlersRulesVos, 'handlersRulesVos')
  }

  render() {
    const { handlersRulesVos } = this.props
    const { visible, rule } = this.state
    return (
      <div className="counter-sign-wrap">
        {_.map(handlersRulesVos, (rule) => {
          return (
            <Tag
              className="tag-button"
              key={rule.rulesId}
              onClick={() => {
                this.handleChangeVisible(true, rule)
              }}
            >
              <span>{rule.rulesName}</span>
              <i
                className="iconfont icon-guanbi1"
                onClick={(e) => {
                  this.handleRemove(e, rule.rulesId)
                }}
              />
            </Tag>
          )
        })}
        <Button
          size="small"
          type="dashed"
          block
          onClick={() => {
            this.handleChangeVisible(true, {})
          }}
        >
          {i18n('model-flow-add-handlersRulesVos', '添加规则')}
        </Button>
        <Modal
          title={
            _.isEmpty(rule)
              ? i18n('model-flow-add-handlersRulesVos-tip1', '新增规则')
              : rule.rulesName
          }
          size="large"
          destroyOnClose
          visible={visible}
          onOk={this.handleOk}
          onCancel={() => {
            this.handleChangeVisible(false, {})
          }}
          width={900}
        >
          <CountersignRuleModal
            rule={rule}
            modelId={this.context.modelId}
            wrappedComponentRef={this.countersignRules}
          />
        </Modal>
      </div>
    )
  }
}

export default CountersignRule
