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
    this.props.basicInfoStore.setManagerList(data)
  }

  render() {
    const { formItemLayout, item, basicInfoStore, getFieldDecorator } = this.props
    const modelManager = mobx.toJS(basicInfoStore.modelManager)
    return (
      <FormItem
        {...formItemLayout}
        label={
          <span>
            {item.name}&nbsp;
            <Tooltip title={i18n('conf.model.basic.specifyTitle', '谁可以管理当前流程模型')}>
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator(item.code, {
          initialValue: modelManager || []
        })(
          <UserPicker
            extendQuery={{ scope: 0 }} // xuj让写死
            onChange={this.onChange}
            tabs={[0, 1, 2]}
            showTypes={['groups', 'users', 'departs_custom']}
          />
        )}
      </FormItem>
    )
  }
}

export default SelectUser
