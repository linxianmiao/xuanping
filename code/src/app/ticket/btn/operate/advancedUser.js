import React, { Component } from 'react'
import { Form } from '@uyun/components'
import UserPicker from '~/components/userPicker'
const FormItem = Form.Item
class AdvancedUser extends Component {
  static defaultProps = {
    setFlowUser: () => {}
  }

  componentDidUpdate(prevProps) {
    const { defaultStaff } = this.props

    if (!_.isEmpty(defaultStaff) && !prevProps.defaultStaff) {
      this.setFlowUser(defaultStaff)
    }
  }

  setFlowUser = (list) => {
    const users = _.chain(list)
      .filter((item) => item.type === 1)
      .map((item) => item.id)
      .value()
    const groups = _.chain(list)
      .filter((item) => item.type === 0)
      .map((item) => item.id)
      .value()
    !_.isEmpty(users) && this.props.setFlowUser(this.props.item, 'user', users, groups)
    !_.isEmpty(groups) && this.props.setFlowUser(this.props.item, 'userGroup', groups, users)
  }

  render() {
    const {
      item,
      getFieldDecorator,
      ticketId,
      modelId,
      flowId,
      handleType,
      tacheId,
      caseId,
      formList: form,
      isMultiCountersign,
      chartId,
      defaultStaff
    } = this.props

    // 改派的时候如果是多组会签的改派则只能选组，人的改派可以选人和组
    const tabs = handleType === 'reassign' && isMultiCountersign ? ['groups'] : ['groups', 'users']

    return (
      <FormItem label={item.showName === false ? '' : item.name}>
        {getFieldDecorator(item.code, {
          initialValue: defaultStaff || undefined,
          rules: [
            {
              required: item.isRequired === 1,
              message: `${i18n('globe.select', '请选择')}${item.name}`
            }
          ],
          getValueFromEvent: (list) => {
            this.setFlowUser(list)
            return list
          }
        })(
          <UserPicker
            showTypes={tabs}
            method="post"
            selectionType="checkbox"
            mutex={handleType === 'reassign'}
            // mode={'approve'}
            extendQuery={{ ticketId, modelId, flowId, handleType, tacheId, caseId, form, chartId }}
          />
        )}
      </FormItem>
    )
  }
}
export default AdvancedUser
