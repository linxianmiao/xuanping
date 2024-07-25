import React from 'react'
import FormItem from '../components/formItem'
import classnames from 'classnames'
import { getOlaOverdueName } from '~/logic/olaAndSla'

class OlaStatus extends React.Component {
  render() {
    const { fieldMinCol, field, formLayoutType, olaAndSlaInfo, source } = this.props
    const { ola: olaInfo } = olaAndSlaInfo || {}
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
        {source === 'formset' ? (
          <div className="detail-looks-sheet-content">
            {/* <i className="overdue-icon overdue-icon-ola" style={{ background: 'red' }} /> */}
            <span className="ticket-list-table-th-status">
              <i style={{ background: 'red' }} />
            </span>
            <span className="overdue-message">逾期：N分钟</span>
          </div>
        ) : (
          <div className="detail-looks-sheet-content">
            {/* <i
              className="overdue-icon overdue-icon-ola"
              style={{ background: olaInfo?.markColor }}
            /> */}
            <span className="ticket-list-table-th-status">
              <i style={{ background: olaInfo?.markColor }} />
            </span>
            <span className="overdue-message">
              {olaInfo
                ? `${getOlaOverdueName(olaInfo?.overdueStatus)}: ${olaInfo?.overdueTime}`
                : '--'}
            </span>
          </div>
        )}
      </FormItem>
    )
  }
}

export default OlaStatus
