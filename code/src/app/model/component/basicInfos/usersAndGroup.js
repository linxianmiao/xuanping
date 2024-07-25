import React, { Component } from 'react'
import { QuestionCircleOutlined } from '@uyun/icons'
import { Form, Tooltip } from '@uyun/components'
import * as mobx from 'mobx'
import { observer, inject } from 'mobx-react'
import UserPicker from '~/components/userPicker'
import '../style/selectUser.less'

const FormItem = Form.Item

@inject('basicInfoStore')
@observer
class SelectUser extends Component {
  onChange = (data) => {
    this.props.basicInfoStore.setUserAndGroup(data)
  }

  render() {
    const { formItemLayout, item, basicInfoStore, getFieldDecorator } = this.props
    const authorizedUsers = mobx.toJS(basicInfoStore.authorizedUsers)
    const isShared = mobx.toJS(basicInfoStore.isShared)
    return (
      <FormItem
        {...formItemLayout}
        label={
          <span>
            {item.name}&nbsp;
            <Tooltip title={i18n('conf.model.basic.addUserTitle', '谁可以发起当前流程审批')}>
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator('authorizedUsers', {
          initialValue: authorizedUsers || []
        })(
          <UserPicker
            extendQuery={{ scope: isShared }}
            onChange={this.onChange}
            tabs={[0, 1, 2, 6]}
            showTypes={['groups', 'users', 'departs_custom', 'matri_custom']}
          />
        )}
      </FormItem>
    )
  }
}

export default SelectUser
