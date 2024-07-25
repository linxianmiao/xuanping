import React from 'react'
import { Tag } from '@uyun/components'
import UserNameWithTip from '~/ticket/log/UserNameWithTip'
import FormItem from '../components/formItem'
import classnames from 'classnames'

class Creator extends React.Component {
  render() {
    const { fieldMinCol, field, formLayoutType, forms } = this.props
    const { allUserInfos = [], creatId } = forms || {}
    const creatorName = _.find(allUserInfos, (userInfo) => userInfo.userId === creatId)
    const isTicketField = field.type === 'ticketField'
    return (
      <FormItem
        fieldMinCol={fieldMinCol}
        field={field}
        className={classnames({
          'table-style-item': formLayoutType,
          'ticket-field': isTicketField
        })}
      >
        {creatorName ? <UserNameWithTip user={creatorName} source="basic" /> : <Tag>管理员</Tag>}
      </FormItem>
    )
  }
}

export default Creator
