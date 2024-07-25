import React from 'react'
import Item from './item'
import { inject, observer } from 'mobx-react'
import './index.less'
import { TicketFieldList } from '../../configuration'

@inject('formSetGridStore')
@observer
class TicketFields extends React.Component {
  render() {
    const { currentGrid, type } = this.props.formSetGridStore
    const { formLayoutType } = currentGrid

    return (
      <ul className="ticket-field-list">
        {_.map(TicketFieldList, (item) => {
          const { code, name } = item
          let canDrag = !_.some(currentGrid.fieldList, (field) => field.code === code)
          if (type === 'template') {
            canDrag = canDrag ? code !== 'title' : canDrag
          }
          return (
            <Item key={item.code} item={item} canDrag={canDrag} formLayoutType={formLayoutType} />
          )
        })}
      </ul>
    )
  }
}

export default TicketFields
