import React from 'react'
import { LeftSquareOutlined, RightSquareOutlined } from '@uyun/icons'
import CurrentTache from '~/details/BasicInfo/CurrentTache'
import FormItem from '../components/formItem'
import classnames from 'classnames'

class CurrentTacheForm extends React.Component {
  render() {
    const { fieldMinCol, field, formLayoutType, source } = this.props
    const { tacheName, activityType, ticketId, caseId, tacheId } = this?.props?.forms || {}
    let tacheName2 = source === 'formset' ? '当前节点' : tacheName
    const isTicketField = field.type === 'ticketField'
    if (source === 'formset') {
      return (
        <FormItem
          fieldMinCol={fieldMinCol}
          field={field}
          className={classnames('current-tache-form-wrap', {
            'table-style-item': formLayoutType,
            'ticket-field': isTicketField
          })}
        >
          <div style={{ minWidth: 100 }}>
            <LeftSquareOutlined />
            <span>{tacheName2}</span>
            <RightSquareOutlined />
          </div>
        </FormItem>
      )
    }

    return (
      <FormItem
        fieldMinCol={fieldMinCol}
        field={field}
        className={classnames('current-tache-form-wrap', {
          'table-style-item': formLayoutType,
          'ticket-field': isTicketField
        })}
      >
        <CurrentTache
          name={tacheName2}
          type={activityType}
          params={{ ticketId, caseId, tacheId }}
        />
      </FormItem>
    )
  }
}

export default CurrentTacheForm
